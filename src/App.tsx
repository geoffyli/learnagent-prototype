import { ChangeEvent, SetStateAction, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Sparkles, TreePine } from 'lucide-react';
import SessionCanvas from './components/SessionCanvas';
import SessionChat from './components/SessionChat';
import RichContentPanel from './components/RichContentPanel';
import WelcomePage from './components/WelcomePage';
import CreatorBuilderPage from './components/CreatorBuilderPage';
import CourseDetailPage from './components/CourseDetailPage';
import { COURSE_COMMUNITY } from './data/courseCommunity';
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
  AgentNodeSuggestion,
  AnySessionRecord,
  BranchIntent,
  BranchSessionRecord,
  BranchSource,
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
import { CONTENT_PACK_LABELS, TOPIC_DEFAULT_PACKS } from './data/richReplies';
import { resolvePackById, resolveRichContent } from './state/content-resolver';
import { dedupeSuggestions, generateNodeSuggestions } from './state/skill-tree-agent';
import type { CoursePackageConfig } from './types/course-package';

// Legacy export retained for existing prototype files that still import this type.
export type ContentType = 'welcome' | 'concept-map' | 'code' | 'flashcards' | 'diagram';

const MAIN_SESSION_ID = 'session-main';
const EMPTY_RICH_BLOCKS: ContentBlock[] = [];
const EMPTY_RICH_BLOCKS_BY_SESSION: Record<string, ContentBlock[]> = {};
const EMPTY_NODES: SessionNode[] = [];
const EMPTY_SESSIONS: Record<string, AnySessionRecord> = {};
const EMPTY_SUGGESTIONS: AgentNodeSuggestion[] = [];

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

const PRODUCT_ANALYST_SKILL_NODES: Omit<SkillNode, 'sessionId'>[] = [
  {
    id: 'skill-product-metrics',
    title: 'Product Metrics Foundations',
    description: 'North-star metrics, guardrails, and metric tree decomposition',
    status: 'available',
    dependsOn: [],
    col: 0,
    estimatedMinutes: 35,
  },
  {
    id: 'skill-event-instrumentation',
    title: 'Event Instrumentation Basics',
    description: 'Design event schema and validate analytics tracking quality',
    status: 'locked',
    dependsOn: ['skill-product-metrics'],
    col: 1,
    estimatedMinutes: 40,
  },
  {
    id: 'skill-funnel-retention',
    title: 'Funnel and Retention Analysis',
    description: 'Activation, retention cohorts, and behavioral segment diagnosis',
    status: 'locked',
    dependsOn: ['skill-event-instrumentation'],
    col: 2,
    estimatedMinutes: 45,
  },
  {
    id: 'skill-experiment-readout',
    title: 'Experiment Readout',
    description: 'Read A/B test outputs and convert them into product decisions',
    status: 'locked',
    dependsOn: ['skill-funnel-retention'],
    col: 3,
    estimatedMinutes: 40,
  },
  {
    id: 'skill-product-storytelling',
    title: 'Product Narrative Storytelling',
    description: 'Communicate findings with concise business narratives',
    status: 'locked',
    dependsOn: ['skill-experiment-readout'],
    col: 4,
    estimatedMinutes: 35,
  },
  {
    id: 'skill-pm-case-sim',
    title: 'Product Analytics Case Simulation',
    description: 'End-to-end product case simulation under interview constraints',
    status: 'locked',
    dependsOn: ['skill-product-storytelling'],
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

const PRODUCT_ANALYST_SKILL_PACKS = [
  {
    id: 'skillpack-product-metrics',
    name: 'Product Metrics Coach',
    intent: 'Metrics decomposition',
    instructions: 'Guide learners to decompose product goals into measurable trees and guardrails.',
    exampleInput: 'How do I structure activation metrics?',
    exampleOutput: 'Start with north-star outcome, then define activation events and guardrails by stage.',
  },
  {
    id: 'skillpack-experiment-readout',
    name: 'Experiment Readout Coach',
    intent: 'A/B decision support',
    instructions: 'Explain experiment outcomes in product decision language with confidence boundaries.',
    exampleInput: 'Variant B improved conversion but hurt retention.',
    exampleOutput: 'Frame trade-off, quantify impact, then recommend rollout scope and follow-up test.',
  },
];

const PRODUCT_ANALYST_COMMANDS = [
  {
    id: 'cmd-funnel-diagnose',
    name: 'Funnel Diagnose',
    trigger: '/funnel-diagnose',
    description: 'Diagnose funnel drop-offs from product perspective.',
    skillPackId: 'skillpack-product-metrics',
    defaultPrompt: 'Diagnose this funnel and identify top drop-off causes.',
    outputHint: 'Return stage-by-stage diagnosis and next instrumentation check.',
    defaultContentPackId: 'render-waterfall-diagnosis',
    inputFields: [
      {
        id: 'funnel-name',
        label: 'Funnel name',
        placeholder: 'Example: onboarding activation funnel',
        required: true,
        type: 'text' as const,
      },
    ],
  },
  {
    id: 'cmd-exp-readout',
    name: 'Experiment Readout',
    trigger: '/exp-readout',
    description: 'Generate a decision-ready experiment readout.',
    skillPackId: 'skillpack-experiment-readout',
    defaultPrompt: 'Create a decision-ready experiment readout.',
    outputHint: 'Return summary, trade-off, recommendation, and risk.',
    defaultContentPackId: 'effect-dependency-timeline',
    inputFields: [
      {
        id: 'experiment-link',
        label: 'Experiment doc or link',
        placeholder: 'Paste experiment summary URL or note',
        required: false,
        type: 'url' as const,
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
      'Upload your materials and learning goal. LearnAgent will build a personalized path.',
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
      'Provide the requested materials so LearnAgent can tailor your path.',
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
    id: 'pkg-product-analyst-growth-sprint',
    title: 'Product Analyst Growth Sprint',
    subtitle: 'Product metrics + experimentation + storytelling',
    defaultSessionTitle: 'Product Analyst Growth Sprint Session',
    intakeTitle: 'Prepare your personalized Product Analyst sprint',
    intakeDescription:
      'Share product materials so LearnAgent can personalize analysis and experiment sessions.',
    creatorPrompt:
      'Please upload one product brief and one dashboard link for package-specific coaching.',
    intakeFields: [
      {
        id: 'product-brief',
        label: 'Product Brief File',
        description: 'Upload a PRD or product brief (PDF, DOC, DOCX).',
        type: 'file',
        required: true,
        accept: '.pdf,.doc,.docx',
        sampleValue: 'sample-product-brief.pdf',
      },
      {
        id: 'dashboard-link',
        label: 'Dashboard URL',
        description: 'Share one analytics dashboard link you want to improve.',
        type: 'url',
        required: true,
        placeholder: 'https://analytics.company.com/dashboard/123',
        sampleValue: 'https://analytics.company.com/dashboard/growth-retention',
      },
      {
        id: 'focus-question',
        label: 'Focus Question',
        description: 'Optional: describe one product problem you want to solve.',
        type: 'text',
        required: false,
        placeholder: 'How can we improve onboarding conversion in week 1?',
        sampleValue: 'How can we improve activation in the first 3 days?',
      },
    ],
    skillNodes: PRODUCT_ANALYST_SKILL_NODES,
    skillPacks: PRODUCT_ANALYST_SKILL_PACKS,
    commands: PRODUCT_ANALYST_COMMANDS,
    runtimePolicy: {
      systemPrompt: 'You are a product analytics coach focused on metric trees, instrumentation, and experiments.',
      guardrails: 'Always connect metric changes to product decisions and state uncertainty clearly.',
    },
    suggestedActions: [
      { label: 'Diagnose funnel', prompt: '/funnel-diagnose funnel-name="onboarding activation"' },
      { label: 'Generate experiment readout', prompt: '/exp-readout experiment-link="https://example.com/exp-42"' },
    ],
    source: 'seed',
  },
];

const DEFAULT_COURSE_PACKAGE_ID = 'pkg-data-analyst-job-sprint';

function getCoursePackageById(packages: CoursePackageConfig[], id: string): CoursePackageConfig {
  return packages.find((item) => item.id === id) ?? packages[0];
}

function summarizeIntakeForPlanning(coursePackage: CoursePackageConfig, intake: Record<string, string>): string {
  const collected = coursePackage.intakeFields
    .map((field) => {
      const value = intake[field.id]?.trim();
      if (!value) {
        return null;
      }
      return `${field.label}: ${value}`;
    })
    .filter((item): item is string => Boolean(item));

  if (collected.length === 0) {
    return 'No learner materials were provided yet. Continue with a default profile.';
  }

  return `Learner materials received:\n- ${collected.join('\n- ')}`;
}


function createTimestamp(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function planningSeedMessage(coursePackage: CoursePackageConfig, intakeSummary: string): ChatMessage {

  return {
    id: 'seed-1',
    role: 'assistant',
    content:
      `Let me build your personalized ${coursePackage.title} plan.\n\n${intakeSummary}\n\nI will now walk through 5 planning phases so you can see exactly how the path is generated.`,
    timestamp: '09:00',
  };
}

const PLANNING_STEP_USER_MESSAGES: Record<string, string> = {
  purpose: 'Goal: become interview-ready for this package',
  baseline: 'Baseline: I have partial foundations and need structured improvement',
  research: 'Timeline: comfortable in 8 weeks',
  milestones: 'Please draft a milestone roadmap for me',
  report: 'Looks good — finalize the plan',
};

function buildPlanningStepMessages(coursePackage: CoursePackageConfig): Record<string, string> {
  const [firstNode, secondNode, thirdNode] = coursePackage.skillNodes;
  const lastNode = coursePackage.skillNodes[coursePackage.skillNodes.length - 1];

  return {
    purpose:
      `Got it. Your target is ${coursePackage.title}. I will optimize this plan for practical interview performance and output quality for this package.`,
    baseline:
      `Baseline assessed. I will accelerate fundamentals where possible and focus on your highest-impact gaps for ${coursePackage.title}.`,
    research:
      `References gathered. I selected realistic interview scenarios and package-specific practice prompts so this stays execution-oriented instead of theory-heavy.`,
    milestones:
      `Milestone draft ready. I structured an 8-week path with dependency gates:\n\n→ Weeks 1-2: ${firstNode?.title ?? 'Core Foundation'} + ${secondNode?.title ?? 'Applied Skills'}\n→ Weeks 3-4: ${thirdNode?.title ?? 'Intermediate Progression'}\n→ Weeks 5-8: Advanced practice ending with ${lastNode?.title ?? 'Case Simulation'}\n\nEach stage includes practice, mastery checks, and review tasks.`,
    report:
      `Learning plan finalized. I generated a personalized ${coursePackage.skillNodes.length}-node skill tree with unlock dependencies, mastery checkpoints, and review scheduling. Start with ${firstNode?.title ?? 'the first node'} to unlock the rest of the sprint.`,
  };
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
    return `Good question. Here's what matters for "${message}" in a data analyst workflow. You can ask for a breakdown, comparison table, practice prompt, or review drill.`;
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

interface WorkspaceState {
  id: string;
  title: string;
  coursePackageId: string;
  origin: 'custom' | 'package';
  createdAt: number;
  updatedAt: number;
  leftTab: 'skill-tree' | 'content';
  tabDirection: number;
  richBlocksBySession: Record<string, ContentBlock[]>;
  agentSuggestionsBySession: Record<string, AgentNodeSuggestion[]>;
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
    leftTab: 'skill-tree',
    tabDirection: -1,
    richBlocksBySession: {
      [MAIN_SESSION_ID]: [],
    },
    agentSuggestionsBySession: {
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

  const setLeftTab = (next: SetStateAction<'skill-tree' | 'content'>) => {
    updateActiveWorkspace((workspace) => ({
      ...workspace,
      leftTab: resolveState(workspace.leftTab, next),
    }));
  };

  const setTabDirection = (next: SetStateAction<number>) => {
    updateActiveWorkspace((workspace) => ({
      ...workspace,
      tabDirection: resolveState(workspace.tabDirection, next),
    }));
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

  const setAgentSuggestionsBySession = (
    sessionId: string,
    next: SetStateAction<AgentNodeSuggestion[]>,
  ) => {
    updateActiveWorkspace((workspace) => ({
      ...workspace,
      agentSuggestionsBySession: {
        ...workspace.agentSuggestionsBySession,
        [sessionId]: resolveState(workspace.agentSuggestionsBySession[sessionId] ?? EMPTY_SUGGESTIONS, next),
      },
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

  const leftTab = workspaceState?.leftTab ?? 'skill-tree';
  const tabDirection = workspaceState?.tabDirection ?? -1;
  const richBlocksBySession = workspaceState?.richBlocksBySession ?? EMPTY_RICH_BLOCKS_BY_SESSION;
  const nodes = workspaceState?.nodes ?? EMPTY_NODES;
  const sessions = workspaceState?.sessions ?? EMPTY_SESSIONS;
  const agentSuggestionsBySession = workspaceState?.agentSuggestionsBySession ?? {};
  const learnerIntake = workspaceState?.learnerIntake ?? {};
  const activeCoursePackage = getCoursePackageById(
    allCoursePackages,
    workspaceState?.coursePackageId ?? DEFAULT_COURSE_PACKAGE_ID,
  );
  const activeSessionId = workspaceState?.activeSessionId ?? MAIN_SESSION_ID;
  const activeRichBlocks = richBlocksBySession[activeSessionId] ?? EMPTY_RICH_BLOCKS;
  const activeSuggestions = agentSuggestionsBySession[activeSessionId] ?? EMPTY_SUGGESTIONS;

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
  const activePathLabel = activePath.map((node) => node.title).join(' / ') || 'No session selected';
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

  const handleStartPlanning = () => {
    if (!activeWorkspaceId) {
      return;
    }

    const intakeSummary = summarizeIntakeForPlanning(activeCoursePackage, learnerIntake);

    setSessions((prev) => {
      const mainSession = prev[MAIN_SESSION_ID] as MainSessionRecord | undefined;
      if (!mainSession || mainSession.phase !== 'setup') {
        return prev;
      }

      return {
        ...prev,
        [MAIN_SESSION_ID]: {
          ...mainSession,
          phase: 'planning',
          planning: buildPlanningState(),
          messages: [planningSeedMessage(activeCoursePackage, intakeSummary)],
        },
      };
    });
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

  const changeLeftTab = (nextTab: 'skill-tree' | 'content') => {
    setTabDirection(nextTab === 'content' ? 1 : -1);
    setLeftTab(nextTab);
  };

  const activateSession = (sessionId: string) => {
    if (!activeWorkspaceId) {
      return;
    }
    setActiveSessionId(sessionId);
    setNodes((prev) => applyActiveSession(prev, sessionId));
    // Auto-switch the canvas tab based on whether the session has rich content.
    // Use the current rendered state (not pending updates) to decide.
    // When called from createSubSession, blocks are not set yet (empty/undefined),
    // so we'll fall to 'skill-tree'; the explicit changeLeftTab('content') call
    // that follows createSubSession will override this for new topic sessions.
    const sessionBlocks = richBlocksBySession[sessionId] ?? EMPTY_RICH_BLOCKS;
    changeLeftTab(sessionBlocks.length > 0 ? 'content' : 'skill-tree');
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
    setAgentSuggestionsBySession(sessionId, []);

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
    return sessionId;
  };

  const handleSendMessage = (
    rawMessage: string,
    options?: { displayMessage?: string },
  ) => {
    if (!activeNode) {
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
          changeLeftTab('content');
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

    const suggestions = generateNodeSuggestions({
      parentSessionId: activeSessionId,
      parentTitle: activeNode.title,
      skillNodeId: activeNode.skillNodeId,
      userMessage: rawMessage,
      assistantMessage: assistantText,
      siblingNodes: nodes,
      now: nextTimeline(),
    });
    setAgentSuggestionsBySession(activeSessionId, (prev) => dedupeSuggestions(prev, suggestions));

    if (contentResult.rich) {
      setSessionRichBlocks(activeSessionId, contentResult.rich);
      changeLeftTab('content');
    }
  };

  const handleCreateBranch = (kind: 'ask' | 'explain', selectedText: string) => {
    if (!activeNode) {
      return;
    }
    changeLeftTab('skill-tree');
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

  const handleAcceptSuggestion = (sessionId: string, suggestionId: string) => {
    const suggestion = (agentSuggestionsBySession[sessionId] ?? []).find((item) => item.id === suggestionId);
    if (!suggestion || !activeWorkspaceId) {
      return;
    }

    if (suggestion.action === 'create') {
      const siblingCount = nodes.filter((node) => node.parentId === sessionId).length;
      createSubSession({
        parentId: sessionId,
        kind: 'branch',
        intent: suggestion.intent ?? 'ask',
        source: 'agent-suggestion',
        title: suggestion.title,
        originText: suggestion.originText,
        promptProfile: suggestion.promptProfile,
        contextNote: suggestion.contextNote,
        seedMessages: [
          {
            id: nextId('msg'),
            role: 'assistant',
            content: suggestion.seedIntro,
            timestamp: createTimestamp(),
          },
        ],
        skillNodeId: suggestion.skillNodeId,
        rank: siblingCount,
      });
    }

    if (suggestion.action === 'retitle') {
      setNodes((prev) =>
        prev.map((node) =>
          node.id === suggestion.targetSessionId ? { ...node, title: suggestion.nextTitle } : node,
        ),
      );
    }

    if (suggestion.action === 'reprioritize') {
      setNodes((prev) =>
        prev.map((node) =>
          node.id === suggestion.targetSessionId ? { ...node, rank: suggestion.nextRank } : node,
        ),
      );
    }

    setAgentSuggestionsBySession(sessionId, (prev) => prev.filter((item) => item.id !== suggestionId));
  };

  const handleDismissSuggestion = (sessionId: string, suggestionId: string) => {
    setAgentSuggestionsBySession(sessionId, (prev) => prev.filter((item) => item.id !== suggestionId));
  };

  const handleAdvancePlanning = () => {
    if (!activeSession) return;
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

    const planningStepMessages = buildPlanningStepMessages(activeCoursePackage);
    const narrativeContent = planningStepMessages[completingStep.id];
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
      const report = isFinished ? generateLearningReport(activeCoursePackage) : null;

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
    if (!activeWorkspaceId) {
      return;
    }
    const mainSession = sessions[MAIN_SESSION_ID] as MainSessionRecord;
    const report = mainSession?.planning?.report;
    if (!report) {
      return;
    }

    const skillNodes: SkillNode[] = initializeSkillNodes(activeCoursePackage.skillNodes);

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
    if (!activeWorkspaceId) {
      return;
    }
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
        changeLeftTab('content');
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
  };

  const mainSession = sessions[MAIN_SESSION_ID] as MainSessionRecord | undefined;
  const mainSkillNodes = mainSession?.skillNodes ?? [];
  const mainPhase: MainSessionPhase = mainSession?.phase ?? 'planning';
  const isIntakeReady = activeCoursePackage.intakeFields
    .filter((field) => field.required)
    .every((field) => Boolean(learnerIntake[field.id]?.trim()));
  const activeSkillNodeId = activeNode?.skillNodeId;
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
        className="min-h-screen px-3 pb-4 pt-3 text-slate-900 sm:px-4 lg:px-5"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.header className="hero-shell rounded-2xl px-4 py-3 sm:px-5" variants={pageItemVariants}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-2 font-heading text-base font-semibold text-slate-900">
                <Sparkles className="h-4 w-4 text-teal-600" />
                LearnAgent Prototype
              </p>
              <p className="mt-1 text-base text-slate-700">{activeWorkspace.title}</p>
              <p className="mt-0.5 text-[13px] text-slate-600">Package: {activeCoursePackage.title}</p>
            </div>
            <motion.button
              type="button"
              onClick={handleBackToWelcome}
              whileHover={reducedMotion ? undefined : { y: -1 }}
              whileTap={reducedMotion ? undefined : { scale: 0.98 }}
              className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 transition hover:border-teal-200 hover:text-teal-700"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Sessions
            </motion.button>
          </div>
        </motion.header>

        <motion.main
          className="mt-4 flex min-h-[calc(100vh-7.5rem)] items-center justify-center"
          variants={pageItemVariants}
        >
          <div className="panel-surface w-full max-w-2xl px-6 py-8 text-center sm:px-8">
            <p className="font-heading text-xl font-semibold text-slate-900">{activeCoursePackage.intakeTitle}</p>
            <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{activeCoursePackage.intakeDescription}</p>

            <div className="mt-5 rounded-xl border border-slate-200 bg-white/80 px-4 py-4 text-left">
              <p className="text-base font-semibold text-slate-700">Creator Guidance</p>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-600">{activeCoursePackage.creatorPrompt}</p>
            </div>

            <div className="mt-4 space-y-3 text-left">
              {activeCoursePackage.intakeFields.map((field) => {
                const currentValue = learnerIntake[field.id] ?? '';
                return (
                  <div key={field.id} className="rounded-xl border border-slate-200 bg-white/70 px-4 py-3">
                    <p className="text-base font-semibold text-slate-700">
                      {field.label} {field.required ? <span className="text-rose-500">*</span> : null}
                    </p>
                    <p className="mt-1 text-[13px] text-slate-600">{field.description}</p>

                    {field.type === 'file' ? (
                      <label className="mt-3 inline-flex cursor-pointer items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-teal-300 hover:text-teal-700">
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
                        className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-100"
                      />
                    )}

                    <p className="mt-2 text-[13px] text-slate-600">
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
                className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
              >
                Fill Sample Inputs
              </button>
            </div>

            <motion.button
              type="button"
              onClick={handleStartPlanning}
              disabled={!isIntakeReady}
              whileHover={reducedMotion ? undefined : { y: -1 }}
              whileTap={reducedMotion ? undefined : { scale: 0.98 }}
              transition={springFor(reducedMotion, 'snappy')}
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Generate Learning Plan
            </motion.button>
            {!isIntakeReady ? (
              <p className="mt-2 text-[13px] text-slate-600">Complete required fields to continue.</p>
            ) : null}
          </div>
        </motion.main>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen px-3 pb-4 pt-3 text-slate-900 sm:px-4 lg:px-5"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.header className="hero-shell rounded-2xl px-4 py-3 sm:px-5" variants={pageItemVariants}>
        <div className="flex items-center justify-between gap-3">
          <div>
              <p className="inline-flex items-center gap-2 font-heading text-base font-semibold text-slate-900">
                <Sparkles className="h-4 w-4 text-teal-600" />
                LearnAgent Prototype
              </p>
              <p className="mt-1 text-base text-slate-700">{activeWorkspace.title}</p>
              <p className="mt-0.5 text-[13px] text-slate-600">Package: {activeCoursePackage.title}</p>
            </div>
          <div className="flex items-center gap-2">
            <motion.button
              type="button"
              onClick={handleBackToWelcome}
              whileHover={reducedMotion ? undefined : { y: -1 }}
              whileTap={reducedMotion ? undefined : { scale: 0.98 }}
              className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 transition hover:border-teal-200 hover:text-teal-700"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Sessions
            </motion.button>
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
                {(visibleRichBlocks.length > 0 || leftTab === 'content') && (
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
                      activeSuggestions={activeSuggestions}
                      skillNodes={mainSkillNodes}
                      mainPhase={mainPhase}
                      planningState={mainSession?.planning ?? null}
                      onSelectSession={activateSession}
                      onSelectSkillNode={handleSelectSkillNode}
                      onAcceptSuggestion={(suggestionId) => handleAcceptSuggestion(activeSessionId, suggestionId)}
                      onDismissSuggestion={(suggestionId) => handleDismissSuggestion(activeSessionId, suggestionId)}
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
                    <RichContentPanel
                      blocks={visibleRichBlocks}
                      onCreateBranch={handleCreateBranch}
                    />
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
