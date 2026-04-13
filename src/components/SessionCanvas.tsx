import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  BookOpen,
  CheckCircle2,
  CircleDot,
  GitBranch,
  HelpCircle,
  Lightbulb,
  Lock,
  RotateCcw,
  TreePine,
  Zap,
} from 'lucide-react';
import {
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
  skillNodes: SkillNode[];
  mainPhase: MainSessionPhase;
  planningState: PlanningState | null;
  onSelectSession: (sessionId: string) => void;
  onSelectSkillNode: (skillNodeId: string) => void;
}

const statusDot: Record<SkillNodeStatus, string> = {
  locked: 'bg-[#94a3b8]',
  available: 'bg-[#2563eb]',
  'in-progress': 'bg-[#d97706]',
  completed: 'bg-[#16a34a]',
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
      tone: 'text-blue-700 bg-blue-50 border-blue-200',
    };
  }

  if (node.kind === 'topic') {
    return {
      label: 'Topic',
      icon: <BookOpen className="h-4 w-4" />,
      tone: 'text-violet-700 bg-violet-50 border-violet-200',
    };
  }

  if (node.intent === 'ask') {
    return {
      label: 'Ask',
      icon: <HelpCircle className="h-4 w-4" />,
      tone: 'text-sky-700 bg-sky-50 border-sky-200',
    };
  }

  if (node.intent === 'explain') {
    return {
      label: 'Explain',
      icon: <Lightbulb className="h-4 w-4" />,
      tone: 'text-amber-700 bg-amber-50 border-amber-200',
    };
  }

  if (node.intent === 'practice') {
    return {
      label: 'Practice',
      icon: <Zap className="h-4 w-4" />,
      tone: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    };
  }

  if (node.intent === 'compare') {
    return {
      label: 'Compare',
      icon: <GitBranch className="h-4 w-4" />,
      tone: 'text-purple-700 bg-purple-50 border-purple-200',
    };
  }

  return {
    label: node.intent ? node.intent.charAt(0).toUpperCase() + node.intent.slice(1) : 'Branch',
    icon: <CircleDot className="h-4 w-4" />,
    tone: 'text-slate-700 bg-slate-50 border-slate-200',
  };
}

const NODE_W = 220;
const NODE_H = 100;
const TOPIC_X = 40;
const TOPIC_Y = 40;
const COL_GAP_X = 260;
const ROW_GAP_Y = 110;

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
    <motion.div className="flex h-full min-h-[300px] items-center justify-center p-8" initial="hidden" animate="visible" variants={fadeSlideY(reducedMotion, 10)}>
      <motion.div className="w-full max-w-sm" initial="hidden" animate="visible" variants={staggerContainer(reducedMotion, 0.06, 0.02)}>
        <motion.div className="mb-5 flex items-center gap-3" variants={fadeSlideY(reducedMotion, 8)}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f1f5f9]">
            <TreePine className="h-5 w-5 text-[#0f172a]" />
          </div>
          <div>
            <p className="font-heading text-sm font-semibold text-gray-900">Building your learning plan</p>
            <p className="text-xs text-gray-500">Skill tree will appear here when complete</p>
          </div>
        </motion.div>

        {planningState && (
          <motion.div className="space-y-2" initial="hidden" animate="visible" variants={staggerContainer(reducedMotion, 0.06)}>
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
                      ? 'border-[#e2e8f0] bg-[#f8fafc]'
                      : step.state === 'active'
                        ? 'border-[#2563eb] bg-[#f8fafc]'
                        : 'border-[#f1f5f9] bg-white'
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
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#16a34a]" />
                    </motion.span>
                  ) : (
                    <CircleDot className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${step.state === 'active' ? 'text-[#2563eb]' : 'text-[#94a3b8]'}`} />
                  )}
                  <div>
                    <p className={`font-medium ${step.state === 'done' ? 'text-[#0f172a]' : step.state === 'active' ? 'text-[#0f172a]' : 'text-[#94a3b8]'}`}>
                      {step.title}
                    </p>
                    {step.state !== 'pending' && (
                      <p className="mt-0.5 text-gray-500">{step.details}</p>
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
  skillNodes,
  mainPhase,
  planningState,
  onSelectSession,
  onSelectSkillNode,
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

  const completedCount = sortedSkillNodes.filter(s => s.status === 'completed').length;
  const totalCount = sortedSkillNodes.length;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

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

  function nodeCardClass(node: SessionNode): string {
    if (node.kind === 'topic') return 'session-node-card-topic';
    if (node.intent === 'ask') return 'session-node-card-ask';
    if (node.intent === 'explain') return 'session-node-card-explain';
    if (node.intent === 'practice') return 'session-node-card-practice';
    return '';
  }

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
        className={`session-node-card will-change-transform-opacity absolute left-0 top-0 text-left ${nodeCardClass(node)} ${isActive ? 'session-node-card-active' : ''}`}
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
          className="pointer-events-none absolute inset-0 rounded-[0.95rem] ring-2 ring-blue-400/50"
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
            node.status === 'active' ? 'bg-[#2563eb]'
              : node.status === 'completed' ? 'bg-[#16a34a]'
                : 'bg-gray-300'
          }`} />
        </div>

        <p className="relative mt-2 line-clamp-2 font-heading text-[13px] font-semibold text-gray-900">
          {node.title}
        </p>

        {node.originText && (
          <p className="relative mt-1 line-clamp-1 text-[10px] text-gray-400">
            "{node.originText}"
          </p>
        )}
      </motion.button>
    );
  };

  return (
    <motion.div className="flex h-full min-w-0 flex-col overflow-hidden" initial={false}>
      <motion.div className="border-b border-[#e2e8f0] px-5 py-3" variants={fadeSlideY(reducedMotion, 8)}>
        <div className="flex items-center justify-between gap-3">
            <p className="font-heading text-base font-semibold text-gray-900">
              {mainPhase === 'learning' ? 'Skill Tree' : 'Learning Plan'}
            </p>
          <div className="rounded-lg border border-[#e2e8f0] bg-white px-2.5 py-1.5 text-xs text-gray-600">
            {mainPhase === 'learning' ? (
              <div className="flex items-center gap-1.5">
                <TreePine className="h-3 w-3 text-[#0f172a]" />
                Skill tree active
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <RotateCcw className="h-3 w-3 text-[#64748b]" />
                Planning in progress
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {mainPhase === 'planning' ? (
        <motion.div className="min-h-0 flex-1 overflow-auto p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={tweenFor(reducedMotion, MOTION_DURATION.base)}>
          <div className="h-full rounded-2xl border border-[#e2e8f0] bg-white">
            <PlanningPlaceholder planningState={planningState} reducedMotion={reducedMotion} />
          </div>
        </motion.div>
      ) : (
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="flex w-60 shrink-0 flex-col border-r border-[#e2e8f0] bg-white">
            <div className="px-3 py-3 border-b border-gray-100">
              <div className="flex items-center justify-between text-xs text-[#64748b] mb-1.5">
                <span className="font-medium">Progress</span>
                <span>{completedCount}/{totalCount} skills</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#f1f5f9] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-[#0f172a]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
            </div>
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
                        ? 'text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50/60 hover:text-gray-900'
                    } ${isLocked ? 'opacity-50' : ''}`}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId="selected-skill-row"
                        className="pointer-events-none absolute inset-y-1 left-1 right-1 rounded-xl bg-[#f8fafc]"
                        transition={springFor(reducedMotion, 'snappy')}
                      />
                    )}

                    <motion.span
                      layout
                      transition={springFor(reducedMotion, 'snappy')}
                      animate={isSelected && !isLocked && !reducedMotion ? { scale: 1.06 } : { scale: 1 }}
                      className={`relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        isSelected
                          ? 'bg-[#0f172a] text-white'
                          : `${statusDot[skill.status]} text-white`
                      }`}
                    >
                      {isLocked ? <Lock className="h-2.5 w-2.5" /> : index + 1}
                    </motion.span>

                    <div className="relative z-10 min-w-0">
                      <p className="truncate text-sm font-semibold leading-tight">{skill.title}</p>
                      <p className={`mt-0.5 text-xs ${isSelected ? 'text-[#2563eb]' : 'text-gray-500'}`}>
                        {statusLabel[skill.status]}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          </div>

          <div className="min-h-0 min-w-0 flex-1 overflow-auto bg-white/30 p-4">
            {!selectedSkill ? (
              <motion.div
                className="flex h-full items-center justify-center text-sm text-gray-400"
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
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f1f5f9]"
                >
                  {selectedSkill.status === 'locked' ? (
                    <Lock className="h-6 w-6 text-[#64748b]" />
                  ) : (
                    <BookOpen className="h-6 w-6 text-[#64748b]" />
                  )}
                </motion.div>
                <motion.div variants={fadeSlideY(reducedMotion, 8)}>
                  <p className="font-heading text-base font-semibold text-gray-700">{selectedSkill.title}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {selectedSkill.status === 'locked'
                      ? 'Complete previous skills to unlock'
                      : selectedSkill.description}
                  </p>
                </motion.div>
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

                    const fromX = from.x + NODE_W;
                    const fromY = from.y + NODE_H / 2;
                    const toX = to.x;
                    const toY = to.y + NODE_H / 2;
                    const midX = (fromX + toX) / 2;
                    const d = `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;
                    return (
                      <g key={`edge-${branch.id}`}>
                        <motion.path
                          d={d}
                          fill="none"
                          stroke="#e2e8f0"
                          strokeWidth={1.5}
                          strokeLinecap="round"
                          initial={reducedMotion ? { opacity: 0 } : { pathLength: 0, opacity: 0.2 }}
                          animate={reducedMotion ? { opacity: 1 } : { pathLength: 1, opacity: 1 }}
                          transition={tweenFor(reducedMotion, MOTION_DURATION.base)}
                        />
                      </g>
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
