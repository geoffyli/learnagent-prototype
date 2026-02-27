import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, ChevronRight, CircleDot, SendHorizontal, WandSparkles } from 'lucide-react';
import { CONTENT_PACK_LABELS, type ContentPackId } from '../data/richReplies';
import {
  AnySessionRecord,
  BranchIntent,
  ChatMessage,
  MainSessionPhase,
  MainSessionRecord,
  SessionNode,
  SkillNodeStatus,
} from '../types/session-graph';
import { MOTION_DURATION, springFor, tweenFor } from '../motion/tokens';
import { fadeSlideY, staggerContainer } from '../motion/variants';

interface SessionChatProps {
  activeNode: SessionNode;
  activeSession: AnySessionRecord;
  mainPhase: MainSessionPhase;
  activeSkillNodeId?: string;
  activeSkillStatus?: SkillNodeStatus | null;
  onSendMessage: (message: string, options?: { displayMessage?: string }) => void;
  onCreateBranch: (kind: 'ask' | 'explain', selectedText: string) => void;
  onAdvancePlanning: () => void;
  onFinishPlanning: () => void;
  onCompleteSkill?: (skillNodeId: string) => void;
}

interface SelectionPopover {
  text: string;
  x: number;
  y: number;
}

interface QuickAction {
  label: string;
  prompt: string;
  category?: 'content' | 'question';
}

const CONTENT_ACTION_PACKS: ContentPackId[] = [
  'hooks-lifecycle-map',
  'effect-dependency-timeline',
  'state-vs-reducer-tradeoff',
  'stale-closure-debug-trace',
  'async-fetching-safety-checklist',
  'performance-playbook',
];

const CONTENT_QUICK_ACTIONS: QuickAction[] = CONTENT_ACTION_PACKS.map((packId) => ({
  label: CONTENT_PACK_LABELS[packId],
  prompt: `@content:${packId}`,
  category: 'content',
}));

function getQuickActions(kind: SessionNode['kind'], mainPhase: MainSessionPhase): QuickAction[] {
  if (kind === 'main' && mainPhase === 'planning') {
    return [];
  }

  if (kind === 'main') {
    return [
      { label: 'Which hook should I learn next?', prompt: 'Which hook should I learn next?' },
      { label: 'Show useState vs useEffect', prompt: 'Show me a useState vs useEffect comparison' },
      { label: 'When to create custom hooks?', prompt: 'When should I create a custom hook?' },
    ];
  }

  if (kind === 'topic') {
    return [
      ...CONTENT_QUICK_ACTIONS,
      { label: 'Common mistakes?', prompt: 'What are common mistakes?' },
      { label: 'Quiz me on this', prompt: 'Quiz me on this' },
    ];
  }

  if (kind === 'branch') {
    return [
      ...CONTENT_QUICK_ACTIONS,
      { label: 'Show practical example', prompt: 'Show me a practical example' },
      { label: 'Common mistake here?', prompt: 'What is a common mistake with this?' },
    ];
  }

  return [
    ...CONTENT_QUICK_ACTIONS,
    { label: 'Explain with analogy', prompt: 'Explain this with an analogy' },
    { label: 'One-sentence mental model', prompt: 'Give me the one-sentence mental model' },
  ];
}

function messageStyle(message: ChatMessage): string {
  if (message.role === 'assistant') {
    return 'bg-white text-slate-800 border border-slate-200';
  }
  if (message.role === 'system') {
    return 'bg-amber-50 text-amber-900 border border-amber-200';
  }
  return 'bg-teal-600 text-white border border-teal-500';
}

export default function SessionChat({
  activeNode,
  activeSession,
  mainPhase,
  activeSkillNodeId,
  activeSkillStatus,
  onSendMessage,
  onCreateBranch,
  onAdvancePlanning,
  onFinishPlanning,
  onCompleteSkill,
}: SessionChatProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const [inputsBySession, setInputsBySession] = useState<Record<string, string>>({});
  const [selectionPopover, setSelectionPopover] = useState<SelectionPopover | null>(null);
  const [selectionText, setSelectionText] = useState('');
  const scrollerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const input = inputsBySession[activeSession.id] ?? '';

  const quickActions = useMemo(
    () => getQuickActions(activeNode.kind, mainPhase),
    [activeNode.kind, mainPhase],
  );

  const quickActionKey = `${activeNode.kind}-${mainPhase}`;

  const getSelectionState = useCallback((): SelectionPopover | null => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      return null;
    }

    const text = selection.toString().replace(/\s+/g, ' ').trim();
    if (text.length < 3) {
      return null;
    }

    const range = selection.getRangeAt(0);
    const node = range.commonAncestorContainer;
    const element =
      node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element);

    if (!element) {
      return null;
    }

    const selectableRegion = element.closest('[data-selectable="true"]');
    const scroller = scrollerRef.current;
    if (!selectableRegion || !scroller || !scroller.contains(selectableRegion)) {
      return null;
    }

    const rect = range.getBoundingClientRect();
    const containerRect = scroller.getBoundingClientRect();

    return {
      text,
      x: rect.left - containerRect.left + rect.width / 2 + scroller.scrollLeft,
      y: rect.top - containerRect.top + scroller.scrollTop - 10,
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [activeSession.messages, reducedMotion]);

  useEffect(() => {
    const handleSelectionChange = () => {
      const current = getSelectionState();
      if (!current) {
        setSelectionText('');
        setSelectionPopover(null);
        return;
      }
      setSelectionText(current.text);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [getSelectionState]);

  const clearNativeSelection = () => {
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }
    setSelectionPopover(null);
    setSelectionText('');
  };

  const handleMouseUpSelection = () => {
    const current = getSelectionState();
    if (!current) {
      setSelectionPopover(null);
      setSelectionText('');
      return;
    }
    setSelectionText(current.text);
    setSelectionPopover(current);
  };

  const submitInput = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }
    onSendMessage(trimmed);
    setInputsBySession((prev) => ({ ...prev, [activeSession.id]: '' }));
    clearNativeSelection();
  };

  const submitQuickAction = (action: QuickAction) => {
    onSendMessage(action.prompt, {
      displayMessage: action.label,
    });
    setInputsBySession((prev) => ({ ...prev, [activeSession.id]: '' }));
    clearNativeSelection();
  };

  const sessionTypeLabel =
    activeSession.kind === 'main'
      ? mainPhase === 'planning' ? 'Planning' : 'Main'
      : activeSession.kind === 'topic'
        ? 'Topic'
        : ((activeSession as { intent?: BranchIntent }).intent ?? 'Branch').replace(/^./, (letter) => letter.toUpperCase());

  return (
    <div className="panel-surface flex h-full flex-col overflow-hidden">
      <motion.div className="border-b border-white/50 px-4 py-3" variants={fadeSlideY(reducedMotion, 6)}>
        <div className="flex items-center justify-between">
          <p className="line-clamp-1 font-heading text-sm font-semibold text-slate-900">
            {activeNode.title}
          </p>
          <span className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-600">
            {sessionTypeLabel}
          </span>
        </div>
      </motion.div>

      <div
        ref={scrollerRef}
        onMouseUp={handleMouseUpSelection}
        className="relative min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5"
      >
        <div aria-live="polite" aria-relevant="additions text" className="space-y-4">
          <AnimatePresence initial={false}>
            {activeSession.messages.map((message) => {
              const isUser = message.role === 'user';
              return (
                <motion.div
                  key={message.id}
                  layout
                  initial={{
                    opacity: 0,
                    x: reducedMotion ? 0 : isUser ? 12 : -12,
                    y: reducedMotion ? 0 : 4,
                  }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, x: reducedMotion ? 0 : isUser ? 6 : -6 }}
                  transition={tweenFor(reducedMotion, MOTION_DURATION.base)}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    data-selectable={message.role === 'assistant' || message.role === 'system'}
                    className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${messageStyle(message)}`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className="mt-2 text-[11px] opacity-65">{message.timestamp}</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {selectionPopover && (
            <motion.div
              className="absolute z-30 -translate-x-1/2 -translate-y-full rounded-xl border border-slate-200 bg-white p-2 shadow-lg"
              style={{ left: selectionPopover.x, top: selectionPopover.y }}
              initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.96, y: reducedMotion ? 0 : 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: reducedMotion ? 1 : 0.96, y: reducedMotion ? 0 : 4 }}
              transition={tweenFor(reducedMotion, MOTION_DURATION.fast)}
            >
              <p className="mb-2 max-w-[220px] text-[11px] text-slate-500">
                Branch from selected text:
              </p>
              <div className="flex gap-2">
                <motion.button
                  type="button"
                  onClick={() => {
                    onCreateBranch('ask', selectionPopover.text);
                    clearNativeSelection();
                  }}
                  whileTap={reducedMotion ? undefined : { scale: 0.97 }}
                  className="rounded-lg bg-cyan-50 px-3 py-1.5 text-xs font-medium text-cyan-700 transition hover:bg-cyan-100"
                >
                  Ask
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => {
                    onCreateBranch('explain', selectionPopover.text);
                    clearNativeSelection();
                  }}
                  whileTap={reducedMotion ? undefined : { scale: 0.97 }}
                  className="rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700 transition hover:bg-orange-100"
                >
                  Explain
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!selectionPopover && selectionText && (
            <motion.div
              className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-xl border border-slate-200 bg-white/95 p-2 shadow-lg backdrop-blur-sm"
              initial={{ opacity: 0, y: reducedMotion ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reducedMotion ? 0 : 6 }}
              transition={tweenFor(reducedMotion, MOTION_DURATION.fast)}
            >
              <p className="mb-2 max-w-[250px] text-[11px] text-slate-500">
                Branch from selected text (keyboard accessible):
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onCreateBranch('ask', selectionText);
                    clearNativeSelection();
                  }}
                  className="rounded-lg bg-cyan-50 px-3 py-1.5 text-xs font-medium text-cyan-700 transition hover:bg-cyan-100"
                >
                  Ask
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onCreateBranch('explain', selectionText);
                    clearNativeSelection();
                  }}
                  className="rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700 transition hover:bg-orange-100"
                >
                  Explain
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={endRef} />
      </div>

      {mainPhase === 'planning' && activeSession.kind === 'main' && (() => {
        const planning = (activeSession as MainSessionRecord).planning;
        if (!planning) return null;
        const activeStep = planning.steps.find((s) => s.state === 'active');
        const doneCount = planning.steps.filter((s) => s.state === 'done').length;
        const total = planning.steps.length;
        const allDone = doneCount === total;

        return (
          <motion.div
            className="border-t border-amber-100 bg-amber-50/80 px-4 py-3"
            initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={tweenFor(reducedMotion, MOTION_DURATION.base)}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {planning.steps.map((step) => (
                    <motion.span
                      key={step.id}
                      className="inline-block h-1.5 w-5 rounded-full"
                      animate={{
                        backgroundColor:
                          step.state === 'done'
                            ? '#14b8a6'
                            : step.state === 'active'
                              ? '#f59e0b'
                              : '#e2e8f0',
                        scaleY: step.state === 'active' && !reducedMotion ? [1, 1.25, 1] : 1,
                      }}
                      transition={
                        step.state === 'active' && !reducedMotion
                          ? {
                              duration: 1.2,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }
                          : tweenFor(reducedMotion, MOTION_DURATION.fast)
                      }
                    />
                  ))}
                </div>
                <span className="text-[11px] font-medium text-amber-800">
                  {allDone ? 'Plan ready' : `Planning · Step ${doneCount + 1} of ${total}`}
                </span>
              </div>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {activeStep && !allDone && (
                <motion.div
                  key={activeStep.id}
                  className="mb-2 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2"
                  initial={{ opacity: 0, y: reducedMotion ? 0 : 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reducedMotion ? 0 : -6 }}
                  transition={tweenFor(reducedMotion, MOTION_DURATION.fast)}
                >
                  <CircleDot className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900">{activeStep.title}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">{activeStep.details}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {planning.report && (
              <motion.div
                className="mb-2 rounded-xl border border-teal-200 bg-white px-3 py-2 text-xs text-slate-700"
                initial={{ opacity: 0, y: reducedMotion ? 0 : 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={tweenFor(reducedMotion, MOTION_DURATION.fast)}
              >
                <p className="font-semibold text-teal-800">Plan ready — {planning.report.milestones.length} milestones</p>
                <p className="mt-0.5 line-clamp-1 text-slate-500">{planning.report.goal}</p>
              </motion.div>
            )}

            <div className="flex gap-2">
              <motion.button
                type="button"
                onClick={onAdvancePlanning}
                disabled={allDone}
                whileHover={!reducedMotion && !allDone ? { y: -1 } : undefined}
                whileTap={!reducedMotion && !allDone ? { scale: 0.98 } : undefined}
                transition={springFor(reducedMotion, 'snappy')}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-3 py-2 text-xs font-medium text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              >
                <ChevronRight className="h-3.5 w-3.5" />
                {allDone ? 'All steps done' : 'Continue'}
              </motion.button>

              <motion.button
                type="button"
                onClick={onFinishPlanning}
                disabled={!planning.report}
                whileHover={!reducedMotion && planning.report ? { y: -1 } : undefined}
                whileTap={!reducedMotion && planning.report ? { scale: 0.98 } : undefined}
                transition={springFor(reducedMotion, 'snappy')}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Start Learning
              </motion.button>
            </div>
          </motion.div>
        );
      })()}

      {activeNode.kind === 'topic' && activeSkillNodeId && (
        <div className="border-t border-teal-100 bg-teal-50/60 px-4 py-3">
          <motion.button
            type="button"
            onClick={() => onCompleteSkill?.(activeSkillNodeId)}
            disabled={activeSkillStatus !== 'in-progress'}
            whileHover={reducedMotion || activeSkillStatus !== 'in-progress' ? undefined : { y: -1 }}
            whileTap={reducedMotion || activeSkillStatus !== 'in-progress' ? undefined : { scale: 0.98 }}
            transition={springFor(reducedMotion, 'snappy')}
            className="inline-flex w-full items-center justify-center rounded-xl bg-teal-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
          >
            {activeSkillStatus === 'completed' ? 'Skill Completed' : 'Mark Skill Complete'}
          </motion.button>
        </div>
      )}

      <div className="border-t border-white/50 bg-white/55 px-4 py-4">
        {quickActions.length > 0 && (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={quickActionKey}
              className="mb-3 flex flex-wrap gap-2"
              variants={staggerContainer(reducedMotion, 0.04)}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: reducedMotion ? 0 : -4, transition: tweenFor(reducedMotion, MOTION_DURATION.fast, 'exit') }}
            >
              {quickActions.map((action) => (
                <motion.button
                  key={`${action.label}-${action.prompt}`}
                  type="button"
                  onClick={() => submitQuickAction(action)}
                  variants={fadeSlideY(reducedMotion, 6, MOTION_DURATION.fast)}
                  whileHover={reducedMotion ? undefined : { y: -1 }}
                  whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    action.category === 'content'
                      ? 'border-violet-200 bg-violet-50 text-violet-700 hover:border-violet-300'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:text-teal-700'
                  }`}
                >
                  {action.label}
                </motion.button>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <WandSparkles className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={input}
              onChange={(event) =>
                setInputsBySession((prev) => ({
                  ...prev,
                  [activeSession.id]: event.target.value,
                }))
              }
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  submitInput(input);
                }
              }}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
              placeholder="Type a message..."
            />
          </div>
          <motion.button
            type="button"
            onClick={() => submitInput(input)}
            whileTap={reducedMotion ? undefined : { scale: 0.96 }}
            transition={springFor(reducedMotion, 'snappy')}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white transition hover:bg-teal-700"
          >
            <SendHorizontal className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
