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
  'sat-skill-dependency-map': 'Digital SAT Adaptive Structure',
  'sat-reading-vs-writing': 'R&W Domain Diagnosis',
  'sat-vocab-flashcards': 'SAT Strategy Cards',
  'sat-study-plan-timeline': 'Personalized Study Plan',
  'sat-test-day-checklist': 'Digital SAT Test-Day Checklist',
  'sat-common-traps': 'Reasoning Traps That Cost Points',
  'sat-score-progress-metrics': 'Score Diagnosis Dashboard',
  'sat-error-analysis-trace': 'Reasoning Error Diagnosis',
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
          kind: 'flip',
          question: 'When should you use a LEFT JOIN instead of an INNER JOIN?',
          answer: 'Use LEFT JOIN when you need to preserve all rows from the left table, even when matches are missing on the right.',
        },
        {
          id: 'fc2',
          kind: 'flip',
          question: 'What makes a dashboard insight actionable?',
          answer: 'It ties a metric movement to a likely cause and recommends a specific next action.',
        },
      ],
    },
  ],

  /* ── SAT Exam Prep Packs (Digital SAT) ────────────────── */

  'sat-skill-dependency-map': [
    {
      type: 'concept-map',
      title: 'Digital SAT Adaptive Structure',
      nodes: [
        { id: 'rw-m1', label: 'R&W Module 1 (27 Qs, 32 min)', lane: 'core' },
        { id: 'rw-m2', label: 'R&W Module 2 (27 Qs, 32 min)', lane: 'core' },
        { id: 'math-m1', label: 'Math Module 1 (22 Qs, 35 min)', lane: 'core' },
        { id: 'math-m2', label: 'Math Module 2 (22 Qs, 35 min)', lane: 'core' },
        { id: 'adaptive', label: 'Adaptive Difficulty Gate', lane: 'support' },
        { id: 'desmos', label: 'Desmos Calculator (all Math)', lane: 'support' },
        { id: 'score-ceiling', label: 'Score Ceiling Risk', lane: 'risk' },
      ],
      edges: [
        { from: 'rw-m1', to: 'adaptive', label: 'performance determines' },
        { from: 'math-m1', to: 'adaptive', label: 'performance determines' },
        { from: 'adaptive', to: 'rw-m2', label: 'harder M2 = higher ceiling' },
        { from: 'adaptive', to: 'math-m2', label: 'harder M2 = higher ceiling' },
        { from: 'desmos', to: 'math-m1', label: 'available for all questions' },
        { from: 'adaptive', to: 'score-ceiling', label: 'easy M2 caps score ~1200' },
      ],
    },
  ],
  'sat-reading-vs-writing': [
    {
      type: 'comparison-table',
      title: 'R&W Domain Breakdown: Where Are You Losing Points?',
      leftLabel: 'Craft & Structure',
      rightLabel: 'Standard English Conventions',
      rows: [
        { aspect: 'Your accuracy', left: '78% (14/18 correct)', right: '52% (9/17 correct)' },
        { aspect: 'Point opportunity', left: '+20 points available', right: '+60 points available' },
        { aspect: 'Key weakness', left: 'Purpose vs. topic confusion on paired questions', right: 'Subject-verb agreement across non-essential clauses' },
        { aspect: 'Fix strategy', left: 'Ask "WHY did the author write this?" not "WHAT is it about?"', right: 'Delete the clause between commas, then check subject-verb match' },
        { aspect: 'Time per question', left: '~71 seconds', right: '~71 seconds' },
      ],
    },
    {
      type: 'metric-strip',
      title: 'Score Diagnosis: Where Your 220-Point Gap Lives',
      metrics: [
        { id: 'r1', label: 'Reading & Writing', value: '560', delta: 'Target: 680 (+120 needed)', tone: 'warn' },
        { id: 'r2', label: 'Math', value: '620', delta: 'Target: 720 (+100 needed)', tone: 'neutral' },
        { id: 'r3', label: 'Total', value: '1180', delta: 'Target: 1400 — gap: 220 pts', tone: 'warn' },
      ],
    },
  ],
  'sat-vocab-flashcards': [
    {
      type: 'flashcard-deck',
      topic: 'Digital SAT: Traps Only a Tutor Would Catch',
      cards: [
        {
          id: 'v1',
          kind: 'flip',
          question: 'A question asks: "Which choice best states the main purpose of the passage?" You are torn between (A) "to describe a new method" and (C) "to argue for a new method." How do you decide?',
          answer: '"Describe" = neutral presentation. "Argue" = the author takes a position. Look for opinion language: "should," "must," "critical." If the passage only explains HOW the method works without advocating FOR it, the answer is "describe." This PURPOSE vs. TOPIC trap is the #1 reason students miss Craft & Structure questions.',
        },
        {
          id: 'v2',
          kind: 'fill-blank',
          prompt: 'Grammar trap: "The team, which included researchers from three universities, ____ published their findings." The subject is "team" (singular). Remove the non-essential clause to check.',
          blank: '____',
          answer: 'has',
        },
        {
          id: 'v3',
          kind: 'mcq',
          question: 'A passage says sales "increased steadily." The accompanying graph shows sales went up overall but dipped in Q3. A question asks: "Based on the data, which statement is accurate?" What source should you trust?',
          options: [
            'Always trust the passage text over the graph',
            'The graph wins for data questions — it shows the actual numbers',
            'Neither — look for a third source in the passage',
            'Pick whichever source supports the most positive interpretation',
          ],
          correctIndex: 1,
        },
        {
          id: 'v4',
          kind: 'order',
          instruction: 'Put these Desmos calculator strategies in order from MOST useful to LEAST useful on the Digital SAT:',
          items: [
            'Graph intersections of two equations to find solutions',
            'Check algebra by plugging in answer choices',
            'Visualize quadratic vertex and roots',
            'Do simple arithmetic like 3 × 17',
            'Solve for algebraic expressions (not values)',
          ],
          correctOrder: [0, 1, 2, 3, 4],
        },
      ],
    },
  ],
  'sat-study-plan-timeline': [
    {
      type: 'timeline',
      title: 'Your 8-Week Plan: 1180 → 1400 (Personalized)',
      steps: [
        { id: 'w1', title: 'Weeks 1-2: Quick Wins', detail: 'English Conventions — your biggest gap: +60 pts available. Plus Algebra fundamentals. Target: 1220.', state: 'done' },
        { id: 'w2', title: 'Weeks 3-4: Core Domains', detail: 'Craft & Structure purpose questions + Advanced Math (quadratics, systems). Target: 1280.', state: 'active' },
        { id: 'w3', title: 'Week 5: Adaptive Strategy', detail: 'Module 1 accuracy drills — getting harder Module 2 is worth ~100 points. Target: 1320.', state: 'next' },
        { id: 'w4', title: 'Week 6: Full Practice', detail: 'Two full-length Digital SAT simulations with adaptive scoring and error classification.', state: 'next' },
        { id: 'w5', title: 'Weeks 7-8: Score Maximization', detail: 'Targeted weakness drills + pacing optimization + Desmos strategy. Target: 1400.', state: 'next' },
      ],
    },
    {
      type: 'flashcard-deck',
      topic: 'Digital SAT Math: Formulas You Must Know',
      cards: [
        {
          id: 'f1',
          kind: 'flip',
          question: 'The Digital SAT gives you a reference sheet. Which formulas are NOT on it that you must memorize?',
          answer: 'Not on the reference sheet: (1) Slope: m = (y₂-y₁)/(x₂-x₁), (2) Quadratic formula: x = (-b ± √(b²-4ac)) / 2a, (3) Standard form: Ax + By = C, (4) Vertex form: y = a(x-h)² + k. The reference sheet only covers area/volume of shapes and special right triangles.',
        },
        {
          id: 'f2',
          kind: 'flip',
          question: 'What is the most efficient strategy for Digital SAT Math questions where all answer choices are numbers?',
          answer: 'Backsolve: plug each answer choice into the equation. Start with (B) or (C) — the middle value. On the Digital SAT, choices are often ordered, so if (C) is too large, eliminate (C) and (D). This turns algebra into arithmetic and works on ~30% of Math questions.',
        },
      ],
    },
  ],
  'sat-test-day-checklist': [
    {
      type: 'checklist',
      title: 'Digital SAT Test-Day Execution Plan',
      items: [
        { id: 'td1', label: 'Bluebook app installed and tested on your device', done: true },
        { id: 'td2', label: 'Device charged to 100% + approved power cord packed', done: true },
        { id: 'td3', label: 'Module 1 strategy reviewed: accuracy over speed — this determines your Module 2 difficulty', done: false },
        { id: 'td4', label: 'Desmos practice done: graph intersections and answer-checking (not basic arithmetic)', done: false },
        { id: 'td5', label: 'Top 3 reasoning error patterns reviewed from practice tests', done: false },
        { id: 'td6', label: 'Pacing plan set: R&W = 71 sec/question, Math = 95 sec/question', done: false },
      ],
    },
  ],
  'sat-common-traps': [
    {
      type: 'callout-stack',
      title: 'Reasoning Traps That Cost You Points',
      items: [
        { id: 't1', tone: 'anti-pattern', heading: 'Rushing Module 1 to "save time" for Module 2', body: 'Module 1 accuracy determines whether you get hard or easy Module 2. An easy Module 2 CAPS your score around 1200. Slow down on Module 1 — every correct answer there is worth more than speed on Module 2.' },
        { id: 't2', tone: 'warning', heading: 'Picking the answer that "sounds right" on R&W', body: 'Digital SAT passages are only 25-150 words. Every answer must be directly supported by the text. If you cannot point to the exact sentence, it is a trap — the SAT deliberately writes plausible-sounding wrong answers.' },
        { id: 't3', tone: 'tip', heading: 'On grammar questions: delete the middle clause', body: 'When a sentence has a clause between commas, mentally remove it. "The scientists, who had studied climate patterns for decades, [verb]" — the subject is "scientists" (plural), so the verb must match. This eliminates the #1 conventions trap.' },
        { id: 't4', tone: 'insight', heading: 'If Module 2 feels harder, that is a GOOD sign', body: 'The Digital SAT is adaptive. If Module 2 feels noticeably harder, it means you performed well on Module 1 and unlocked the higher scoring range. Do not panic — harder questions mean you are on track for a top score.' },
      ],
    },
  ],
  'sat-score-progress-metrics': [
    {
      type: 'metric-strip',
      title: 'Score Diagnosis: Your Biggest Opportunities',
      metrics: [
        { id: 's1', label: 'Std. English Conventions', value: '52%', delta: '~60 pts on the table', tone: 'warn' },
        { id: 's2', label: 'Algebra & Linear', value: '74%', delta: '~40 pts available', tone: 'neutral' },
        { id: 's3', label: 'Craft & Structure', value: '78%', delta: '~20 pts available', tone: 'good' },
        { id: 's4', label: 'Advanced Math', value: '65%', delta: '~50 pts available', tone: 'warn' },
      ],
    },
  ],
  'sat-error-analysis-trace': [
    {
      type: 'debug-trace',
      title: 'Reasoning Error Trace: Practice Test Analysis',
      events: [
        { id: 'e1', stage: 'R&W Q8 (Conventions)', detail: 'Chose "have" instead of "has." A non-essential clause hid the true subject. This is the 3rd subject-verb agreement error across clauses.', kind: 'warning' },
        { id: 'e2', stage: 'R&W Q14 (Craft & Structure)', detail: 'Chose "to describe the process" but correct is "to argue for the process." Confused TOPIC (what it is about) with PURPOSE (why the author wrote it).', kind: 'warning' },
        { id: 'e3', stage: 'Math Q7 (Algebra)', detail: 'Correct approach and answer. Used Desmos to verify — good calculator discipline.', kind: 'render' },
        { id: 'e4', stage: 'Math Q19 (Advanced Math)', detail: 'Set up quadratic correctly but made sign error in factoring. Would have caught this by plugging answer back into original equation.', kind: 'effect' },
        { id: 'e5', stage: 'Pattern Detected', detail: '3 of 4 errors are reasoning-process errors, not knowledge gaps. Fix: (1) delete-clause habit for grammar, (2) ask "WHY did they write this?" for purpose, (3) always back-substitute for algebra.', kind: 'network' },
      ],
    },
    {
      type: 'code',
      language: 'markdown',
      filename: 'reasoning-error-summary.md',
      value: `## Your Reasoning Error Profile\n| Error Type                  | Frequency | Root Cause                          | Process Fix                            |\n|-----------------------------|-----------|-------------------------------------|----------------------------------------|\n| Subject-verb across clause  | 3/10      | Non-essential clause hides subject  | Delete clause mentally, then match     |\n| Purpose vs. topic confusion | 2/10      | Reading WHAT not WHY                | Circle opinion words before answering  |\n| Sign error in factoring     | 2/10      | No verification step                | Back-substitute answer into original   |\n| Time pressure skip          | 1/10      | Panicked on unfamiliar format       | Flag and return — do not stall         |`,
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
  'Reading & Writing': ['sat-reading-vs-writing', 'sat-skill-dependency-map'],
  'Algebra & Functions': ['sat-score-progress-metrics', 'sat-skill-dependency-map'],
  'English Conventions': ['sat-common-traps', 'sat-error-analysis-trace'],
  'Advanced Math': ['sat-error-analysis-trace', 'sat-score-progress-metrics'],
  'Adaptive Test Strategy': ['sat-skill-dependency-map', 'sat-reading-vs-writing'],
  'Full-Length Practice': ['sat-study-plan-timeline', 'sat-score-progress-metrics'],
  'Score Maximization & Test Day': ['sat-test-day-checklist', 'sat-common-traps'],
};

// Legacy exports retained for compatibility with older imports.
export const RICH_CODE_COUNTER = CONTENT_PACKS['hooks-lifecycle-map'];
export const RICH_CODE_TOPIC: Record<string, ContentBlock[]> = Object.fromEntries(
  Object.entries(TOPIC_DEFAULT_PACKS).map(([topic, packs]) => [topic, CONTENT_PACKS[packs[0]] ?? []]),
);
export const RICH_COMPARISON_TABLE = CONTENT_PACKS['state-vs-reducer-tradeoff'];
export const RICH_FLASHCARDS = CONTENT_PACKS['architecture-learning-roadmap'];
