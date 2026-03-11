import type { ContentBlock } from '../types/content-blocks';

export const CONTENT_PACK_IDS = [
  'hooks-lifecycle-map',
  'effect-dependency-timeline',
  'state-vs-reducer-tradeoff',
  'stale-closure-debug-trace',
  'context-rerender-metrics',
  'memoization-decision-kit',
  'custom-hook-blueprint',
  'async-fetching-safety-checklist',
  'render-waterfall-diagnosis',
  'anti-patterns-callout-wall',
  'performance-playbook',
  'architecture-learning-roadmap',
] as const;

export type ContentPackId = (typeof CONTENT_PACK_IDS)[number];

export const CONTENT_PACK_LABELS: Record<ContentPackId, string> = {
  'hooks-lifecycle-map': 'Skill Dependency Map',
  'effect-dependency-timeline': 'Interview Timeline',
  'state-vs-reducer-tradeoff': 'SQL vs BI Focus Matrix',
  'stale-closure-debug-trace': 'SQL Query Debug Trace',
  'context-rerender-metrics': 'Mastery Metrics Snapshot',
  'memoization-decision-kit': 'Question Strategy Kit',
  'custom-hook-blueprint': 'Case Answer Blueprint',
  'async-fetching-safety-checklist': 'Resume Tailoring Checklist',
  'render-waterfall-diagnosis': 'Funnel Diagnosis Walkthrough',
  'anti-patterns-callout-wall': 'Interview Anti-pattern Wall',
  'performance-playbook': 'Dashboard Performance Playbook',
  'architecture-learning-roadmap': '8-Week Career Roadmap',
};

export const CONTENT_PACKS: Record<ContentPackId, ContentBlock[]> = {
  'hooks-lifecycle-map': [
    {
      type: 'concept-map',
      title: 'Data Analyst Skill Graph',
      nodes: [
        { id: 'sql-base', label: 'SQL Foundations', lane: 'core' },
        { id: 'sql-adv', label: 'Analytical SQL', lane: 'core' },
        { id: 'metrics', label: 'Metrics & Funnels', lane: 'core' },
        { id: 'dashboards', label: 'Dashboard Storytelling', lane: 'support' },
        { id: 'abtest', label: 'A/B Testing Basics', lane: 'support' },
        { id: 'case-risk', label: 'Interview Case Risk', lane: 'risk' },
      ],
      edges: [
        { from: 'sql-base', to: 'sql-adv', label: 'build query depth' },
        { from: 'sql-adv', to: 'metrics', label: 'derive product signals' },
        { from: 'metrics', to: 'dashboards', label: 'communicate clearly' },
        { from: 'dashboards', to: 'abtest', label: 'support experiments' },
        { from: 'abtest', to: 'case-risk', label: 'if weak narrative' },
      ],
    },
  ],
  'effect-dependency-timeline': [
    {
      type: 'timeline',
      title: 'Mock Interview Session Timeline',
      steps: [
        { id: 'i1', title: 'Clarify business goal', detail: 'Restate objective and success metric.', state: 'done' },
        { id: 'i2', title: 'Draft SQL approach', detail: 'Explain tables, joins, and filters before coding.', state: 'active' },
        { id: 'i3', title: 'Interpret output', detail: 'Translate numbers into business insights.', state: 'next' },
        { id: 'i4', title: 'Recommend action', detail: 'End with a decision and next experiment.', state: 'next' },
      ],
    },
  ],
  'state-vs-reducer-tradeoff': [
    {
      type: 'comparison-table',
      title: 'Prioritization Matrix: SQL Depth vs BI Storytelling',
      leftLabel: 'SQL Depth',
      rightLabel: 'BI Storytelling',
      rows: [
        { aspect: 'Best for', left: 'Technical screenings', right: 'Hiring manager rounds' },
        { aspect: 'Failure mode', left: 'Wrong logic in joins/windows', right: 'Charts without business narrative' },
        { aspect: 'Practice loop', left: 'Timed query drills', right: 'Insight-first presentation drills' },
      ],
    },
    {
      type: 'metric-strip',
      title: 'Current Readiness Signals',
      metrics: [
        { id: 'r1', label: 'SQL accuracy', value: '74%', tone: 'neutral' },
        { id: 'r2', label: 'Narrative clarity', value: '52%', tone: 'warn' },
        { id: 'r3', label: 'Case confidence', value: '61%', tone: 'neutral' },
      ],
    },
  ],
  'stale-closure-debug-trace': [
    {
      type: 'debug-trace',
      title: 'SQL Debug Trace: Revenue Drop Diagnosis',
      events: [
        { id: 'q1', stage: 'Attempt 1', detail: 'Missing LEFT JOIN caused user loss in denominator.', kind: 'warning' },
        { id: 'q2', stage: 'Attempt 2', detail: 'Date filter now aligned to order timestamp.', kind: 'render' },
        { id: 'q3', stage: 'Attempt 3', detail: 'Window function validates week-over-week trend.', kind: 'effect' },
      ],
    },
    {
      type: 'code',
      language: 'sql',
      filename: 'retention-debug.sql',
      value: `WITH weekly AS (
  SELECT
    DATE_TRUNC('week', event_time) AS week,
    COUNT(DISTINCT user_id) AS active_users
  FROM events
  WHERE event_time >= CURRENT_DATE - INTERVAL '56 day'
  GROUP BY 1
)
SELECT week,
       active_users,
       LAG(active_users) OVER (ORDER BY week) AS prev_week_users
FROM weekly
ORDER BY week;`,
    },
  ],
  'context-rerender-metrics': [
    {
      type: 'metric-strip',
      title: 'Mastery Snapshot by Skill Node',
      metrics: [
        { id: 'm1', label: 'SQL Foundations', value: '82', tone: 'good' },
        { id: 'm2', label: 'Analytical SQL', value: '68', tone: 'neutral' },
        { id: 'm3', label: 'Metrics & Funnels', value: '57', tone: 'warn' },
      ],
    },
  ],
  'memoization-decision-kit': [
    {
      type: 'checklist',
      title: 'Interview Question Strategy Kit',
      items: [
        { id: 'k1', label: 'Restate problem and assumptions before solving', done: true },
        { id: 'k2', label: 'Define metric formula explicitly', done: true },
        { id: 'k3', label: 'Mention one validation query', done: false },
        { id: 'k4', label: 'End with business recommendation', done: false },
      ],
    },
  ],
  'custom-hook-blueprint': [
    {
      type: 'timeline',
      title: 'Case Answer Blueprint',
      steps: [
        { id: 'b1', title: 'Frame context', detail: 'Business objective and constraints.', state: 'done' },
        { id: 'b2', title: 'Compute core metric', detail: 'Show clean SQL and assumptions.', state: 'active' },
        { id: 'b3', title: 'Interpret and prioritize', detail: 'Translate into decision options.', state: 'next' },
      ],
    },
  ],
  'async-fetching-safety-checklist': [
    {
      type: 'checklist',
      title: 'Resume Tailoring Checklist',
      items: [
        { id: 'cv1', label: 'Highlight quantified impact in bullet points', done: true },
        { id: 'cv2', label: 'Align skill order with target role requirements', done: false },
        { id: 'cv3', label: 'Add one portfolio case with chart + recommendation', done: false },
      ],
    },
  ],
  'render-waterfall-diagnosis': [
    {
      type: 'debug-trace',
      title: 'Funnel Diagnosis Walkthrough',
      events: [
        { id: 'f1', stage: 'Awareness', detail: 'Traffic stable', kind: 'render' },
        { id: 'f2', stage: 'Activation', detail: 'Large drop in first dashboard creation', kind: 'warning' },
        { id: 'f3', stage: 'Retention', detail: 'Week-2 review completion low', kind: 'warning' },
      ],
    },
  ],
  'anti-patterns-callout-wall': [
    {
      type: 'callout-stack',
      title: 'Interview Anti-pattern Wall',
      items: [
        { id: 'a1', tone: 'anti-pattern', heading: 'Jumping into SQL too early', body: 'Clarify the business question and metric definition first.' },
        { id: 'a2', tone: 'warning', heading: 'Chart-first storytelling', body: 'Lead with decision implication, then support with visuals.' },
        { id: 'a3', tone: 'tip', heading: 'Use explicit assumptions', body: 'Stating assumptions improves evaluator trust.' },
      ],
    },
  ],
  'performance-playbook': [
    {
      type: 'timeline',
      title: 'Dashboard Performance Playbook',
      steps: [
        { id: 'p1', title: 'Audit slow visuals', detail: 'Identify expensive chart transforms.', state: 'done' },
        { id: 'p2', title: 'Reduce query payload', detail: 'Pre-aggregate and cache common cuts.', state: 'active' },
        { id: 'p3', title: 'Validate UX speed', detail: 'Check interaction latency after optimizations.', state: 'next' },
      ],
    },
  ],
  'architecture-learning-roadmap': [
    {
      type: 'timeline',
      title: '8-Week Data Analyst Job Sprint',
      steps: [
        { id: 'w1', title: 'Weeks 1-2', detail: 'SQL Foundations + Analytical SQL', state: 'done' },
        { id: 'w2', title: 'Weeks 3-4', detail: 'Metrics and funnel decomposition', state: 'active' },
        { id: 'w3', title: 'Weeks 5-6', detail: 'Dashboard storytelling', state: 'next' },
        { id: 'w4', title: 'Weeks 7-8', detail: 'A/B testing + interview case simulation', state: 'next' },
      ],
    },
    {
      type: 'flashcard-deck',
      topic: 'Interview Readiness',
      cards: [
        {
          id: 'fc1',
          question: 'When should you use a LEFT JOIN instead of an INNER JOIN?',
          answer: 'Use LEFT JOIN when you need to preserve all rows from the left table, even when matches are missing on the right.',
        },
        {
          id: 'fc2',
          question: 'What makes a dashboard insight actionable?',
          answer: 'It ties a metric movement to a likely cause and recommends a specific next action.',
        },
      ],
    },
  ],
};

export const TOPIC_DEFAULT_PACKS: Record<string, ContentPackId[]> = {
  'SQL Foundations': ['state-vs-reducer-tradeoff', 'hooks-lifecycle-map'],
  'Analytical SQL': ['stale-closure-debug-trace', 'memoization-decision-kit'],
  'Metrics and Funnels': ['render-waterfall-diagnosis', 'context-rerender-metrics'],
  'Dashboard Storytelling': ['performance-playbook', 'anti-patterns-callout-wall'],
  'A/B Testing Basics': ['effect-dependency-timeline', 'custom-hook-blueprint'],
  'Interview Case Simulation': ['architecture-learning-roadmap', 'custom-hook-blueprint'],
};

// Legacy exports retained for compatibility with older imports.
export const RICH_CODE_COUNTER = CONTENT_PACKS['hooks-lifecycle-map'];
export const RICH_CODE_TOPIC: Record<string, ContentBlock[]> = Object.fromEntries(
  Object.entries(TOPIC_DEFAULT_PACKS).map(([topic, packs]) => [topic, CONTENT_PACKS[packs[0]] ?? []]),
);
export const RICH_COMPARISON_TABLE = CONTENT_PACKS['state-vs-reducer-tradeoff'];
export const RICH_FLASHCARDS = CONTENT_PACKS['architecture-learning-roadmap'];
