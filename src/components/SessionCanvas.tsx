import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  BookOpen,
  CheckCircle2,
  CircleDot,
  HelpCircle,
  Lightbulb,
  Lock,
  RotateCcw,
  TreePine,
} from 'lucide-react';
import {
  AgentNodeSuggestion,
  MainSessionPhase,
  PlanningState,
  SessionNode,
  SkillNode,
  SkillNodeStatus,
} from '../types/session-graph';
import { MOTION_DURATION, springFor, tweenFor } from '../motion/tokens';
import { fadeSlideY, staggerContainer } from '../motion/variants';
import { sortBranchNodesForLayout } from '../state/session-node-order';

interface SessionCanvasProps {
  nodes: SessionNode[];
  activeSessionId: string;
  activeSuggestions: AgentNodeSuggestion[];
  skillNodes: SkillNode[];
  mainPhase: MainSessionPhase;
  planningState: PlanningState | null;
  onSelectSession: (sessionId: string) => void;
  onSelectSkillNode: (skillNodeId: string) => void;
  onAcceptSuggestion: (suggestionId: string) => void;
  onDismissSuggestion: (suggestionId: string) => void;
}

const statusDot: Record<SkillNodeStatus, string> = {
  locked: 'bg-slate-300',
  available: 'bg-teal-400',
  'in-progress': 'bg-amber-400',
  completed: 'bg-emerald-500',
};

const statusLabel: Record<SkillNodeStatus, string> = {
  locked: 'Locked',
  available: 'Ready',
  'in-progress': 'In Progress',
  completed: 'Done',
};

function nodeMeta(node: SessionNode): { label: string; icon: JSX.Element; tone: string } {
  if (node.kind === 'main') {
    return {
      label: 'Main',
      icon: <TreePine className="h-4 w-4" />,
      tone: 'text-teal-700 bg-teal-100 border-teal-200',
    };
  }

  if (node.kind === 'topic') {
    return {
      label: 'Topic',
      icon: <BookOpen className="h-4 w-4" />,
      tone: 'text-violet-700 bg-violet-100 border-violet-200',
    };
  }

  if (node.intent === 'ask') {
    return {
      label: 'Ask',
      icon: <HelpCircle className="h-4 w-4" />,
      tone: 'text-cyan-700 bg-cyan-100 border-cyan-200',
    };
  }

  if (node.intent === 'explain') {
    return {
      label: 'Explain',
      icon: <Lightbulb className="h-4 w-4" />,
      tone: 'text-orange-700 bg-orange-100 border-orange-200',
    };
  }

  return {
    label: node.intent ? node.intent.charAt(0).toUpperCase() + node.intent.slice(1) : 'Branch',
    icon: <CircleDot className="h-4 w-4" />,
    tone: 'text-slate-700 bg-slate-100 border-slate-200',
  };
}

const NODE_W = 200;
const NODE_H = 90;
const TOPIC_X = 40;
const TOPIC_Y = 60;
const COL_GAP_X = 260;
const ROW_GAP_Y = 120;

interface Point {
  x: number;
  y: number;
}

function computeGraphLayout(topicNode: SessionNode | undefined, branchNodes: SessionNode[]) {
  const positions: Record<string, Point> = {};
  if (!topicNode) return { positions, canvasH: 300, canvasW: 520 };

  positions[topicNode.id] = { x: TOPIC_X, y: TOPIC_Y };

  const topicDepth = topicNode.depth;
  const colCounters: Record<number, number> = {};
  const sorted = [...branchNodes].sort((a, b) => a.depth - b.depth);

  sorted.forEach((n) => {
    const col = n.depth - topicDepth;
    const rowIndex = colCounters[col] ?? 0;
    colCounters[col] = rowIndex + 1;
    positions[n.id] = {
      x: TOPIC_X + col * COL_GAP_X,
      y: TOPIC_Y + rowIndex * ROW_GAP_Y,
    };
  });

  const maxCol = Math.max(0, ...Object.keys(colCounters).map(Number));
  const maxRows = Math.max(1, ...Object.values(colCounters));
  const canvasW = TOPIC_X + (maxCol + 1) * COL_GAP_X + NODE_W + 40;
  const canvasH = Math.max(300, TOPIC_Y + maxRows * ROW_GAP_Y + 60);
  return { positions, canvasH, canvasW };
}

function PlanningPlaceholder({
  planningState,
  reducedMotion,
}: {
  planningState: PlanningState | null;
  reducedMotion: boolean;
}) {
  return (
    <motion.div className="flex h-full min-h-[300px] items-center justify-center p-8" variants={fadeSlideY(reducedMotion, 10)}>
      <motion.div className="w-full max-w-sm" variants={staggerContainer(reducedMotion, 0.06, 0.02)}>
        <motion.div className="mb-5 flex items-center gap-3" variants={fadeSlideY(reducedMotion, 8)}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100">
            <TreePine className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="font-heading text-sm font-semibold text-slate-900">Building your learning plan</p>
            <p className="text-xs text-slate-500">Skill tree will appear here when complete</p>
          </div>
        </motion.div>

        {planningState && (
          <motion.div className="space-y-2" variants={staggerContainer(reducedMotion, 0.06)}>
            {planningState.steps.map((step) => {
              const activePulse = step.state === 'active' && !reducedMotion;
              return (
                <motion.div
                  key={step.id}
                  variants={fadeSlideY(reducedMotion, 8, MOTION_DURATION.base)}
                  animate={
                    activePulse
                      ? {
                          scale: [1, 1.01, 1],
                        }
                      : { scale: 1 }
                  }
                  transition={
                    activePulse
                      ? {
                          duration: 1.6,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }
                      : tweenFor(reducedMotion, MOTION_DURATION.base)
                  }
                  className={`flex items-start gap-3 rounded-xl border px-3 py-2.5 text-xs transition-colors ${
                    step.state === 'done'
                      ? 'border-teal-200 bg-teal-50'
                      : step.state === 'active'
                        ? 'border-amber-300 bg-amber-50'
                        : 'border-slate-200 bg-white/60'
                  }`}
                >
                  {step.state === 'done' ? (
                    <motion.span
                      key={`${step.id}-done`}
                      initial={reducedMotion ? false : { scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={springFor(reducedMotion, 'snappy')}
                      className="mt-0.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-teal-600" />
                    </motion.span>
                  ) : (
                    <CircleDot className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${step.state === 'active' ? 'text-amber-500' : 'text-slate-300'}`} />
                  )}
                  <div>
                    <p className={`font-medium ${step.state === 'done' ? 'text-teal-800' : step.state === 'active' ? 'text-amber-900' : 'text-slate-400'}`}>
                      {step.title}
                    </p>
                    {step.state !== 'pending' && (
                      <p className="mt-0.5 text-slate-500">{step.details}</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function SessionCanvas({
  nodes,
  activeSessionId,
  activeSuggestions,
  skillNodes,
  mainPhase,
  planningState,
  onSelectSession,
  onSelectSkillNode,
  onAcceptSuggestion,
  onDismissSuggestion,
}: SessionCanvasProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const sortedSkillNodes = useMemo(
    () => [...skillNodes].sort((a, b) => a.col - b.col),
    [skillNodes],
  );

  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);

  const effectiveSelectedId = selectedSkillId ?? sortedSkillNodes.find(
    (n) => n.status === 'in-progress' || n.status === 'available',
  )?.id ?? sortedSkillNodes[0]?.id ?? null;

  const selectedSkill = sortedSkillNodes.find((n) => n.id === effectiveSelectedId) ?? null;

  const topicNode = useMemo(
    () => selectedSkill?.sessionId ? nodes.find((n) => n.id === selectedSkill.sessionId) : undefined,
    [selectedSkill, nodes],
  );

  const branchNodes = useMemo(() => {
    if (!effectiveSelectedId) return [];
    return sortBranchNodesForLayout(
      nodes.filter((n) => n.skillNodeId === effectiveSelectedId && n.kind === 'branch'),
    );
  }, [effectiveSelectedId, nodes]);

  const { positions, canvasH, canvasW } = useMemo(
    () => computeGraphLayout(topicNode, branchNodes),
    [topicNode, branchNodes],
  );

  const handleListClick = (skill: SkillNode) => {
    setSelectedSkillId(skill.id);
    if (skill.status !== 'locked') {
      onSelectSkillNode(skill.id);
    }
  };

  const renderSessionNode = (node: SessionNode) => {
    const pos = positions[node.id];
    if (!pos) return null;

    const isActive = node.id === activeSessionId;
    const meta = nodeMeta(node);

    return (
      <motion.button
        key={node.id}
        type="button"
        onClick={() => onSelectSession(node.id)}
        className={`session-node-card will-change-transform-opacity absolute left-0 top-0 text-left ${isActive ? 'session-node-card-active' : ''}`}
        style={{ width: NODE_W, height: NODE_H }}
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: pos.y + 10, x: pos.x }}
        animate={{
          x: pos.x,
          y: pos.y,
          opacity: 1,
          scale: 1,
        }}
        transition={{
          x: springFor(reducedMotion, 'card'),
          y: springFor(reducedMotion, 'card'),
          opacity: tweenFor(reducedMotion, MOTION_DURATION.fast),
          scale: tweenFor(reducedMotion, MOTION_DURATION.fast),
        }}
      >
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[0.95rem] ring-2 ring-teal-400/50"
          initial={false}
          animate={isActive && !reducedMotion ? { opacity: [0, 0.7, 0] } : { opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.12 : 0.45, ease: 'easeOut' }}
        />

        <div className="relative flex items-center justify-between gap-2">
          <span className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-medium ${meta.tone}`}>
            {meta.icon}
            {meta.label}
          </span>
          <span className={`h-2.5 w-2.5 rounded-full ${
            node.status === 'active' ? 'bg-teal-500'
              : node.status === 'completed' ? 'bg-emerald-500'
                : 'bg-slate-300'
          }`} />
        </div>

        <p className="relative mt-2 line-clamp-2 font-heading text-[13px] font-semibold text-slate-900">
          {node.title}
        </p>

        {node.originText && (
          <p className="relative mt-1 line-clamp-1 text-[10px] text-slate-400">
            "{node.originText}"
          </p>
        )}
      </motion.button>
    );
  };

  return (
    <motion.div className="flex h-full min-w-0 flex-col overflow-hidden" initial={false}>
      <motion.div className="border-b border-white/50 px-5 py-3" variants={fadeSlideY(reducedMotion, 8)}>
        <div className="flex items-center justify-between gap-3">
            <p className="font-heading text-base font-semibold text-slate-900">
              {mainPhase === 'learning' ? 'Data Analyst Skill Graph' : 'Learning Plan'}
            </p>
          <div className="rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1.5 text-xs text-slate-600">
            {mainPhase === 'learning' ? (
              <div className="flex items-center gap-1.5">
                <TreePine className="h-3 w-3 text-teal-600" />
                Skill tree active
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <RotateCcw className="h-3 w-3 text-slate-400" />
                Planning in progress
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {mainPhase === 'planning' ? (
        <motion.div className="min-h-0 flex-1 overflow-auto p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={tweenFor(reducedMotion, MOTION_DURATION.base)}>
          <div className="h-full rounded-2xl border border-slate-200/70 bg-white/70">
            <PlanningPlaceholder planningState={planningState} reducedMotion={reducedMotion} />
          </div>
        </motion.div>
      ) : (
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="flex w-60 shrink-0 flex-col border-r border-slate-200/70 bg-white/40">
            <motion.div
              className="max-h-[46%] overflow-y-auto py-3"
              variants={staggerContainer(reducedMotion, 0.05, 0.02)}
              initial="hidden"
              animate="visible"
            >
              {sortedSkillNodes.map((skill, index) => {
                const isSelected = skill.id === effectiveSelectedId;
                const isLocked = skill.status === 'locked';
                return (
                  <motion.button
                    key={skill.id}
                    type="button"
                    onClick={() => handleListClick(skill)}
                    variants={fadeSlideY(reducedMotion, 8, MOTION_DURATION.base)}
                    whileHover={!reducedMotion && !isLocked ? { x: 1 } : undefined}
                    whileTap={!reducedMotion && !isLocked ? { scale: 0.99 } : undefined}
                    className={`group relative flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition ${
                      isSelected
                        ? 'text-slate-900'
                        : 'text-slate-600 hover:bg-slate-50/60 hover:text-slate-900'
                    } ${isLocked ? 'opacity-50' : ''}`}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId="selected-skill-row"
                        className="pointer-events-none absolute inset-y-1 left-1 right-1 rounded-xl bg-teal-50/80"
                        transition={springFor(reducedMotion, 'snappy')}
                      />
                    )}

                    <motion.span
                      layout
                      transition={springFor(reducedMotion, 'snappy')}
                      animate={isSelected && !isLocked && !reducedMotion ? { scale: 1.06 } : { scale: 1 }}
                      className={`relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        isSelected
                          ? 'bg-teal-500 text-white'
                          : `${statusDot[skill.status]} text-white`
                      }`}
                    >
                      {isLocked ? <Lock className="h-2.5 w-2.5" /> : index + 1}
                    </motion.span>

                    <div className="relative z-10 min-w-0">
                      <p className="truncate text-sm font-semibold leading-tight">{skill.title}</p>
                      <p className={`mt-0.5 text-xs ${isSelected ? 'text-teal-600' : 'text-slate-500'}`}>
                        {statusLabel[skill.status]}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>

            <div className="min-h-0 flex-1 border-t border-slate-200/70 px-3 py-3">
              <p className="mb-2 text-sm font-semibold text-slate-700">Agent Inbox</p>
              <div className="max-h-full space-y-2 overflow-y-auto">
                {activeSuggestions.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-200 bg-white/70 px-3 py-2 text-xs text-slate-600">
                    No agent suggestions for this session yet.
                  </p>
                ) : (
                  activeSuggestions.map((suggestion) => (
                    <div key={suggestion.id} className="rounded-xl border border-slate-200 bg-white p-2.5">
                      <div className="mb-2 flex flex-wrap items-center gap-1.5">
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-700">
                          {suggestion.action}
                        </span>
                        {suggestion.action === 'create' && suggestion.intent ? (
                          <span className="rounded-md bg-teal-50 px-1.5 py-0.5 text-[11px] font-semibold text-teal-700">
                            {suggestion.intent}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm font-medium text-slate-800">
                        {suggestion.action === 'create'
                          ? suggestion.title
                          : suggestion.action === 'retitle'
                            ? `Rename ${suggestion.targetSessionId}`
                            : `Reprioritize ${suggestion.targetSessionId}`}
                      </p>
                      <p className="mt-1 text-xs text-slate-600">{suggestion.rationale}</p>
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => onAcceptSuggestion(suggestion.id)}
                          className="min-h-11 rounded-lg bg-teal-600 px-3 text-sm font-semibold text-white transition hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => onDismissSuggestion(suggestion.id)}
                          className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="min-h-0 min-w-0 flex-1 overflow-auto bg-white/30 p-4">
            {!selectedSkill ? (
              <motion.div
                className="flex h-full items-center justify-center text-sm text-slate-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={tweenFor(reducedMotion, MOTION_DURATION.base)}
              >
                Select a skill to view its session
              </motion.div>
            ) : !topicNode ? (
              <motion.div
                className="flex h-full flex-col items-center justify-center gap-4 text-center"
                variants={staggerContainer(reducedMotion, 0.05, 0.02)}
                initial="hidden"
                animate="visible"
              >
                <motion.div
                  variants={fadeSlideY(reducedMotion, 8)}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100"
                >
                  <BookOpen className="h-6 w-6 text-slate-400" />
                </motion.div>
                <motion.div variants={fadeSlideY(reducedMotion, 8)}>
                  <p className="font-heading text-base font-semibold text-slate-700">{selectedSkill.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{selectedSkill.description}</p>
                </motion.div>

                {selectedSkill.status === 'available' && (
                  <motion.button
                    type="button"
                    onClick={() => onSelectSkillNode(selectedSkill.id)}
                    whileHover={reducedMotion ? undefined : { y: -1 }}
                    whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                    transition={springFor(reducedMotion, 'snappy')}
                    className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-700"
                  >
                    Start Session →
                  </motion.button>
                )}

                {selectedSkill.status === 'locked' && (
                  <motion.p className="text-xs text-slate-500" variants={fadeSlideY(reducedMotion, 8)}>
                    Complete previous skills to unlock
                  </motion.p>
                )}
              </motion.div>
            ) : (
              <div
                className="relative"
                style={{ width: Math.max(canvasW, 520), height: canvasH, minWidth: '100%', minHeight: '100%' }}
              >
                <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full">
                  {branchNodes.map((branch) => {
                    const from = positions[branch.parentId ?? topicNode.id];
                    const to = positions[branch.id];
                    if (!from || !to) return null;

                    const d = `M ${from.x + NODE_W} ${from.y + NODE_H / 2} L ${to.x} ${to.y + NODE_H / 2}`;
                    return (
                      <motion.path
                        key={`edge-${branch.id}`}
                        d={d}
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth={1.5}
                        strokeDasharray="5 4"
                        initial={reducedMotion ? { opacity: 0 } : { pathLength: 0, opacity: 0.2 }}
                        animate={reducedMotion ? { opacity: 1 } : { pathLength: 1, opacity: 1 }}
                        transition={tweenFor(reducedMotion, MOTION_DURATION.base)}
                      />
                    );
                  })}

                </svg>

                <AnimatePresence initial={false}>
                  {renderSessionNode(topicNode)}
                  {branchNodes.map((node) => renderSessionNode(node))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
