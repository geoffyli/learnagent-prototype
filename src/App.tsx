import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Sparkles, TreePine } from 'lucide-react';
import SessionCanvas from './components/SessionCanvas';
import SessionChat from './components/SessionChat';
import RichContentPanel from './components/RichContentPanel';
import { MOTION_DURATION, springFor, tweenFor } from './motion/tokens';
import { fadeSlideY, staggerContainer } from './motion/variants';
import {
  completeSkillAndUnlock,
  getSkillById,
  initializeSkillNodes,
  setSkillInProgress,
} from './state/progression';
import { applyActiveSession } from './state/session-status';
import {
  AnySessionRecord,
  ChatMessage,
  LearningPlanReport,
  MainSessionRecord,
  MainSessionPhase,
  PlanningState,
  SessionKind,
  SessionNode,
  SkillNode,
  SkillNodeStatus,
} from './types/session-graph';
import type { ContentBlock } from './types/content-blocks';
import {
  RICH_CODE_COUNTER,
  RICH_CODE_TOPIC,
  RICH_COMPARISON_TABLE,
  RICH_FLASHCARDS,
} from './data/richReplies';

// Legacy export retained for existing prototype files that still import this type.
export type ContentType = 'welcome' | 'concept-map' | 'code' | 'flashcards' | 'diagram';

const MAIN_SESSION_ID = 'session-main';


const REACT_HOOKS_SKILL_NODES: Omit<SkillNode, 'sessionId'>[] = [
  {
    id: 'skill-useState',
    title: 'useState',
    description: 'Local state management — the foundation of interactivity',
    status: 'available',
    dependsOn: [],
    col: 0,
    estimatedMinutes: 30,
  },
  {
    id: 'skill-useEffect',
    title: 'useEffect',
    description: 'Side effects, data fetching, and the cleanup pattern',
    status: 'locked',
    dependsOn: ['skill-useState'],
    col: 1,
    estimatedMinutes: 45,
  },
  {
    id: 'skill-useContext',
    title: 'useContext',
    description: 'Consuming context without prop drilling',
    status: 'locked',
    dependsOn: ['skill-useEffect'],
    col: 2,
    estimatedMinutes: 25,
  },
  {
    id: 'skill-useCallback',
    title: 'useCallback',
    description: 'Stable callback references to prevent unnecessary re-renders',
    status: 'locked',
    dependsOn: ['skill-useContext'],
    col: 3,
    estimatedMinutes: 20,
  },
  {
    id: 'skill-useMemo',
    title: 'useMemo',
    description: 'Expensive computation memoization',
    status: 'locked',
    dependsOn: ['skill-useCallback'],
    col: 4,
    estimatedMinutes: 20,
  },
  {
    id: 'skill-customHooks',
    title: 'Custom Hooks',
    description: 'Extracting reusable stateful logic into composable hooks',
    status: 'locked',
    dependsOn: ['skill-useMemo'],
    col: 5,
    estimatedMinutes: 40,
  },
];

function createTimestamp(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const PLANNING_STEP_USER_MESSAGES: Record<string, string> = {
  purpose: 'Goal: be able to build production React apps',
  baseline: 'Baseline: I know JavaScript but never used Hooks',
  research: 'Timeline: comfortable in 4 weeks',
  milestones: 'Please draft a milestone roadmap for me',
  report: 'Looks good — finalize the plan',
};

const PLANNING_STEP_MESSAGES: Record<string, string> = {
  purpose:
    "Got it. Your goal is clear: build production-ready React applications with confidence. I've noted your target outcome and will anchor the entire learning plan around shipping real, working code — not just understanding concepts in isolation.",
  baseline:
    "Assessment complete. You're comfortable with JavaScript but haven't used React Hooks yet. This puts you in a strong starting position — no need to revisit JS fundamentals. I'll start the plan at useState and build progressively, skipping content that would be redundant for your level.",
  research:
    "References gathered. I've pulled the React team's official documentation, the most-cited community patterns for hooks, and three production codebases that demonstrate idiomatic hook usage. The plan will draw from these to ensure you're learning current best practices, not outdated patterns.",
  milestones:
    "Milestone draft ready. I've structured 4 weekly checkpoints with clear dependencies:\n\n→ Week 1: useState + useEffect (foundation)\n→ Week 2: useContext (shared state)\n→ Week 3: useCallback + useMemo (performance)\n→ Week 4: Custom Hooks (composition)\n\nEach milestone has a hands-on project to confirm understanding before unlocking the next.",
  report:
    "Learning plan finalized. I've produced a complete personalized curriculum with 6 skill nodes, estimated time per topic, and unlock dependencies. The skill tree is ready — click 'Start Learning' to begin with useState, which unlocks everything else.",
};

function buildPlanningState(): PlanningState {
  return {
    steps: [
      {
        id: 'purpose',
        title: 'Clarify Purpose',
        details: 'Understand why the learner wants this topic and the concrete outcome.',
        state: 'active',
      },
      {
        id: 'baseline',
        title: 'Assess Current Understanding',
        details: 'Collect prior knowledge and confidence level to personalize plan difficulty.',
        state: 'pending',
      },
      {
        id: 'research',
        title: 'Gather References',
        details: 'Use external search tools and curated resources to enrich recommendations.',
        state: 'pending',
      },
      {
        id: 'milestones',
        title: 'Draft Milestones',
        details: 'Create an ordered path with dependencies and checkpoints.',
        state: 'pending',
      },
      {
        id: 'report',
        title: 'Finalize Report',
        details: 'Produce the final learning plan and populate the skill tree.',
        state: 'pending',
      },
    ],
    report: null,
  };
}

function generateLearningReport(): LearningPlanReport {
  return {
    goal: 'Build production-ready React applications using the complete Hooks API with confidence.',
    currentLevel: 'JavaScript-comfortable, new to React Hooks and functional component patterns.',
    milestones: [
      'Week 1: useState + useEffect — local state and side effects',
      'Week 2: useContext — shared state without prop drilling',
      'Week 3: useCallback + useMemo — performance optimization',
      'Week 4: Custom Hooks — reusable stateful logic',
    ],
    weeklyCadence: '3 focused sessions/week (60 min) + one hands-on project session',
    outcomeSignal: 'Can build a multi-page React app with data fetching, shared state, and custom hooks',
  };
}

function branchPromptProfile(kind: SessionKind): string {
  if (kind === 'ask') {
    return 'ask-concept-subagent';
  }
  if (kind === 'explain') {
    return 'explain-concept-subagent';
  }
  return 'general-subagent';
}

function topicIntroFor(title: string, description: string): string {
  return `Let's dive into **${title}** — ${description}\n\nThe code panel on the left shows the basic pattern. Ask me anything, request a quiz, or a comparison.`;
}

function assistantReplyFor(
  kind: SessionKind,
  message: string,
): { text: string; rich?: ContentBlock[] } {
  if (kind === 'topic') {
    const lower = message.toLowerCase();
    if (lower.includes('example') || lower.includes('show')) {
      return { text: 'Here\'s a real-world example:', rich: RICH_CODE_COUNTER };
    }
    if (lower.includes('vs') || lower.includes('comparison') || lower.includes('reducer')) {
      return { text: 'Here\'s how they compare:', rich: RICH_COMPARISON_TABLE };
    }
    if (lower.includes('quiz') || lower.includes('test') || lower.includes('practice')) {
      return { text: 'Let\'s test your knowledge — flip the cards:', rich: RICH_FLASHCARDS };
    }
    return {
      text: `Good question. Here's what you need to know about "${message}". Try asking for an example, a comparison, or a quiz.`,
    };
  }
  if (kind === 'ask') {
    return { text: `Great follow-up. Starting from "${message}", I can trace prerequisites and examples step-by-step.` };
  }
  if (kind === 'explain') {
    return { text: 'Understood. I will explain this concept using a compact mental model and one practical analogy.' };
  }
  return { text: 'I can answer directly, or you can highlight any phrase in my response to branch into Ask/Explain sessions.' };
}

function App() {
  const reducedMotion = useReducedMotion() ?? false;
  const idCounter = useRef(1);
  const nextId = (prefix: string) => `${prefix}-${idCounter.current++}`;

  const [leftTab, setLeftTab] = useState<'skill-tree' | 'content'>('skill-tree');
  const [tabDirection, setTabDirection] = useState(-1);
  const [richBlocks, setRichBlocks] = useState<ContentBlock[]>([]);

  const [nodes, setNodes] = useState<SessionNode[]>([
    {
      id: MAIN_SESSION_ID,
      title: 'React Hooks • Learning Session',
      kind: 'main',
      status: 'active',
      parentId: null,
      depth: 0,
      createdAt: 0,
    },
  ]);

  const [sessions, setSessions] = useState<Record<string, AnySessionRecord>>({
    [MAIN_SESSION_ID]: {
      id: MAIN_SESSION_ID,
      kind: 'main',
      phase: 'planning',
      skillNodes: [],
      promptProfile: 'main-orchestrator',
      contextNote: 'Main session coordinates user intent and delegates scoped sub-agents when needed.',
      planning: buildPlanningState(),
      messages: [
        {
          id: 'seed-1',
          role: 'assistant',
          content:
            "Let me build your personalized React Hooks learning plan. I'll work through 5 planning phases — you'll see my reasoning here as I go.",
          timestamp: '09:00',
        },
      ],
    } satisfies MainSessionRecord,
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(MAIN_SESSION_ID);

  const nodeMap = useMemo(() => {
    const map = new Map<string, SessionNode>();
    for (const node of nodes) {
      map.set(node.id, node);
    }
    return map;
  }, [nodes]);

  const activeNode = nodeMap.get(activeSessionId) ?? nodes[0];
  const activeSession = sessions[activeSessionId] ?? sessions[MAIN_SESSION_ID];


  const activePath = useMemo(() => {
    const path: SessionNode[] = [];
    let current: SessionNode | undefined = activeNode;

    while (current) {
      path.unshift(current);
      if (!current.parentId) {
        break;
      }
      current = nodeMap.get(current.parentId);
    }

    return path;
  }, [activeNode, nodeMap]);
  const activePathLabel = activePath.map((node) => node.title).join(' / ');
  const pageVariants = staggerContainer(reducedMotion, 0.09, 0.03);
  const pageItemVariants = fadeSlideY(reducedMotion, 10, MOTION_DURATION.slow);

  const changeLeftTab = (nextTab: 'skill-tree' | 'content') => {
    setTabDirection(nextTab === 'content' ? 1 : -1);
    setLeftTab(nextTab);
  };

  const activateSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setNodes((prev) => applyActiveSession(prev, sessionId));
  };

  const appendMessage = (
    sessionId: string,
    message: Omit<ChatMessage, 'id' | 'timestamp'>,
  ) => {
    setSessions((prev) => {
      const session = prev[sessionId];
      if (!session) {
        return prev;
      }
      const nextMessage: ChatMessage = {
        ...message,
        id: nextId('msg'),
        timestamp: createTimestamp(),
      };
      return {
        ...prev,
        [sessionId]: {
          ...session,
          messages: [...session.messages, nextMessage],
        },
      };
    });
  };

  const createSubSession = ({
    parentId,
    kind,
    title,
    originText,
    promptProfile,
    contextNote,
    seedMessages,
    skillNodeId,
  }: {
    parentId: string;
    kind: 'ask' | 'explain' | 'topic';
    title: string;
    originText?: string;
    promptProfile: string;
    contextNote: string;
    seedMessages: ChatMessage[];
    skillNodeId?: string;
  }) => {
    const parent = nodeMap.get(parentId);
    if (!parent) {
      return;
    }

    const sessionId = nextId('session');
    const nextNode: SessionNode = {
      id: sessionId,
      title,
      kind,
      status: 'active',
      parentId,
      depth: parent.depth + 1,
      createdAt: Date.now(),
      originText,
      skillNodeId,
    };

    setNodes((prev) => {
      return [...prev, nextNode];
    });
    setSessions((prev) => {
      const record: AnySessionRecord = {
        id: sessionId,
        kind,
        promptProfile,
        contextNote,
        messages: seedMessages,
        planning: null,
      };
      return {
        ...prev,
        [sessionId]: record,
      };
    });

    // Link back: only update the skill node's sessionId for topic sessions
    // Ask/explain branches must not overwrite the topic session link
    if (skillNodeId && kind === 'topic') {
      setSessions((prev) => {
        const mainSession = prev[MAIN_SESSION_ID] as MainSessionRecord;
        if (!mainSession) return prev;
        return {
          ...prev,
          [MAIN_SESSION_ID]: {
            ...mainSession,
            skillNodes: mainSession.skillNodes.map((n) =>
              n.id === skillNodeId ? { ...n, sessionId } : n,
            ),
          },
        };
      });
    }

    activateSession(sessionId);
  };

  const handleSendMessage = (rawMessage: string) => {
    appendMessage(activeSessionId, { role: 'user', content: rawMessage });
    const { text, rich } = assistantReplyFor(activeNode.kind, rawMessage);
    appendMessage(activeSessionId, { role: 'assistant', content: text });
    if (rich) {
      setRichBlocks(rich);
      changeLeftTab('content');
    }
  };

  const handleCreateBranch = (kind: 'ask' | 'explain', selectedText: string) => {
    const label = selectedText.slice(0, 42);
    const title = `${kind === 'ask' ? 'Ask' : 'Explain'} • ${label}`;
    const promptProfile = branchPromptProfile(kind);
    const intro =
      kind === 'ask'
        ? 'I received your selected snippet and surrounding context. Ask your specific follow-up and I will drill down from there.'
        : 'I received your selected snippet and surrounding context. I will explain it with a layered mental model and examples.';

    // Inherit the skillNodeId from the current session if it has one
    const currentSkillNodeId = activeNode.skillNodeId;

    createSubSession({
      parentId: activeSessionId,
      kind,
      title,
      originText: selectedText,
      promptProfile,
      contextNote:
        'Context package includes selected phrase, nearby assistant explanation, and parent session metadata.',
      seedMessages: [
        {
          id: nextId('msg'),
          role: 'system',
          content: `Context injected from ${activeNode.title}\nSelected text: "${selectedText}"`,
          timestamp: createTimestamp(),
        },
        {
          id: nextId('msg'),
          role: 'assistant',
          content: intro,
          timestamp: createTimestamp(),
        },
      ],
      skillNodeId: currentSkillNodeId,
    });
  };

  const handleAdvancePlanning = () => {
    if (!activeSession.planning) return;

    const stepIndex = activeSession.planning.steps.findIndex(
      (step) => step.state === 'active',
    );
    if (stepIndex === -1) return;

    const completingStep = activeSession.planning.steps[stepIndex];

    const userMessage = PLANNING_STEP_USER_MESSAGES[completingStep.id];
    if (userMessage) {
      appendMessage(activeSessionId, { role: 'user', content: userMessage });
    }

    const narrativeContent = PLANNING_STEP_MESSAGES[completingStep.id];
    if (narrativeContent) {
      appendMessage(activeSessionId, { role: 'assistant', content: narrativeContent });
    }

    setSessions((prev) => {
      const session = prev[activeSessionId];
      if (!session?.planning || session.planning.report) return prev;

      const updatedSteps = session.planning.steps.map((step, index) => {
        if (index === stepIndex) return { ...step, state: 'done' as const };
        if (index === stepIndex + 1) return { ...step, state: 'active' as const };
        return step;
      });

      const doneCount = updatedSteps.filter((s) => s.state === 'done').length;
      const isFinished = doneCount === updatedSteps.length;
      const report = isFinished ? generateLearningReport() : null;

      return {
        ...prev,
        [activeSessionId]: {
          ...session,
          planning: { steps: updatedSteps, report },
        },
      };
    });
  };


  const handleFinishPlanning = () => {
    const mainSession = sessions[MAIN_SESSION_ID] as MainSessionRecord;
    const report = mainSession?.planning?.report;
    if (!report) {
      return;
    }

    const skillNodes: SkillNode[] = initializeSkillNodes(REACT_HOOKS_SKILL_NODES);

    setSessions((prev) => {
      const session = prev[MAIN_SESSION_ID] as MainSessionRecord;
      if (!session) return prev;
      return {
        ...prev,
        [MAIN_SESSION_ID]: {
          ...session,
          phase: 'learning' as const,
          skillNodes,
        },
      };
    });
  };

  const handleSelectSkillNode = (skillNodeId: string) => {
    const mainSession = sessions[MAIN_SESSION_ID] as MainSessionRecord;
    const skillNode = mainSession?.skillNodes.find((n) => n.id === skillNodeId);
    if (!skillNode || skillNode.status === 'locked') return;

    // If a session already exists for this node, navigate to it
    if (skillNode.sessionId) {
      activateSession(skillNode.sessionId);
      return;
    }

    // Mark skill node in-progress
    setSessions((prev) => {
      const session = prev[MAIN_SESSION_ID] as MainSessionRecord;
      if (!session) return prev;
      const nextSkillNodes = setSkillInProgress(session.skillNodes, skillNodeId);
      return {
        ...prev,
        [MAIN_SESSION_ID]: {
          ...session,
          skillNodes: nextSkillNodes,
        },
      };
    });

    // Open a dedicated topic session and start tutoring immediately
    createSubSession({
      parentId: MAIN_SESSION_ID,
      kind: 'topic',
      title: skillNode.title,
      promptProfile: 'topic-tutor',
      contextNote: `Teaching: ${skillNode.title}. ${skillNode.description}`,
      seedMessages: [
        {
          id: nextId('msg'),
          role: 'assistant',
          content: topicIntroFor(skillNode.title, skillNode.description),
          timestamp: createTimestamp(),
        },
      ],
      skillNodeId,
    });

    // Emit the topic's code block to the rich content panel
    const topicBlocks = RICH_CODE_TOPIC[skillNode.title];
    if (topicBlocks) {
      setRichBlocks(topicBlocks);
      changeLeftTab('content');
    }
  };

  const handleCompleteSkill = (skillNodeId: string) => {
    setSessions((prev) => {
      const session = prev[MAIN_SESSION_ID] as MainSessionRecord;
      if (!session) return prev;

      const skill = getSkillById(session.skillNodes, skillNodeId);
      if (!skill || skill.status !== 'in-progress') {
        return prev;
      }

      return {
        ...prev,
        [MAIN_SESSION_ID]: {
          ...session,
          skillNodes: completeSkillAndUnlock(session.skillNodes, skillNodeId),
        },
      };
    });
  };

  const mainSession = sessions[MAIN_SESSION_ID] as MainSessionRecord;
  const mainSkillNodes = mainSession?.skillNodes ?? [];
  const mainPhase: MainSessionPhase = mainSession?.phase ?? 'planning';
  const activeSkillNodeId = activeNode.skillNodeId;
  const activeSkillStatus: SkillNodeStatus | null = activeSkillNodeId
    ? mainSkillNodes.find((node) => node.id === activeSkillNodeId)?.status ?? null
    : null;
  const tabPaneVariants = {
    enter: (direction: number) => ({
      opacity: 0,
      x: reducedMotion ? 0 : direction > 0 ? 22 : -22,
    }),
    center: {
      opacity: 1,
      x: 0,
      transition: tweenFor(reducedMotion, MOTION_DURATION.slow),
    },
    exit: (direction: number) => ({
      opacity: 0,
      x: reducedMotion ? 0 : direction > 0 ? -14 : 14,
      transition: tweenFor(reducedMotion, MOTION_DURATION.fast, 'exit'),
    }),
  };

  return (
    <motion.div
      className="min-h-screen px-3 pb-4 pt-3 text-slate-900 sm:px-4 lg:px-5"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.header className="hero-shell rounded-2xl px-4 py-3 sm:px-5" variants={pageItemVariants}>
        <div className="flex items-center justify-between gap-3">
          <p className="inline-flex items-center gap-2 font-heading text-base font-semibold text-slate-900">
            <Sparkles className="h-4 w-4 text-teal-600" />
            LearnAgent Prototype
          </p>
          <div className="flex items-center gap-2">
            <div className="hidden max-w-[420px] overflow-hidden md:block">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={activeSessionId}
                  className="truncate text-xs text-slate-600"
                  initial={{ opacity: 0, y: reducedMotion ? 0 : 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reducedMotion ? 0 : -4 }}
                  transition={tweenFor(reducedMotion, MOTION_DURATION.fast)}
                >
                  {activePathLabel}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.header>

      <motion.main
        className="mt-4 grid gap-4 overflow-hidden lg:h-[calc(100vh-7.5rem)] lg:grid-cols-3"
        variants={pageItemVariants}
      >
        <motion.section
          className="min-h-[460px] min-w-0 lg:col-span-2 lg:h-full lg:min-h-0"
          variants={fadeSlideY(reducedMotion, 12, MOTION_DURATION.slow)}
        >
          <div className="panel-surface flex h-full flex-col overflow-hidden">
            <div className="flex items-center gap-1 border-b border-white/50 px-4 py-2.5">
              <motion.button
                type="button"
                onClick={() => changeLeftTab('skill-tree')}
                whileHover={reducedMotion ? undefined : { y: -1 }}
                whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                className="group relative inline-flex items-center rounded-lg border border-transparent px-3 py-1.5 text-xs font-medium"
              >
                {leftTab === 'skill-tree' && (
                  <motion.span
                    layoutId="left-tab-pill"
                    className="absolute inset-0 rounded-lg border border-teal-200 bg-teal-50"
                    transition={springFor(reducedMotion, 'snappy')}
                  />
                )}
                <span className={`relative inline-flex items-center gap-1.5 ${leftTab === 'skill-tree' ? 'text-teal-700' : 'text-slate-500 transition group-hover:text-slate-700'}`}>
                  <TreePine className="h-3.5 w-3.5" />
                  Skill Tree
                </span>
              </motion.button>

              <AnimatePresence initial={false}>
                {richBlocks.length > 0 && (
                  <motion.button
                    key="content-tab"
                    type="button"
                    onClick={() => changeLeftTab('content')}
                    whileHover={reducedMotion ? undefined : { y: -1 }}
                    whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                    className="group relative inline-flex items-center rounded-lg border border-transparent px-3 py-1.5 text-xs font-medium"
                    initial={{ opacity: 0, y: reducedMotion ? 0 : -4, scale: reducedMotion ? 1 : 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: reducedMotion ? 0 : -4, scale: reducedMotion ? 1 : 0.98 }}
                    transition={tweenFor(reducedMotion, MOTION_DURATION.fast)}
                  >
                    {leftTab === 'content' && (
                      <motion.span
                        layoutId="left-tab-pill"
                        className="absolute inset-0 rounded-lg border border-violet-200 bg-violet-50"
                        transition={springFor(reducedMotion, 'snappy')}
                      />
                    )}
                    <span className={`relative inline-flex items-center gap-1.5 ${leftTab === 'content' ? 'text-violet-700' : 'text-slate-500 transition group-hover:text-slate-700'}`}>
                      <Sparkles className="h-3.5 w-3.5" />
                      Content
                    </span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <div className="relative min-h-0 flex-1 overflow-hidden">
              <AnimatePresence custom={tabDirection} mode="wait" initial={false}>
                {leftTab === 'skill-tree' ? (
                  <motion.div
                    key="tab-skill-tree"
                    className="h-full"
                    custom={tabDirection}
                    variants={tabPaneVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                  >
                    <SessionCanvas
                      nodes={nodes}
                      activeSessionId={activeSessionId}
                      skillNodes={mainSkillNodes}
                      mainPhase={mainPhase}
                      planningState={mainSession?.planning ?? null}
                      onSelectSession={activateSession}
                      onSelectSkillNode={handleSelectSkillNode}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="tab-content"
                    className="h-full"
                    custom={tabDirection}
                    variants={tabPaneVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                  >
                    <RichContentPanel blocks={richBlocks} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="min-h-[460px] min-w-0 lg:col-span-1 lg:h-full lg:min-h-0"
          variants={fadeSlideY(reducedMotion, 16, MOTION_DURATION.slow)}
        >
          <SessionChat
            activeNode={activeNode}
            activeSession={activeSession}
            mainPhase={mainPhase}
            activeSkillNodeId={activeSkillNodeId}
            activeSkillStatus={activeSkillStatus}
            onSendMessage={handleSendMessage}
            onCreateBranch={handleCreateBranch}
            onAdvancePlanning={handleAdvancePlanning}
            onFinishPlanning={handleFinishPlanning}
            onCompleteSkill={handleCompleteSkill}
          />
        </motion.section>
      </motion.main>
    </motion.div>
  );
}

export default App;
