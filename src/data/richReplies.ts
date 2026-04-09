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
  'sat-skill-dependency-map',
  'sat-reading-vs-writing',
  'sat-vocab-flashcards',
  'sat-study-plan-timeline',
  'sat-test-day-checklist',
  'sat-common-traps',
  'sat-score-progress-metrics',
  'sat-error-analysis-trace',
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
  'sat-skill-dependency-map': 'SAT Skill Dependency Map',
  'sat-reading-vs-writing': 'Reading vs Writing Strategy',
  'sat-vocab-flashcards': 'SAT Vocabulary Flashcards',
  'sat-study-plan-timeline': '6-Week SAT Study Plan',
  'sat-test-day-checklist': 'Test-Day Prep Checklist',
  'sat-common-traps': 'Common SAT Traps',
  'sat-score-progress-metrics': 'Section Score Progress',
  'sat-error-analysis-trace': 'Error Analysis Trace',
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

  /* ── SAT Exam Prep Packs ────────────────────────────────────── */

  'sat-skill-dependency-map': [
    {
      type: 'concept-map',
      title: 'SAT Skill Dependency Map',
      nodes: [
        { id: 'reading', label: 'Reading Comprehension', lane: 'core' },
        { id: 'math-nc', label: 'Math: No Calculator', lane: 'core' },
        { id: 'writing', label: 'Writing & Language', lane: 'core' },
        { id: 'math-c', label: 'Math: Calculator', lane: 'core' },
        { id: 'evidence', label: 'Evidence-Based Analysis', lane: 'support' },
        { id: 'pacing', label: 'Test-Day Pacing Risk', lane: 'risk' },
      ],
      edges: [
        { from: 'reading', to: 'writing', label: 'passage analysis transfers' },
        { from: 'math-nc', to: 'math-c', label: 'build fluency first' },
        { from: 'writing', to: 'evidence', label: 'cross-section reasoning' },
        { from: 'math-c', to: 'evidence', label: 'data interpretation' },
        { from: 'evidence', to: 'pacing', label: 'if untimed practice only' },
      ],
    },
  ],
  'sat-reading-vs-writing': [
    {
      type: 'comparison-table',
      title: 'Strategy Matrix: Reading vs Writing & Language',
      leftLabel: 'Reading',
      rightLabel: 'Writing & Language',
      rows: [
        { aspect: 'Time per question', left: '~75 seconds', right: '~48 seconds' },
        { aspect: 'Key strategy', left: 'Read passage first, then answer', right: 'Read question, then scan context' },
        { aspect: 'Common trap', left: 'Picking answer that sounds right but lacks evidence', right: 'Changing meaning while fixing grammar' },
        { aspect: 'Evidence use', left: 'Must point to specific lines', right: 'Must preserve author intent' },
      ],
    },
    {
      type: 'metric-strip',
      title: 'Current Section Readiness',
      metrics: [
        { id: 'r1', label: 'Reading', value: '620', tone: 'neutral' },
        { id: 'r2', label: 'Writing', value: '580', tone: 'warn' },
        { id: 'r3', label: 'Math', value: '690', tone: 'good' },
      ],
    },
  ],
  'sat-vocab-flashcards': [
    {
      type: 'flashcard-deck',
      topic: 'SAT Vocabulary in Context',
      cards: [
        {
          id: 'v1',
          question: 'What does "undermine" most nearly mean in: "The study\'s flawed methodology could undermine its conclusions"?',
          answer: 'Weaken or damage. In SAT context, look for words that suggest reducing the strength or validity of something.',
        },
        {
          id: 'v2',
          question: 'Distinguish "complement" vs "compliment" in SAT usage.',
          answer: '"Complement" means to complete or enhance. "Compliment" means to praise. SAT often tests this in Writing & Language.',
        },
        {
          id: 'v3',
          question: 'What does "empirical" mean in: "The researchers relied on empirical evidence"?',
          answer: 'Based on observation or experiment rather than theory. SAT science passages frequently use this term.',
        },
        {
          id: 'v4',
          question: 'What is the meaning of "substantiate" in: "The author fails to substantiate the central claim"?',
          answer: 'To provide evidence or proof. On the SAT, this often appears in evidence-based reading questions.',
        },
      ],
    },
  ],
  'sat-study-plan-timeline': [
    {
      type: 'timeline',
      title: '6-Week SAT Prep Sprint',
      steps: [
        { id: 'w1', title: 'Weeks 1-2', detail: 'Reading Comprehension + Math No-Calculator foundations', state: 'done' },
        { id: 'w2', title: 'Week 3', detail: 'Writing & Language conventions + Math Calculator', state: 'active' },
        { id: 'w3', title: 'Week 4', detail: 'Evidence-Based Analysis across all sections', state: 'next' },
        { id: 'w4', title: 'Week 5', detail: 'Full-length timed practice simulations', state: 'next' },
        { id: 'w5', title: 'Week 6', detail: 'Test-day strategy, pacing, and final review', state: 'next' },
      ],
    },
    {
      type: 'flashcard-deck',
      topic: 'SAT Math Key Formulas',
      cards: [
        {
          id: 'f1',
          question: 'What is the quadratic formula?',
          answer: 'x = (-b ± √(b² - 4ac)) / 2a. Used when factoring is difficult. Always check the discriminant (b² - 4ac) first to determine the number of solutions.',
        },
        {
          id: 'f2',
          question: 'How do you find the slope between two points?',
          answer: 'slope = (y₂ - y₁) / (x₂ - x₁). Remember: rise over run. Watch for vertical lines (undefined slope) and horizontal lines (slope = 0).',
        },
      ],
    },
  ],
  'sat-test-day-checklist': [
    {
      type: 'checklist',
      title: 'SAT Test-Day Prep Checklist',
      items: [
        { id: 'td1', label: 'Admission ticket and photo ID packed', done: true },
        { id: 'td2', label: 'Two No. 2 pencils and approved calculator', done: true },
        { id: 'td3', label: 'Reviewed pacing strategy: 13 min per reading passage', done: false },
        { id: 'td4', label: 'Practiced bubble-sheet filling under time pressure', done: false },
        { id: 'td5', label: 'Reviewed top 5 mistake patterns from practice tests', done: false },
      ],
    },
  ],
  'sat-common-traps': [
    {
      type: 'callout-stack',
      title: 'Common SAT Traps',
      items: [
        { id: 't1', tone: 'anti-pattern', heading: 'Choosing the "sounds right" answer', body: 'Always find evidence in the passage. If you cannot point to a line that supports your answer, it is likely wrong.' },
        { id: 't2', tone: 'warning', heading: 'Spending too long on one question', body: 'Each question is worth the same. Skip and return. Mark difficult questions and revisit if time allows.' },
        { id: 't3', tone: 'tip', heading: 'Process of elimination is your best friend', body: 'Eliminate 2 answers first. Your odds jump from 25% to 50%. Then compare remaining choices carefully.' },
        { id: 't4', tone: 'insight', heading: 'The SAT tests reasoning, not knowledge', body: 'Every answer is in the passage or solvable with given information. You never need outside knowledge for Reading and Writing.' },
      ],
    },
  ],
  'sat-score-progress-metrics': [
    {
      type: 'metric-strip',
      title: 'Section Score Progress',
      metrics: [
        { id: 's1', label: 'Evidence-Based Reading & Writing', value: '640', delta: '+30 from baseline', tone: 'good' },
        { id: 's2', label: 'Math', value: '680', delta: '+20 from baseline', tone: 'good' },
        { id: 's3', label: 'Total Composite', value: '1320', delta: 'Target: 1450', tone: 'neutral' },
      ],
    },
  ],
  'sat-error-analysis-trace': [
    {
      type: 'debug-trace',
      title: 'Error Analysis: Reading Passage #3',
      events: [
        { id: 'e1', stage: 'Question 12', detail: 'Selected B (author tone) but correct is D (evidence mismatch). Misread "however" as agreement.', kind: 'warning' },
        { id: 'e2', stage: 'Question 14', detail: 'Correctly identified main idea from paragraph 2 topic sentence.', kind: 'render' },
        { id: 'e3', stage: 'Question 16', detail: 'Vocabulary in context: chose "decline" but answer is "reject". Failed to re-read surrounding sentence.', kind: 'warning' },
        { id: 'e4', stage: 'Pattern', detail: 'Two errors stem from insufficient evidence checking. Add "point to the line" step before confirming.', kind: 'effect' },
      ],
    },
    {
      type: 'code',
      language: 'markdown',
      filename: 'error-pattern-summary.md',
      value: `## Error Pattern Summary\n| Pattern           | Frequency | Fix Strategy                    |\n|-------------------|-----------|--------------------------------|\n| Evidence mismatch | 3/10      | Re-read referenced lines       |\n| Vocab in context  | 2/10      | Substitute answer into sentence |\n| Time pressure     | 1/10      | Skip and return strategy       |`,
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
  'Reading Comprehension': ['sat-reading-vs-writing', 'sat-skill-dependency-map'],
  'Math: No Calculator': ['sat-score-progress-metrics', 'sat-skill-dependency-map'],
  'Writing & Language': ['sat-common-traps', 'sat-test-day-checklist'],
  'Math: Calculator': ['sat-error-analysis-trace', 'sat-score-progress-metrics'],
  'Evidence-Based Analysis': ['sat-reading-vs-writing', 'sat-error-analysis-trace'],
  'Full-Length Practice Simulation': ['sat-study-plan-timeline', 'sat-score-progress-metrics'],
  'Test-Day Strategy': ['sat-test-day-checklist', 'sat-common-traps'],
};

// Legacy exports retained for compatibility with older imports.
export const RICH_CODE_COUNTER = CONTENT_PACKS['hooks-lifecycle-map'];
export const RICH_CODE_TOPIC: Record<string, ContentBlock[]> = Object.fromEntries(
  Object.entries(TOPIC_DEFAULT_PACKS).map(([topic, packs]) => [topic, CONTENT_PACKS[packs[0]] ?? []]),
);
export const RICH_COMPARISON_TABLE = CONTENT_PACKS['state-vs-reducer-tradeoff'];
export const RICH_FLASHCARDS = CONTENT_PACKS['architecture-learning-roadmap'];
