import { ChangeEvent, SetStateAction, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Check, CheckCircle2, Circle, CircleDot, Inbox, Lock, Map as MapIcon, Sparkles, X } from 'lucide-react';
import SessionCanvas from './components/SessionCanvas';
import SessionChat from './components/SessionChat';
import RichContentPanel from './components/RichContentPanel';
import WelcomePage from './components/WelcomePage';
import CreatorBuilderPage from './components/CreatorBuilderPage';
import CourseDetailPage from './components/CourseDetailPage';
import { COURSE_COMMUNITY } from './data/courseCommunity';
import { durationFor, MOTION_DURATION, MOTION_EASE, springFor, tweenFor } from './motion/tokens';
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
  BranchIntent,
  BranchSessionRecord,
  BranchSource,
  ChatMessage,
  GlobalInboxItem,
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
import { CONTENT_PACK_LABELS, TOPIC_DEFAULT_PACKS } from './data/richReplies';
import { resolvePackById, resolveRichContent } from './state/content-resolver';
import {
  dedupeInboxItems,
  generateInitialInboxItems,
  generateInteractionInboxItems,
  generateSkillCompletionInboxItems,
} from './state/skill-tree-agent';
import type { CoursePackageConfig } from './types/course-package';
import { getPlanningScript, type PlanningTurn } from './state/planning-conversation';

// Legacy export retained for existing prototype files that still import this type.
export type ContentType = 'welcome' | 'concept-map' | 'code' | 'flashcards' | 'diagram';

const MAIN_SESSION_ID = 'session-main';
const EMPTY_RICH_BLOCKS: ContentBlock[] = [];
const EMPTY_RICH_BLOCKS_BY_SESSION: Record<string, ContentBlock[]> = {};
const EMPTY_NODES: SessionNode[] = [];
const EMPTY_SESSIONS: Record<string, AnySessionRecord> = {};

const DATA_ANALYST_SKILL_NODES: Omit<SkillNode, 'sessionId'>[] = [
  {
    id: 'skill-sql-foundations',
    title: 'SQL Foundations',
    description: 'Filtering, grouping, joins, and query accuracy fundamentals',
    status: 'available',
    dependsOn: [],
    col: 0,
    estimatedMinutes: 40,
  },
  {
    id: 'skill-sql-analytics',
    title: 'Analytical SQL',
    description: 'CTEs, window functions, cohort and retention style queries',
    status: 'locked',
    dependsOn: ['skill-sql-foundations'],
    col: 1,
    estimatedMinutes: 55,
  },
  {
    id: 'skill-metrics-funnels',
    title: 'Metrics and Funnels',
    description: 'North-star metric design, funnel breakdowns, and root-cause checks',
    status: 'locked',
    dependsOn: ['skill-sql-analytics'],
    col: 2,
    estimatedMinutes: 35,
  },
  {
    id: 'skill-dashboard-storytelling',
    title: 'Dashboard Storytelling',
    description: 'Build decision-ready dashboards and communicate insights clearly',
    status: 'locked',
    dependsOn: ['skill-metrics-funnels'],
    col: 3,
    estimatedMinutes: 45,
  },
  {
    id: 'skill-ab-testing',
    title: 'A/B Testing Basics',
    description: 'Hypothesis setup, guardrails, and experiment readout interpretation',
    status: 'locked',
    dependsOn: ['skill-dashboard-storytelling'],
    col: 4,
    estimatedMinutes: 35,
  },
  {
    id: 'skill-interview-case',
    title: 'Interview Case Simulation',
    description: 'End-to-end case practice from business question to recommendation',
    status: 'locked',
    dependsOn: ['skill-ab-testing'],
    col: 5,
    estimatedMinutes: 60,
  },
];

const CUSTOM_SESSION_SKILL_NODES: Omit<SkillNode, 'sessionId'>[] = [
  {
    id: 'skill-scope-goal',
    title: 'Scope and Goal Definition',
    description: 'Define the concrete learning goal, expected output, and constraints',
    status: 'available',
    dependsOn: [],
    col: 0,
    estimatedMinutes: 25,
  },
  {
    id: 'skill-foundation-map',
    title: 'Foundation Mapping',
    description: 'Identify prerequisites and current baseline gaps',
    status: 'locked',
    dependsOn: ['skill-scope-goal'],
    col: 1,
    estimatedMinutes: 30,
  },
  {
    id: 'skill-practice-loop',
    title: 'Practice Loop',
    description: 'Run targeted practice sessions and strengthen weak areas',
    status: 'locked',
    dependsOn: ['skill-foundation-map'],
    col: 2,
    estimatedMinutes: 35,
  },
  {
    id: 'skill-application',
    title: 'Applied Output',
    description: 'Create a concrete output from what you learned',
    status: 'locked',
    dependsOn: ['skill-practice-loop'],
    col: 3,
    estimatedMinutes: 40,
  },
  {
    id: 'skill-review-retain',
    title: 'Review and Retain',
    description: 'Consolidate with review and reinforcement sessions',
    status: 'locked',
    dependsOn: ['skill-application'],
    col: 4,
    estimatedMinutes: 25,
  },
];

const CUSTOM_SESSION_SKILL_PACKS = [
  {
    id: 'skillpack-custom-coach',
    name: 'Custom Learning Coach',
    intent: 'Personalized tutoring',
    instructions: 'Use learner-provided materials to explain clearly, ask focused follow-ups, and propose practical practice tasks.',
    exampleInput: 'I uploaded notes about retention analysis. Help me understand cohort breakdown.',
    exampleOutput: 'Let us break retention into week buckets, then validate with one SQL check and one narrative summary.',
  },
];

const CUSTOM_SESSION_COMMANDS = [
  {
    id: 'cmd-custom-drill',
    name: 'Practice Drill',
    trigger: '/drill',
    description: 'Generate a focused practice drill from current materials.',
    skillPackId: 'skillpack-custom-coach',
    defaultPrompt: 'Create a focused practice drill based on my uploaded materials.',
    outputHint: 'Return a short task list and one self-check question.',
    defaultContentPackId: 'memoization-decision-kit',
    inputFields: [
      {
        id: 'focus',
        label: 'What do you want to practice?',
        placeholder: 'Example: cohort retention SQL',
        required: true,
        type: 'text' as const,
      },
    ],
  },
];

const DATA_ANALYST_SKILL_PACKS = [
  {
    id: 'skillpack-sql-interview',
    name: 'SQL Interview Coach',
    intent: 'Interview SQL training',
    instructions: 'Coach SQL interview answers with clear assumptions, query structure, and mistake prevention.',
    exampleInput: 'How do I debug wrong weekly retention output?',
    exampleOutput: 'First verify join direction, then validate date boundaries, then compare week-over-week with window functions.',
  },
  {
    id: 'skillpack-dashboard-narrative',
    name: 'Dashboard Narrative Coach',
    intent: 'Business storytelling',
    instructions: 'Turn metric outputs into concise business narratives with recommendation-first structure.',
    exampleInput: 'My dashboard has many charts but no clear takeaway.',
    exampleOutput: 'Lead with one decision, then support it with 2-3 metrics and one risk caveat.',
  },
];

const DATA_ANALYST_COMMANDS = [
  {
    id: 'cmd-sql-drill',
    name: 'SQL Drill',
    trigger: '/sql-drill',
    description: 'Generate an interview-style SQL drill.',
    skillPackId: 'skillpack-sql-interview',
    defaultPrompt: 'Run a SQL interview drill for this topic.',
    outputHint: 'Return prompt, constraints, and expected validation checks.',
    defaultContentPackId: 'stale-closure-debug-trace',
    inputFields: [
      {
        id: 'level',
        label: 'Difficulty',
        placeholder: 'Easy / Medium / Hard',
        required: true,
        type: 'text' as const,
      },
      {
        id: 'topic',
        label: 'Target topic',
        placeholder: 'Retention, joins, windows, or metrics',
        required: false,
        type: 'text' as const,
      },
    ],
  },
  {
    id: 'cmd-case-brief',
    name: 'Case Brief',
    trigger: '/case-brief',
    description: 'Create a concise case-answer structure.',
    skillPackId: 'skillpack-dashboard-narrative',
    defaultPrompt: 'Create a concise case brief with recommendation-first structure.',
    outputHint: 'Return sections: context, insight, recommendation, risk.',
    defaultContentPackId: 'custom-hook-blueprint',
    inputFields: [
      {
        id: 'business-question',
        label: 'Business question',
        placeholder: 'What decision are you trying to make?',
        required: true,
        type: 'text' as const,
      },
    ],
  },
];

/* ── SAT Exam Prep ──────────────────────────────────────────── */

const SAT_EXAM_SKILL_NODES: Omit<SkillNode, 'sessionId'>[] = [
  {
    id: 'skill-sat-reading',
    title: 'Reading Comprehension',
    description: 'Passage types, evidence-based questions, vocabulary in context, and active reading strategies',
    status: 'available',
    dependsOn: [],
    col: 0,
    estimatedMinutes: 45,
  },
  {
    id: 'skill-sat-math-no-calc',
    title: 'Math: No Calculator',
    description: 'Heart of algebra, problem solving with data analysis, and mental math strategies',
    status: 'available',
    dependsOn: [],
    col: 0,
    estimatedMinutes: 50,
  },
  {
    id: 'skill-sat-writing',
    title: 'Writing & Language',
    description: 'Standard English conventions, expression of ideas, and rhetoric analysis',
    status: 'locked',
    dependsOn: ['skill-sat-reading'],
    col: 1,
    estimatedMinutes: 40,
  },
  {
    id: 'skill-sat-math-calc',
    title: 'Math: Calculator',
    description: 'Advanced math, additional topics in math, and calculator efficiency',
    status: 'locked',
    dependsOn: ['skill-sat-math-no-calc'],
    col: 1,
    estimatedMinutes: 50,
  },
  {
    id: 'skill-sat-evidence-analysis',
    title: 'Evidence-Based Analysis',
    description: 'Cross-section analysis integrating reading, writing, and data reasoning',
    status: 'locked',
    dependsOn: ['skill-sat-writing', 'skill-sat-math-calc'],
    col: 2,
    estimatedMinutes: 35,
  },
  {
    id: 'skill-sat-practice-sim',
    title: 'Full-Length Practice Simulation',
    description: 'Timed full-section practice with score analysis and error classification',
    status: 'locked',
    dependsOn: ['skill-sat-evidence-analysis'],
    col: 3,
    estimatedMinutes: 60,
  },
  {
    id: 'skill-sat-test-day',
    title: 'Test-Day Strategy',
    description: 'Time management, stress handling, pacing, and day-of logistics',
    status: 'locked',
    dependsOn: ['skill-sat-practice-sim'],
    col: 4,
    estimatedMinutes: 25,
  },
];

const SAT_EXAM_SKILL_PACKS = [
  {
    id: 'skillpack-sat-strategy',
    name: 'SAT Question Strategy Coach',
    intent: 'SAT question strategy',
    instructions: 'Coach SAT test-takers on question strategy: evidence identification, process of elimination, time allocation, and trap avoidance.',
    exampleInput: 'I keep picking answers that sound right but are wrong on reading passages.',
    exampleOutput: 'Use the "point to the line" method: before confirming an answer, identify the exact sentence in the passage that supports it. If you cannot find it, the answer is likely a trap.',
  },
  {
    id: 'skillpack-sat-drill',
    name: 'SAT Drill & Error Analysis Coach',
    intent: 'SAT practice and error analysis',
    instructions: 'Generate targeted SAT practice drills by section and difficulty. After practice, analyze error patterns and recommend specific improvement strategies.',
    exampleInput: 'I want to practice Math No-Calculator at medium difficulty.',
    exampleOutput: 'Here are 5 Heart of Algebra questions. Focus on: translating word problems into equations, solving systems of equations, and checking your work by substitution.',
  },
];

const SAT_EXAM_COMMANDS = [
  {
    id: 'cmd-sat-drill',
    name: 'SAT Drill',
    trigger: '/sat-drill',
    description: 'Generate a timed SAT practice drill for a specific section.',
    skillPackId: 'skillpack-sat-drill',
    defaultPrompt: 'Generate a focused SAT practice drill for this section.',
    outputHint: 'Return a set of practice questions with difficulty labels and time targets.',
    defaultContentPackId: 'sat-error-analysis-trace',
    inputFields: [
      {
        id: 'section',
        label: 'Section',
        placeholder: 'Reading / Writing / Math No-Calc / Math Calc',
        required: true,
        type: 'text' as const,
      },
      {
        id: 'difficulty',
        label: 'Difficulty',
        placeholder: 'Easy / Medium / Hard',
        required: false,
        type: 'text' as const,
      },
    ],
  },
  {
    id: 'cmd-vocab-review',
    name: 'Vocab Review',
    trigger: '/vocab-review',
    description: 'Generate SAT vocabulary flashcards from recent passages.',
    skillPackId: 'skillpack-sat-strategy',
    defaultPrompt: 'Generate SAT vocabulary flashcards focused on this topic.',
    outputHint: 'Return flashcards with vocabulary in context, not isolated definitions.',
    defaultContentPackId: 'sat-vocab-flashcards',
    inputFields: [
      {
        id: 'topic',
        label: 'Vocabulary focus',
        placeholder: 'Context clues / Rhetoric / Word choice',
        required: true,
        type: 'text' as const,
      },
    ],
  },
  {
    id: 'cmd-error-analysis',
    name: 'Error Analysis',
    trigger: '/error-analysis',
    description: 'Analyze error patterns from practice questions.',
    skillPackId: 'skillpack-sat-drill',
    defaultPrompt: 'Analyze my error patterns for this section and recommend fixes.',
    outputHint: 'Return error categories, frequency, and specific fix strategies.',
    defaultContentPackId: 'sat-score-progress-metrics',
    inputFields: [
      {
        id: 'section',
        label: 'Section to analyze',
        placeholder: 'Reading / Writing / Math',
        required: true,
        type: 'text' as const,
      },
    ],
  },
];

const COURSE_PACKAGES: CoursePackageConfig[] = [
  {
    id: 'pkg-custom-self-directed',
    title: 'Custom Self-Directed Session',
    subtitle: 'Bring your own materials and goals',
    defaultSessionTitle: 'Custom Learning Session',
    discoverable: false,
    intakeTitle: 'Create your own learning session',
    intakeDescription:
      'Upload your materials and learning goal. Knovia will build a personalized path.',
    creatorPrompt:
      'This is a custom mode for self-directed sessions using your own materials.',
    intakeFields: [
      {
        id: 'learning-material',
        label: 'Learning Material File',
        description: 'Upload one file to anchor this session (PDF, DOC, DOCX).',
        type: 'file',
        required: true,
        accept: '.pdf,.doc,.docx',
        sampleValue: 'sample-custom-learning-notes.pdf',
      },
      {
        id: 'learning-goal',
        label: 'Learning Goal',
        description: 'Describe what you want to be able to do after this session.',
        type: 'text',
        required: true,
        placeholder: 'I want to understand cohort retention analysis and explain it clearly',
        sampleValue: 'I want to explain retention analysis with confidence in interviews',
      },
    ],
    skillNodes: CUSTOM_SESSION_SKILL_NODES,
    skillPacks: CUSTOM_SESSION_SKILL_PACKS,
    commands: CUSTOM_SESSION_COMMANDS,
    runtimePolicy: {
      systemPrompt: 'You are a personalized tutor that uses learner materials to create practical progress.',
      guardrails: 'Do not fabricate source facts. Ask clarifying questions if user input is insufficient.',
    },
    suggestedActions: [
      { label: 'Create a focused drill', prompt: '/drill focus="core weakness"' },
      { label: 'Explain with one analogy', prompt: 'Explain this with one practical analogy' },
    ],
    source: 'seed',
  },
  {
    id: 'pkg-data-analyst-job-sprint',
    title: 'Data Analyst Job Sprint',
    subtitle: 'SQL + BI + interview execution',
    defaultSessionTitle: 'Data Analyst Job Sprint Session',
    intakeTitle: 'Prepare your personalized Data Analyst sprint',
    intakeDescription:
      'Provide the requested materials so Knovia can tailor your path.',
    creatorPrompt:
      'Please upload your resume and one project link for personalized interview coaching.',
    intakeFields: [
      {
        id: 'resume',
        label: 'Resume',
        description: 'Upload your latest resume (PDF, DOC, DOCX).',
        type: 'file',
        required: true,
        accept: '.pdf,.doc,.docx',
        sampleValue: 'sample-data-analyst-resume.pdf',
      },
      {
        id: 'github',
        label: 'Project GitHub URL',
        description: 'Share one repository that represents your strongest analysis project.',
        type: 'url',
        required: true,
        placeholder: 'https://github.com/username/project',
        sampleValue: 'https://github.com/learner/retention-dashboard-case',
      },
      {
        id: 'target-role',
        label: 'Target Role',
        description: 'Optional: include the target company/role to adapt interview language.',
        type: 'text',
        required: false,
        placeholder: 'Data Analyst Intern at a B2C tech company',
        sampleValue: 'Product Data Analyst at a B2C consumer app',
      },
    ],
    skillNodes: DATA_ANALYST_SKILL_NODES,
    skillPacks: DATA_ANALYST_SKILL_PACKS,
    commands: DATA_ANALYST_COMMANDS,
    runtimePolicy: {
      systemPrompt: 'You are a data analyst interview coach focused on SQL rigor and business storytelling.',
      guardrails: 'Prioritize correctness and explicit assumptions before recommendations.',
    },
    suggestedActions: [
      { label: 'Run SQL drill', prompt: '/sql-drill level="Medium" topic="retention"' },
      { label: 'Create case brief', prompt: '/case-brief business-question="Why did conversion drop?"' },
    ],
    source: 'seed',
  },
  {
    id: 'pkg-sat-exam-prep',
    title: 'SAT Exam Prep Sprint',
    subtitle: 'Reading + Writing + Math mastery for test day',
    defaultSessionTitle: 'SAT Exam Prep Session',
    intakeTitle: 'Personalize your SAT Prep plan',
    intakeDescription:
      'Share your starting point so Knovia can build a plan that targets your weak areas.',
    creatorPrompt:
      'Upload a recent practice test score report and indicate your target score. This helps us focus on high-impact areas.',
    intakeFields: [
      {
        id: 'score-report',
        label: 'Practice Test Score Report',
        description: 'Upload a recent practice test or score report (PDF, PNG, JPG).',
        type: 'file',
        required: true,
        accept: '.pdf,.png,.jpg',
        sampleValue: 'sample-sat-score-report.pdf',
      },
      {
        id: 'target-score',
        label: 'Target SAT Score',
        description: 'What total score are you aiming for?',
        type: 'text',
        required: true,
        placeholder: '1400',
        sampleValue: '1450',
      },
      {
        id: 'weak-areas',
        label: 'Weak Areas',
        description: 'Optional: describe which sections or question types you struggle with most.',
        type: 'text',
        required: false,
        placeholder: 'Reading comprehension, algebra word problems',
        sampleValue: 'Reading evidence questions, no-calculator algebra',
      },
    ],
    skillNodes: SAT_EXAM_SKILL_NODES,
    skillPacks: SAT_EXAM_SKILL_PACKS,
    commands: SAT_EXAM_COMMANDS,
    runtimePolicy: {
      systemPrompt: 'You are an SAT prep tutor focused on strategic test preparation, score improvement, and building confidence through targeted practice.',
      guardrails: 'Always explain the reasoning behind correct answers. Never just give answers without rationale. Encourage process over memorization.',
    },
    suggestedActions: [
      { label: 'Run SAT drill', prompt: '/sat-drill section="Reading" difficulty="Medium"' },
      { label: 'Review vocabulary', prompt: '/vocab-review topic="Context clues"' },
    ],
    planningHints: {
      purposeActions: [
        { label: 'Improve my SAT score', prompt: 'My main goal is to improve my SAT score for college admissions.' },
        { label: 'Prepare for a test date', prompt: 'I have a specific test date coming up and need to prepare efficiently.' },
        { label: 'Strengthen weak sections', prompt: 'I want to focus on my weakest sections to maximize score improvement.' },
      ],
      targetActions: [
        { label: 'Top-tier universities', prompt: 'I am targeting top-tier universities that expect scores above 1400.' },
        { label: 'State universities', prompt: 'I am targeting state universities where a solid score around 1200-1300 is competitive.' },
        { label: 'No specific target', prompt: 'No specific target yet — I want the highest score I can get.' },
      ],
    },
    source: 'seed',
  },
];

const DEFAULT_COURSE_PACKAGE_ID = 'pkg-sat-exam-prep';

function getCoursePackageById(packages: CoursePackageConfig[], id: string): CoursePackageConfig {
  return packages.find((item) => item.id === id) ?? packages[0];
}


function createTimestamp(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}


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

function generateLearningReport(coursePackage: CoursePackageConfig): LearningPlanReport {
  const milestones = coursePackage.skillNodes.map((node, index) => {
    const weekLabel = index < 2 ? `Weeks ${index + 1}-${index + 2}` : `Week ${index + 2}`;
    return `${weekLabel}: ${node.title}`;
  });

  return {
    goal: `Become interview-ready for ${coursePackage.title} through a structured 8-week sprint.`,
    currentLevel: 'Learner baseline captured from uploaded materials and optional context fields.',
    milestones,
    weeklyCadence: '4 focused sessions/week (45-60 min) + one case rehearsal block',
    outcomeSignal: `Can complete ${coursePackage.title} case drills with clear, defensible recommendations`,
  };
}

function branchPromptProfile(intent: BranchIntent): string {
  if (intent === 'ask') {
    return 'ask-concept-subagent';
  }
  if (intent === 'explain') {
    return 'explain-concept-subagent';
  }
  if (intent === 'debug') {
    return 'debug-subagent';
  }
  if (intent === 'compare') {
    return 'compare-subagent';
  }
  if (intent === 'practice') {
    return 'practice-subagent';
  }
  if (intent === 'plan') {
    return 'planning-subagent';
  }
  return 'general-subagent';
}

function topicIntroFor(title: string, description: string): string {
  return `Let's dive into **${title}** — ${description}\n\nUse Ask, Explain, Compare, and Practice sessions to build mastery. I will also propose review tasks when this node needs reinforcement.`;
}

function assistantFallbackReplyFor(kind: SessionKind, message: string, intent?: BranchIntent): string {
  if (kind === 'topic') {
    return `Good question about "${message}". This is an important area to master — many students underestimate it.\n\nThe key is to focus on the underlying reasoning pattern rather than memorizing answers. Start by identifying what the question is really asking, then systematically eliminate options that don't have direct evidence supporting them.\n\nWould you like me to break this down further, or try a practice drill?`;
  }
  if (kind === 'branch' && intent === 'ask') {
    return `Great follow-up. Starting from "${message}", I can trace prerequisites and examples step-by-step.`;
  }
  if (kind === 'branch' && intent === 'explain') {
    return 'Understood. I will explain this concept using a compact mental model and one practical analogy.';
  }
  if (kind === 'branch' && intent === 'debug') {
    return 'I can help debug this by narrowing probable causes and validating each assumption.';
  }
  if (kind === 'branch' && intent === 'compare') {
    return 'I can compare options and give a crisp tradeoff-oriented recommendation.';
  }
  return 'I can answer directly, or you can highlight any phrase in my response to branch into Ask/Explain sessions.';
}

function findCommand(coursePackage: CoursePackageConfig, input: string) {
  const normalized = input.trim().toLowerCase();
  const token = normalized.split(/\s+/)[0] ?? normalized;
  return coursePackage.commands.find((command) => token === command.trigger.toLowerCase());
}

function buildSkillDrivenReply(
  coursePackage: CoursePackageConfig,
  commandTrigger: string,
  userInput: string,
): string {
  const command = coursePackage.commands.find((item) => item.trigger === commandTrigger);
  if (!command) {
    return 'Command was not found in this package.';
  }

  const argsText = userInput.slice(commandTrigger.length).trim();
  const hasArgs = Boolean(argsText);

  return [
    `Command executed: ${command.name}`,
    `Trigger: ${command.trigger}`,
    '',
    hasArgs
      ? `Received input: ${argsText}`
      : 'No additional input was provided. Running with package defaults.',
    'Generating response using creator-defined package logic.',
    '',
    command.outputHint
      ? `Output style: ${command.outputHint}`
      : 'Output style: actionable guidance with next steps.',
  ].join('\n');
}

/* ---------- SkillProgressBar ---------- */

function SkillProgressBar({
  skillNodes,
  activeSkillNodeId,
  onSelectSkill,
  onCompleteSkill,
}: {
  skillNodes: SkillNode[];
  activeSkillNodeId?: string;
  onSelectSkill: (id: string) => void;
  onCompleteSkill: (id: string) => void;
}) {
  const reducedMotion = useReducedMotion() ?? false;
  return (
    <div className="flex items-center gap-2 overflow-x-auto border-b border-gray-200 bg-white/80 px-4 py-2.5">
      {skillNodes.map((skill) => {
        const isActive = skill.id === activeSkillNodeId;
        const isLocked = skill.status === 'locked';
        const isCompleted = skill.status === 'completed';
        const isInProgress = skill.status === 'in-progress';
        return (
          <motion.button
            key={skill.id}
            type="button"
            onClick={() => !isLocked && onSelectSkill(skill.id)}
            disabled={isLocked}
            whileHover={reducedMotion || isLocked ? undefined : { y: -1 }}
            whileTap={reducedMotion || isLocked ? undefined : { scale: 0.97 }}
            className={`group relative inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
              isActive
                ? 'ring-2 ring-blue-400 ring-offset-1'
                : ''
            } ${
              isCompleted
                ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                : isInProgress
                  ? 'border border-blue-200 bg-blue-50 text-blue-700'
                  : isLocked
                    ? 'border border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                    : 'border border-gray-200 bg-white text-gray-700 hover:border-blue-300'
            }`}
          >
            {isCompleted ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : isInProgress ? (
              <CircleDot className="h-3.5 w-3.5" />
            ) : isLocked ? (
              <Lock className="h-3 w-3" />
            ) : (
              <Circle className="h-3.5 w-3.5" />
            )}
            <span className="max-w-[120px] truncate">{skill.title}</span>
            {isInProgress && isActive && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onCompleteSkill(skill.id); }}
                className="ml-1 rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-medium text-white hover:bg-blue-700"
                title="Mark as mastered"
              >
                ✓ Master
              </button>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

/* ---------- CanvasSlideOver ---------- */

function CanvasSlideOver({
  view,
  blocks,
  onClose,
  onSwitchView,
  skillTreeProps,
}: {
  view: 'content' | 'skill-tree';
  blocks: ContentBlock[];
  onClose: () => void;
  onSwitchView: (view: 'content' | 'skill-tree') => void;
  skillTreeProps: {
    nodes: SessionNode[];
    activeSessionId: string;
    skillNodes: SkillNode[];
    mainPhase: MainSessionPhase;
    planningState: PlanningState | null;
    onSelectSession: (sessionId: string) => void;
    onSelectSkillNode: (skillNodeId: string) => void;
  };
}) {
  const hasContent = blocks.length > 0;
  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white/90 shadow-sm backdrop-blur-sm"
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onSwitchView('skill-tree')}
            className={`rounded-lg px-2 py-1 text-xs font-medium transition ${view === 'skill-tree' ? 'bg-blue-50 text-blue-700' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Skill Map
          </button>
          {hasContent && (
            <button
              type="button"
              onClick={() => onSwitchView('content')}
              className={`rounded-lg px-2 py-1 text-xs font-medium transition ${view === 'content' ? 'bg-violet-50 text-violet-700' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Artifact
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          title="Close panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {view === 'skill-tree' ? (
          <SessionCanvas {...skillTreeProps} />
        ) : (
          <RichContentPanel blocks={blocks} />
        )}
      </div>
    </div>
  );
}

/* ---------- WorkspaceState ---------- */

interface WorkspaceState {
  id: string;
  title: string;
  coursePackageId: string;
  origin: 'custom' | 'package';
  createdAt: number;
  updatedAt: number;
  richBlocksBySession: Record<string, ContentBlock[]>;
  nodes: SessionNode[];
  sessions: Record<string, AnySessionRecord>;
  activeSessionId: string;
  learnerIntake: Record<string, string>;
}

function createMainSessionRecord(): MainSessionRecord {
  return {
    id: MAIN_SESSION_ID,
    kind: 'main',
    phase: 'setup',
    skillNodes: [],
    promptProfile: 'main-orchestrator',
    contextNote: 'Main session coordinates user intent and delegates scoped sub-agents when needed.',
    planning: null,
    messages: [],
  };
}

function createWorkspace(
  id: string,
  title: string,
  coursePackage: CoursePackageConfig,
  origin: 'custom' | 'package' = 'package',
): WorkspaceState {
  const now = Date.now();
  return {
    id,
    title,
    coursePackageId: coursePackage.id,
    origin,
    createdAt: now,
    updatedAt: now,
    richBlocksBySession: {
      [MAIN_SESSION_ID]: [],
    },
    nodes: [
      {
        id: MAIN_SESSION_ID,
        title: `${coursePackage.title} • Learning Session`,
        kind: 'main',
        status: 'active',
        parentId: null,
        depth: 0,
        createdAt: 0,
      },
    ],
    sessions: {
      [MAIN_SESSION_ID]: createMainSessionRecord(),
    },
    activeSessionId: MAIN_SESSION_ID,
    learnerIntake: {},
  };
}

function resolveState<T>(current: T, next: SetStateAction<T>): T {
  return typeof next === 'function' ? (next as (value: T) => T)(current) : next;
}

function App() {
  const reducedMotion = useReducedMotion() ?? false;
  const idCounter = useRef(1);
  const workspaceCounter = useRef(2);
  const timelineCounter = useRef(1);
  const nextId = (prefix: string) => `${prefix}-${idCounter.current++}`;
  const nextWorkspaceId = () => `workspace-${workspaceCounter.current++}`;
  const nextTimeline = () => timelineCounter.current++;
  const [publishedPackages, setPublishedPackages] = useState<CoursePackageConfig[]>([]);
  const [creatorStudioOpen, setCreatorStudioOpen] = useState(false);
  const [previewPackageId, setPreviewPackageId] = useState<string | null>(null);
  const [canvasOpen, setCanvasOpen] = useState(false);
  const [canvasView, setCanvasView] = useState<'content' | 'skill-tree'>('content');
  const [planningTurnIndex, setPlanningTurnIndex] = useState(0);
  const [planningScript, setPlanningScript] = useState<PlanningTurn[]>([]);
  const planningTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [globalInbox, setGlobalInbox] = useState<GlobalInboxItem[]>([]);
  const [inboxOpen, setInboxOpen] = useState(false);

  const allCoursePackages = useMemo(
    () => [...COURSE_PACKAGES, ...publishedPackages],
    [publishedPackages],
  );

  const [workspaces, setWorkspaces] = useState<WorkspaceState[]>(() => {
    const defaultPackage = getCoursePackageById(COURSE_PACKAGES, DEFAULT_COURSE_PACKAGE_ID);
    return [createWorkspace('workspace-1', defaultPackage.defaultSessionTitle, defaultPackage, 'package')];
  });
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);

  const activeWorkspace = useMemo(() => {
    if (!activeWorkspaceId) {
      return null;
    }
    return workspaces.find((workspace) => workspace.id === activeWorkspaceId) ?? null;
  }, [activeWorkspaceId, workspaces]);

  const workspaceState = activeWorkspace ?? workspaces[0] ?? null;

  const updateActiveWorkspace = (updater: (workspace: WorkspaceState) => WorkspaceState) => {
    if (!activeWorkspaceId) {
      return;
    }

    setWorkspaces((prev) =>
      prev.map((workspace) => {
        if (workspace.id !== activeWorkspaceId) {
          return workspace;
        }

        const nextWorkspace = updater(workspace);
        return {
          ...nextWorkspace,
          updatedAt: Date.now(),
        };
      }),
    );
  };

  const setSessionRichBlocks = (
    sessionId: string,
    next: SetStateAction<ContentBlock[]>,
  ) => {
    updateActiveWorkspace((workspace) => ({
      ...workspace,
      richBlocksBySession: {
        ...workspace.richBlocksBySession,
        [sessionId]: resolveState(workspace.richBlocksBySession[sessionId] ?? EMPTY_RICH_BLOCKS, next),
      },
    }));
  };

  const setNodes = (next: SetStateAction<SessionNode[]>) => {
    updateActiveWorkspace((workspace) => ({
      ...workspace,
      nodes: resolveState(workspace.nodes, next),
    }));
  };

  const setSessions = (next: SetStateAction<Record<string, AnySessionRecord>>) => {
    updateActiveWorkspace((workspace) => ({
      ...workspace,
      sessions: resolveState(workspace.sessions, next),
    }));
  };

  const setActiveSessionId = (next: SetStateAction<string>) => {
    updateActiveWorkspace((workspace) => ({
      ...workspace,
      activeSessionId: resolveState(workspace.activeSessionId, next),
    }));
  };

  const richBlocksBySession = workspaceState?.richBlocksBySession ?? EMPTY_RICH_BLOCKS_BY_SESSION;
  const nodes = workspaceState?.nodes ?? EMPTY_NODES;
  const sessions = workspaceState?.sessions ?? EMPTY_SESSIONS;
  const learnerIntake = workspaceState?.learnerIntake ?? {};
  const activeCoursePackage = getCoursePackageById(
    allCoursePackages,
    workspaceState?.coursePackageId ?? DEFAULT_COURSE_PACKAGE_ID,
  );
  const activeSessionId = workspaceState?.activeSessionId ?? MAIN_SESSION_ID;
  const activeRichBlocks = richBlocksBySession[activeSessionId] ?? EMPTY_RICH_BLOCKS;

  const nodeMap = useMemo(() => {
    const map = new Map<string, SessionNode>();
    for (const node of nodes) {
      map.set(node.id, node);
    }
    return map;
  }, [nodes]);

  const activeNode = nodeMap.get(activeSessionId) ?? nodes[0];
  const activeSession = sessions[activeSessionId] ?? sessions[MAIN_SESSION_ID];

  const inferredFallbackRichBlocks = useMemo(() => {
    if (!activeSession || !activeNode || activeRichBlocks.length > 0) {
      return EMPTY_RICH_BLOCKS;
    }

    let inferredPackId: string | null = null;
    const explicitPattern = /@content:([a-z0-9-]+)/i;

    for (let i = activeSession.messages.length - 1; i >= 0; i -= 1) {
      const content = activeSession.messages[i]?.content ?? '';
      const explicitMatch = explicitPattern.exec(content);
      if (explicitMatch?.[1]) {
        inferredPackId = explicitMatch[1];
        break;
      }

      const labelMatch = Object.entries(CONTENT_PACK_LABELS).find(([, label]) => label === content.trim());
      if (labelMatch) {
        inferredPackId = labelMatch[0];
        break;
      }
    }

    if (!inferredPackId && activeNode.kind === 'topic') {
      inferredPackId = TOPIC_DEFAULT_PACKS[activeNode.title]?.[0] ?? null;
    }

    if (!inferredPackId) {
      return EMPTY_RICH_BLOCKS;
    }

    return resolvePackById(inferredPackId) ?? EMPTY_RICH_BLOCKS;
  }, [activeNode, activeRichBlocks, activeSession]);

  const visibleRichBlocks = activeRichBlocks.length > 0 ? activeRichBlocks : inferredFallbackRichBlocks;


  const pageVariants = staggerContainer(reducedMotion, 0.09, 0.03);
  const pageItemVariants = fadeSlideY(reducedMotion, 10, MOTION_DURATION.slow);

  const customWorkspaceSummaries = useMemo(() => {
    return workspaces.map((workspace) => {
      const pack = getCoursePackageById(allCoursePackages, workspace.coursePackageId);
      return {
        id: workspace.id,
        title: workspace.title,
        packageTitle: pack.title,
        origin: workspace.origin,
        lastVisitedAt: workspace.updatedAt,
      };
    }).filter((workspace) => workspace.origin === 'custom');
  }, [allCoursePackages, workspaces]);

  const coursePackageOptions = useMemo(
    () => allCoursePackages
      .filter((item) => item.discoverable !== false)
      .map((item) => ({ id: item.id, title: item.title, subtitle: item.subtitle })),
    [allCoursePackages],
  );

  const handleCreateCustomWorkspace = (title?: string) => {
    const selectedPackage = getCoursePackageById(allCoursePackages, 'pkg-custom-self-directed');
    const workspaceId = nextWorkspaceId();
    const fallbackTitle = title?.trim() || `Custom Session ${workspaceCounter.current - 1}`;
    const nextWorkspace = createWorkspace(
      workspaceId,
      fallbackTitle,
      selectedPackage,
      'custom',
    );

    setWorkspaces((prev) => [nextWorkspace, ...prev]);
    setActiveWorkspaceId(workspaceId);
  };

  const handlePreviewPackage = (coursePackageId: string) => {
    setPreviewPackageId(coursePackageId);
  };
  const handleBackFromPreview = () => {
    setPreviewPackageId(null);
  };

  const handleStartPackageSession = (coursePackageId: string) => {
    const selectedPackage = getCoursePackageById(allCoursePackages, coursePackageId);
    const workspaceId = nextWorkspaceId();
    const nextWorkspace = createWorkspace(
      workspaceId,
      selectedPackage.defaultSessionTitle,
      selectedPackage,
      'package',
    );

    setWorkspaces((prev) => [nextWorkspace, ...prev]);
    setActiveWorkspaceId(workspaceId);
  };

  const handleOpenWorkspace = (workspaceId: string) => {
    setWorkspaces((prev) =>
      prev.map((workspace) =>
        workspace.id === workspaceId
          ? { ...workspace, updatedAt: Date.now() }
          : workspace,
      ),
    );
    setActiveWorkspaceId(workspaceId);
  };

  const handleBackToWelcome = () => {
    setActiveWorkspaceId(null);
  };

  const handlePublishCreatorPackage = (coursePackage: Omit<CoursePackageConfig, 'id'>) => {
    const packageId = nextId('pkg-creator');
    setPublishedPackages((prev) => [
      ...prev,
      {
        ...coursePackage,
        id: packageId,
        source: 'creator',
        suggestedActions: [
          { label: 'Run first command', prompt: coursePackage.commands[0]?.trigger ?? '/help' },
        ],
      },
    ]);
    setCreatorStudioOpen(false);
  };

  const handleStartLearning = () => {
    if (!activeWorkspaceId) {
      return;
    }

    const mainSession = sessions[MAIN_SESSION_ID] as MainSessionRecord | undefined;
    if (!mainSession || mainSession.phase !== 'setup') {
      return;
    }

    // Build the planning conversation script
    const script = getPlanningScript(activeCoursePackage, learnerIntake);
    setPlanningScript(script);
    setPlanningTurnIndex(0);

    // Clear any prior planning timeouts
    planningTimeoutsRef.current.forEach(clearTimeout);
    planningTimeoutsRef.current = [];

    const firstQuestion = script[0]?.agentMessage ?? 'Let me help you build a learning plan.';

    // Transition to planning phase with first agent question as seed
    setSessions((prev) => {
      const session = prev[MAIN_SESSION_ID] as MainSessionRecord | undefined;
      if (!session || session.phase !== 'setup') {
        return prev;
      }
      return {
        ...prev,
        [MAIN_SESSION_ID]: {
          ...session,
          phase: 'planning',
          planning: buildPlanningState(),
          messages: [
            {
              id: 'planning-q-0',
              role: 'assistant' as const,
              content: firstQuestion,
              timestamp: createTimestamp(),
            },
          ],
        },
      };
    });

    // Auto-open canvas to show planning steps
    setCanvasView('skill-tree');
    setCanvasOpen(true);
  };

  const handleIntakeFileUpload = (fieldId: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      return;
    }

    updateActiveWorkspace((workspace) => ({
      ...workspace,
      learnerIntake: {
        ...workspace.learnerIntake,
        [fieldId]: file.name,
      },
    }));

    event.target.value = '';
  };

  const handleFillSampleIntake = () => {
    const sampleEntries = Object.fromEntries(
      activeCoursePackage.intakeFields
        .filter((field) => field.sampleValue)
        .map((field) => [field.id, field.sampleValue ?? '']),
    );

    updateActiveWorkspace((workspace) => ({
      ...workspace,
      learnerIntake: {
        ...workspace.learnerIntake,
        ...sampleEntries,
      },
    }));
  };

  const handleIntakeTextChange = (fieldId: string, value: string) => {
    updateActiveWorkspace((workspace) => ({
      ...workspace,
      learnerIntake: {
        ...workspace.learnerIntake,
        [fieldId]: value,
      },
    }));
  };

  const activateSession = (sessionId: string) => {
    if (!activeWorkspaceId) {
      return;
    }
    setActiveSessionId(sessionId);
    setNodes((prev) => applyActiveSession(prev, sessionId));
    const sessionBlocks = richBlocksBySession[sessionId] ?? EMPTY_RICH_BLOCKS;
    if (sessionBlocks.length > 0) {
      setCanvasView('content');
      setCanvasOpen(true);
    } else {
      setCanvasOpen(false);
    }
  };

  const appendMessage = (
    sessionId: string,
    message: Omit<ChatMessage, 'id' | 'timestamp'>,
  ) => {
    if (!activeWorkspaceId) {
      return;
    }
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
    intent,
    source,
    title,
    originText,
    promptProfile,
    contextNote,
    seedMessages,
    skillNodeId,
    rank,
  }: {
    parentId: string;
    kind: 'branch' | 'topic';
    intent?: BranchIntent;
    source?: BranchSource;
    title: string;
    originText?: string;
    promptProfile: string;
    contextNote: string;
    seedMessages: ChatMessage[];
    skillNodeId?: string;
    rank?: number;
  }): string | null => {
    if (!activeWorkspaceId) {
      return null;
    }
    const parent = nodeMap.get(parentId);
    if (!parent) {
      return null;
    }

    const sessionId = nextId('session');
    const nextNode: SessionNode = {
      id: sessionId,
      title,
      kind,
      intent,
      source,
      status: 'active',
      parentId,
      depth: parent.depth + 1,
      createdAt: nextTimeline(),
      rank,
      originText,
      skillNodeId,
    };

    setNodes((prev) => {
      return [...prev, nextNode];
    });
    setSessions((prev) => {
      const record: AnySessionRecord = kind === 'topic'
        ? {
            id: sessionId,
            kind: 'topic',
            promptProfile,
            contextNote,
            messages: seedMessages,
            planning: null,
          }
        : {
            id: sessionId,
            kind: 'branch',
            intent: intent ?? 'ask',
            source: source ?? 'manual-selection',
            promptProfile,
            contextNote,
            messages: seedMessages,
            planning: null,
          } satisfies BranchSessionRecord;
      return {
        ...prev,
        [sessionId]: record,
      };
    });
    setSessionRichBlocks(sessionId, []);

    // Link back: only update the skill node's sessionId for topic sessions
    // Ask/explain branches must not overwrite the topic session link
    if (skillNodeId && kind === 'topic') {
      setSessions((prev) => {
        const mainSess = prev[MAIN_SESSION_ID] as MainSessionRecord;
        if (!mainSess) return prev;
        return {
          ...prev,
          [MAIN_SESSION_ID]: {
            ...mainSess,
            skillNodes: mainSess.skillNodes.map((n) =>
              n.id === skillNodeId ? { ...n, sessionId } : n,
            ),
          },
        };
      });
    }

    activateSession(sessionId);
    return sessionId;
  };

  const finishPlanning = () => {
    const report = generateLearningReport(activeCoursePackage);
    const skillNodes: SkillNode[] = initializeSkillNodes(activeCoursePackage.skillNodes);
    const firstSkillTitle = skillNodes[0]?.title ?? 'the first skill';

    setSessions((prev) => {
      const session = prev[MAIN_SESSION_ID] as MainSessionRecord | undefined;
      if (!session) return prev;
      const doneSteps = (session.planning?.steps ?? []).map((s) => ({ ...s, state: 'done' as const }));
      return {
        ...prev,
        [MAIN_SESSION_ID]: {
          ...session,
          phase: 'learning' as const,
          planning: { steps: doneSteps, report },
          skillNodes,
          messages: [
            ...session.messages,
            {
              id: nextId('msg'),
              role: 'assistant' as const,
              content: `Your personalized learning plan is ready. Let's start with **${firstSkillTitle}**.`,
              timestamp: createTimestamp(),
            },
          ],
        },
      };
    });

    // Pre-seed global inbox with proactive items
    const initialInboxItems = generateInitialInboxItems(skillNodes, nextTimeline());
    setGlobalInbox((prev) => dedupeInboxItems(prev, initialInboxItems));
  };

  const handlePlanningMessage = (rawMessage: string) => {
    const script = planningScript;
    const turnIdx = planningTurnIndex;
    const currentTurn = script[turnIdx];
    if (!currentTurn) return;

    // 1. Append user message
    appendMessage(MAIN_SESSION_ID, { role: 'user', content: rawMessage });

    // 2. Mark current step as done
    setSessions((prev) => {
      const session = prev[MAIN_SESSION_ID] as MainSessionRecord | undefined;
      if (!session?.planning) return prev;
      return {
        ...prev,
        [MAIN_SESSION_ID]: {
          ...session,
          planning: {
            ...session.planning,
            steps: session.planning.steps.map((s) =>
              s.id === currentTurn.stepId ? { ...s, state: 'done' as const } : s,
            ),
          },
        },
      };
    });

    // 3. Generate agent acknowledgment after a short delay
    const ackTimeout = setTimeout(() => {
      const ackText = currentTurn.buildReply(rawMessage);
      appendMessage(MAIN_SESSION_ID, { role: 'assistant', content: ackText });

      const nextIdx = turnIdx + 1;
      const nextTurn = script[nextIdx];

      if (nextTurn) {
        // Mark next step as active
        setSessions((prev) => {
          const session = prev[MAIN_SESSION_ID] as MainSessionRecord | undefined;
          if (!session?.planning) return prev;
          return {
            ...prev,
            [MAIN_SESSION_ID]: {
              ...session,
              planning: {
                ...session.planning,
                steps: session.planning.steps.map((s) =>
                  s.id === nextTurn.stepId ? { ...s, state: 'active' as const } : s,
                ),
              },
            },
          };
        });

        // Post next question after another short delay
        const questionTimeout = setTimeout(() => {
          appendMessage(MAIN_SESSION_ID, {
            role: 'assistant',
            content: nextTurn.agentMessage,
          });
          setPlanningTurnIndex(nextIdx);
        }, 600);
        planningTimeoutsRef.current.push(questionTimeout);
      } else {
        // All steps done — transition to learning
        setPlanningTurnIndex(script.length);
        const transitionTimeout = setTimeout(() => {
          finishPlanning();
        }, 800);
        planningTimeoutsRef.current.push(transitionTimeout);
      }
    }, 600);
    planningTimeoutsRef.current.push(ackTimeout);
  };

  const handleSendMessage = (
    rawMessage: string,
    options?: { displayMessage?: string },
  ) => {
    if (!activeNode) {
      return;
    }

    // During planning, delegate to the planning conversation handler
    if (mainPhase === 'planning' && activeSessionId === MAIN_SESSION_ID) {
      handlePlanningMessage(options?.displayMessage ?? rawMessage);
      return;
    }

    appendMessage(activeSessionId, {
      role: 'user',
      content: options?.displayMessage ?? rawMessage,
    });

    const matchedCommand = findCommand(activeCoursePackage, rawMessage);
    if (matchedCommand) {
      appendMessage(activeSessionId, {
        role: 'system',
        content: `Executing command ${matchedCommand.trigger}...`,
      });
      const commandReply = buildSkillDrivenReply(activeCoursePackage, matchedCommand.trigger, rawMessage);
      appendMessage(activeSessionId, { role: 'assistant', content: commandReply });

      if (matchedCommand.defaultContentPackId) {
        const commandBlocks = resolvePackById(matchedCommand.defaultContentPackId);
        if (commandBlocks) {
          setSessionRichBlocks(activeSessionId, commandBlocks);
          setCanvasView('content');
          setCanvasOpen(true);
        }
      }
      return;
    }

    const contentResult = resolveRichContent({
      sessionKind: activeNode.kind,
      message: rawMessage,
      topicTitle: activeNode.kind === 'topic' ? activeNode.title : undefined,
    });

    const assistantText = contentResult.source === 'none'
      ? assistantFallbackReplyFor(activeNode.kind, options?.displayMessage ?? rawMessage, activeNode.intent)
      : contentResult.text;
    appendMessage(activeSessionId, { role: 'assistant', content: assistantText });

    // Generate global inbox items from interaction context
    const activeSessionRecord = sessions[activeSessionId];
    const msgCount = activeSessionRecord ? activeSessionRecord.messages.length : 0;
    const inboxItems = generateInteractionInboxItems({
      skillNodes: mainSkillNodes,
      activeSkillNodeId,
      messageCount: msgCount,
      userMessage: rawMessage,
      now: nextTimeline(),
    });
    if (inboxItems.length > 0) {
      setGlobalInbox((prev) => dedupeInboxItems(prev, inboxItems));
    }

    if (contentResult.rich) {
      setSessionRichBlocks(activeSessionId, contentResult.rich);
      setCanvasView('content');
      setCanvasOpen(true);
    }
  };

  const handleCreateBranch = (kind: 'ask' | 'explain', selectedText: string) => {
    if (!activeNode) {
      return;
    }
    setCanvasOpen(false);
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
      kind: 'branch',
      intent: kind,
      source: 'manual-selection',
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

  /* ---------- Global inbox handlers ---------- */

  const handleInboxAccept = (itemId: string) => {
    const item = globalInbox.find((i) => i.id === itemId);
    if (!item) return;

    switch (item.action) {
      case 'start-skill':
      case 'practice':
      case 'explore-topic':
      case 'review':
        if (item.skillNodeId) handleSelectSkillNode(item.skillNodeId);
        break;
      case 'export-progress':
        setCanvasView('skill-tree');
        setCanvasOpen(true);
        break;
      case 'set-goal':
      case 'branch':
        // For demo: just dismiss — these would trigger modals/chat in a real product
        break;
    }

    setGlobalInbox((prev) => prev.filter((i) => i.id !== itemId));
    setInboxOpen(false);
  };

  const handleInboxDismiss = (itemId: string) => {
    setGlobalInbox((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handleSelectSkillNode = (skillNodeId: string) => {
    if (!activeWorkspaceId) {
      return;
    }
    const mainSess = sessions[MAIN_SESSION_ID] as MainSessionRecord;
    const skillNode = mainSess?.skillNodes.find((n) => n.id === skillNodeId);
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
    const topicSessionId = createSubSession({
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

    // Emit the topic's default rich pack to the content panel
    const defaultPackId = TOPIC_DEFAULT_PACKS[skillNode.title]?.[0];
    if (defaultPackId && topicSessionId) {
      const topicBlocks = resolvePackById(defaultPackId);
      if (topicBlocks) {
        setSessionRichBlocks(topicSessionId, topicBlocks);
        setCanvasView('content');
        setCanvasOpen(true);
      }
    }
  };

  const handleCompleteSkill = (skillNodeId: string) => {
    if (!activeWorkspaceId) {
      return;
    }
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

    // Generate global inbox items for skill completion
    const completedSkill = mainSkillNodes.find((n) => n.id === skillNodeId);
    if (completedSkill) {
      const updatedNodes = completeSkillAndUnlock(mainSkillNodes, skillNodeId);
      const completionItems = generateSkillCompletionInboxItems(completedSkill, updatedNodes, nextTimeline());
      setGlobalInbox((prev) => dedupeInboxItems(prev, completionItems));
    }
  };

  const mainSession = sessions[MAIN_SESSION_ID] as MainSessionRecord | undefined;
  const mainSkillNodes = mainSession?.skillNodes ?? [];
  const mainPhase: MainSessionPhase = mainSession?.phase ?? 'planning';
  const planningQuickActions = mainPhase === 'planning'
    ? (planningScript[planningTurnIndex]?.quickActions ?? [])
    : [];
  const isIntakeReady = activeCoursePackage.intakeFields
    .filter((field) => field.required)
    .every((field) => Boolean(learnerIntake[field.id]?.trim()));
  const activeSkillNodeId = activeNode?.skillNodeId;
  const activeSkillStatus: SkillNodeStatus | null = activeSkillNodeId
    ? mainSkillNodes.find((node) => node.id === activeSkillNodeId)?.status ?? null
    : null;

  if (!activeWorkspaceId || !activeWorkspace || !activeNode || !activeSession) {
    if (creatorStudioOpen) {
      return (
        <CreatorBuilderPage
          onBack={() => setCreatorStudioOpen(false)}
          onPublish={handlePublishCreatorPackage}
        />
      );
    }

    if (previewPackageId) {
      const previewPkg = allCoursePackages.find((p) => p.id === previewPackageId);
      const community = COURSE_COMMUNITY[previewPackageId];
      if (previewPkg && community) {
        return (
          <CourseDetailPage
            pkg={previewPkg}
            community={community}
            onStartCourse={() => {
              setPreviewPackageId(null);
              handleStartPackageSession(previewPackageId);
            }}
            onBack={handleBackFromPreview}
          />
        );
      }
    }

    return (
      <WelcomePage
        sessions={customWorkspaceSummaries}
        coursePackages={coursePackageOptions}
        onOpenSession={handleOpenWorkspace}
        onCreateCustomSession={handleCreateCustomWorkspace}
        onStartPackageSession={handlePreviewPackage}
        onOpenCreatorStudio={() => setCreatorStudioOpen(true)}
      />
    );
  }

  if (mainPhase === 'setup') {
    return (
      <motion.div
        className="min-h-screen px-3 pb-4 pt-3 text-gray-900 sm:px-4 lg:px-5"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.header className="hero-shell rounded-2xl px-4 py-2 sm:px-5" variants={pageItemVariants}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="h-4 w-4 shrink-0 text-blue-600" />
              <p className="truncate text-sm font-semibold text-gray-900">{activeCoursePackage.title}</p>
            </div>
            <motion.button
              type="button"
              onClick={handleBackToWelcome}
              whileTap={reducedMotion ? undefined : { scale: 0.95 }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-gray-300 hover:text-gray-700"
              title="Back to sessions"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </motion.button>
          </div>
        </motion.header>

        <motion.main
          className="mt-4 flex min-h-[calc(100vh-7.5rem)] items-center justify-center"
          variants={pageItemVariants}
        >
          <div className="panel-surface w-full max-w-2xl px-6 py-8 text-center sm:px-8">
            <p className="font-heading text-xl font-semibold text-gray-900">{activeCoursePackage.intakeTitle}</p>
            <p className="mt-2 text-[15px] leading-relaxed text-gray-600">{activeCoursePackage.intakeDescription}</p>

            <div className="mt-5 rounded-xl border border-gray-200 bg-white/80 px-4 py-4 text-left">
              <p className="text-base font-semibold text-gray-700">Creator Guidance</p>
              <p className="mt-1 text-[13px] leading-relaxed text-gray-600">{activeCoursePackage.creatorPrompt}</p>
            </div>

            <div className="mt-4 space-y-3 text-left">
              {activeCoursePackage.intakeFields.map((field) => {
                const currentValue = learnerIntake[field.id] ?? '';
                return (
                  <div key={field.id} className="rounded-xl border border-gray-200 bg-white/70 px-4 py-3">
                    <p className="text-base font-semibold text-gray-700">
                      {field.label} {field.required ? <span className="text-rose-500">*</span> : null}
                    </p>
                    <p className="mt-1 text-[13px] text-gray-600">{field.description}</p>

                    {field.type === 'file' ? (
                      <label className="mt-3 inline-flex cursor-pointer items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-blue-300 hover:text-blue-700">
                        Upload {field.label}
                        <input
                          type="file"
                          accept={field.accept}
                          onChange={(event) => handleIntakeFileUpload(field.id, event)}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <input
                        type={field.type === 'url' ? 'url' : 'text'}
                        value={currentValue}
                        onChange={(event) => handleIntakeTextChange(field.id, event.target.value)}
                        placeholder={field.placeholder}
                        className="mt-3 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                      />
                    )}

                    <p className="mt-2 text-[13px] text-gray-600">
                      {currentValue ? `Provided: ${currentValue}` : 'No input yet.'}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={handleFillSampleIntake}
                className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition hover:border-gray-300 hover:text-gray-800"
              >
                Fill Sample Inputs
              </button>
            </div>

            <motion.button
              type="button"
              onClick={handleStartLearning}
              disabled={!isIntakeReady}
              whileHover={reducedMotion ? undefined : { y: -1 }}
              whileTap={reducedMotion ? undefined : { scale: 0.98 }}
              transition={springFor(reducedMotion, 'snappy')}
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-gray-900 px-5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              Start Learning
            </motion.button>
            {!isIntakeReady ? (
              <p className="mt-2 text-[13px] text-gray-600">Complete required fields to continue.</p>
            ) : null}
          </div>
        </motion.main>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen px-3 pb-4 pt-3 text-gray-900 sm:px-4 lg:px-5"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.header className="hero-shell rounded-2xl px-4 py-2 sm:px-5" variants={pageItemVariants}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="h-4 w-4 shrink-0 text-blue-600" />
            <p className="truncate text-sm font-semibold text-gray-900">{activeCoursePackage.title}</p>
            <span className="hidden text-xs text-gray-400 md:inline">/</span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={activeSessionId}
                className="hidden truncate text-xs text-gray-500 md:block"
                initial={{ opacity: 0, y: reducedMotion ? 0 : 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reducedMotion ? 0 : -3 }}
                transition={tweenFor(reducedMotion, MOTION_DURATION.fast)}
              >
                {activeNode.title}
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-1.5">
            {mainPhase === 'learning' && (
              <motion.button
                type="button"
                onClick={() => { setCanvasView('skill-tree'); setCanvasOpen((prev) => canvasView === 'skill-tree' ? !prev : true); }}
                whileTap={reducedMotion ? undefined : { scale: 0.95 }}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition ${canvasOpen && canvasView === 'skill-tree' ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-500 hover:border-blue-200 hover:text-blue-600'}`}
                title="Skill Map"
              >
                <MapIcon className="h-3.5 w-3.5" />
              </motion.button>
            )}
            <motion.button
              type="button"
              onClick={handleBackToWelcome}
              whileTap={reducedMotion ? undefined : { scale: 0.95 }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-gray-300 hover:text-gray-700"
              title="Back to sessions"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {(() => {
        const showCanvas = canvasOpen && (canvasView === 'skill-tree' || visibleRichBlocks.length > 0);
        const dur = durationFor(reducedMotion, MOTION_DURATION.base);
        const ease = MOTION_EASE.enter;
        return (
      <motion.main className="mt-3 flex h-[calc(100vh-5.5rem)] gap-3 overflow-hidden" variants={pageItemVariants}>
        {/* Main chat column */}
        <motion.div
          animate={{ flexBasis: showCanvas ? '35%' : '100%', maxWidth: showCanvas ? '100%' : '48rem' }}
          transition={{ duration: dur, ease }}
          style={{ flexShrink: 0, flexGrow: 1 }}
          className={`flex min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white/90 shadow-sm backdrop-blur-sm ${showCanvas ? '' : 'mx-auto'}`}
        >
          {/* Skill progress bar — only show in learning phase */}
          {mainPhase === 'learning' && mainSkillNodes.length > 0 && (
            <SkillProgressBar
              skillNodes={mainSkillNodes}
              activeSkillNodeId={activeSkillNodeId}
              onSelectSkill={handleSelectSkillNode}
              onCompleteSkill={handleCompleteSkill}
            />
          )}
          {/* Chat */}
          <div className="min-h-0 flex-1">
            <SessionChat
              key={activeSession.id}
              activeNode={activeNode}
              activeSession={activeSession}
              mainPhase={mainPhase}
              activeSkillNodeId={activeSkillNodeId}
              activeSkillStatus={activeSkillStatus}
              creatorCommands={activeCoursePackage.commands.map((command) => ({
                id: command.id,
                trigger: command.trigger,
                name: command.name,
                description: command.description,
                inputFields: command.inputFields,
              }))}
              packageSuggestedActions={activeCoursePackage.suggestedActions ?? []}
              planningQuickActions={planningQuickActions}
              onSendMessage={handleSendMessage}
              onCreateBranch={handleCreateBranch}
              richBlocks={visibleRichBlocks}
              canvasOpen={canvasOpen && canvasView === 'content'}
              onToggleCanvas={() => {
                if (canvasOpen && canvasView === 'content') {
                  setCanvasOpen(false);
                } else {
                  setCanvasView('content');
                  setCanvasOpen(true);
                }
              }}
            />
          </div>
        </motion.div>

        {/* Canvas panel — always mounted, animates width */}
        <motion.div
          animate={{
            flexBasis: showCanvas ? '65%' : '0%',
            opacity: showCanvas ? 1 : 0,
          }}
          transition={{ duration: dur, ease }}
          style={{ flexShrink: 0, overflow: 'hidden' }}
          className="hidden lg:block"
        >
          {(canvasView === 'skill-tree' || visibleRichBlocks.length > 0) && (
            <CanvasSlideOver
              view={canvasView}
              blocks={visibleRichBlocks}
              onClose={() => setCanvasOpen(false)}
              onSwitchView={setCanvasView}
              skillTreeProps={{
                nodes,
                activeSessionId,
                skillNodes: mainSkillNodes,
                mainPhase,
                planningState: mainSession?.planning ?? null,
                onSelectSession: activateSession,
                onSelectSkillNode: handleSelectSkillNode,
              }}
            />
          )}
        </motion.div>
      </motion.main>
        );
      })()}

      {/* ── Global Agent Inbox ── */}
      <div className="fixed bottom-24 right-24 z-50">
        <AnimatePresence>
          {inboxOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={tweenFor(reducedMotion, MOTION_DURATION.fast)}
              className="absolute bottom-14 right-0 w-80 max-h-[28rem] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl"
            >
              <div className="border-b border-gray-100 px-4 py-3">
                <p className="text-sm font-semibold text-gray-800">Agent Inbox</p>
                <p className="text-xs text-gray-500">Proactive suggestions from your learning agent</p>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                {globalInbox.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-gray-400">No suggestions right now</p>
                ) : (
                  globalInbox.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 px-4 py-3 transition hover:bg-gray-50/60">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Sparkles className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-800">{item.title}</p>
                        <p className="mt-0.5 text-xs text-gray-500">{item.description}</p>
                      </div>
                      <div className="flex shrink-0 gap-1 pt-0.5">
                        <button
                          type="button"
                          onClick={() => handleInboxAccept(item.id)}
                          className="rounded-md p-1 text-blue-600 transition hover:bg-blue-50"
                          title="Accept"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInboxDismiss(item.id)}
                          className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100"
                          title="Dismiss"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setInboxOpen((prev) => !prev)}
          className="relative flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-700 active:scale-95"
        >
          <Inbox className="h-5 w-5" />
          {globalInbox.length > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
              {globalInbox.length}
            </span>
          )}
        </button>
      </div>
    </motion.div>
  );
}

export default App;
