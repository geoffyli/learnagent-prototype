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
  'hooks-lifecycle-map': 'Lifecycle Map',
  'effect-dependency-timeline': 'Dependency Timeline',
  'state-vs-reducer-tradeoff': 'Tradeoff Matrix',
  'stale-closure-debug-trace': 'Debug Trace',
  'context-rerender-metrics': 'Context Metrics',
  'memoization-decision-kit': 'Memoization Kit',
  'custom-hook-blueprint': 'Custom Hook Blueprint',
  'async-fetching-safety-checklist': 'Async Safety Checklist',
  'render-waterfall-diagnosis': 'Render Waterfall',
  'anti-patterns-callout-wall': 'Anti-pattern Wall',
  'performance-playbook': 'Performance Playbook',
  'architecture-learning-roadmap': 'Architecture Roadmap',
};

export const CONTENT_PACKS: Record<ContentPackId, ContentBlock[]> = {
  'hooks-lifecycle-map': [
    {
      type: 'concept-map',
      title: 'React Hook Lifecycle Mental Model',
      nodes: [
        { id: 'render', label: 'Render', lane: 'core' },
        { id: 'commit', label: 'Commit', lane: 'core' },
        { id: 'effect', label: 'Effect', lane: 'core' },
        { id: 'state', label: 'State Update', lane: 'support' },
        { id: 'deps', label: 'Dependency Check', lane: 'support' },
        { id: 'loop', label: 'Infinite Loop Risk', lane: 'risk' },
      ],
      edges: [
        { from: 'render', to: 'commit', label: 'virtual DOM diff' },
        { from: 'commit', to: 'effect', label: 'post-paint' },
        { from: 'state', to: 'render', label: 'schedule update' },
        { from: 'deps', to: 'effect', label: 'run/skip effect' },
        { from: 'effect', to: 'state', label: 'can trigger' },
        { from: 'effect', to: 'loop', label: 'if deps unstable' },
      ],
    },
    {
      type: 'callout-stack',
      title: 'Lifecycle Heuristics',
      items: [
        {
          id: 'h1',
          tone: 'insight',
          heading: 'Render is pure',
          body: 'Don\'t mutate external state during render. Side effects belong to effects or event handlers.',
        },
        {
          id: 'h2',
          tone: 'tip',
          heading: 'Dependencies are contracts',
          body: 'Treat dependency arrays as explicit contracts for when the effect is allowed to run.',
        },
        {
          id: 'h3',
          tone: 'warning',
          heading: 'Function/object deps are noisy',
          body: 'Unstable references can cause unnecessary effect churn and accidental loops.',
        },
      ],
    },
  ],
  'effect-dependency-timeline': [
    {
      type: 'timeline',
      title: 'useEffect Dependency Timeline',
      steps: [
        {
          id: 't1',
          title: 'Initial render',
          detail: 'Component renders and commits. Effect runs once after paint.',
          duration: 'frame 1',
          state: 'done',
        },
        {
          id: 't2',
          title: 'Dependency unchanged',
          detail: 'React skips effect body and preserves previous subscription or timer.',
          duration: 'frame 2+',
          state: 'done',
        },
        {
          id: 't3',
          title: 'Dependency changed',
          detail: 'Cleanup from prior run executes, then effect body runs with latest values.',
          duration: 'change frame',
          state: 'active',
        },
        {
          id: 't4',
          title: 'Unmount',
          detail: 'Final cleanup executes to release resources and avoid leaks.',
          duration: 'final frame',
          state: 'next',
        },
      ],
    },
    {
      type: 'checklist',
      title: 'Dependency Array Checklist',
      items: [
        { id: 'c1', label: 'List all reactive values used in effect body', done: true },
        { id: 'c2', label: 'Move non-reactive constants outside component', done: true },
        { id: 'c3', label: 'Stabilize callbacks/objects only when needed', done: false },
        { id: 'c4', label: 'Always include cleanup for subscriptions/timers', done: false },
      ],
    },
  ],
  'state-vs-reducer-tradeoff': [
    {
      type: 'comparison-table',
      title: 'useState vs useReducer',
      leftLabel: 'useState',
      rightLabel: 'useReducer',
      rows: [
        { aspect: 'Best for', left: 'Simple independent fields', right: 'State with complex transitions' },
        { aspect: 'Update shape', left: 'Direct setter', right: 'Action-driven dispatch' },
        { aspect: 'Testing', left: 'Mostly component-level', right: 'Reducer logic unit-test friendly' },
        { aspect: 'Scaling', left: 'Can sprawl quickly', right: 'Centralizes transition logic' },
      ],
    },
    {
      type: 'metric-strip',
      title: 'Decision Metrics',
      metrics: [
        { id: 'm1', label: 'Action Variants', value: '8+', delta: 'Reducer favored', tone: 'good' },
        { id: 'm2', label: 'State Fields', value: '5+', delta: 'Reducer favored', tone: 'good' },
        { id: 'm3', label: 'Boilerplate Cost', value: '+15%', delta: 'State favored', tone: 'warn' },
      ],
    },
    {
      type: 'callout-stack',
      items: [
        {
          id: 's1',
          tone: 'tip',
          heading: 'Promote late',
          body: 'Start with useState, move to reducer when transition complexity becomes hard to reason about.',
        },
      ],
    },
  ],
  'stale-closure-debug-trace': [
    {
      type: 'debug-trace',
      title: 'Stale Closure Debug Trace',
      events: [
        { id: 'e1', stage: 'render#12', detail: 'count=0 captured by setInterval callback', kind: 'render' },
        { id: 'e2', stage: 'effect', detail: 'interval registered with stale closure', kind: 'effect' },
        { id: 'e3', stage: 'tick#1', detail: 'setCount(count + 1) evaluates 0 + 1', kind: 'warning' },
        { id: 'e4', stage: 'render#13', detail: 'count=1', kind: 'render' },
        { id: 'e5', stage: 'tick#2', detail: 'callback still sees count=0', kind: 'warning' },
      ],
    },
    {
      type: 'code',
      language: 'tsx',
      filename: 'stale-closure-fix.tsx',
      value: `useEffect(() => {
  const id = setInterval(() => {
    setCount(prev => prev + 1); // functional update avoids stale closure
  }, 1000);

  return () => clearInterval(id);
}, []);`,
    },
    {
      type: 'checklist',
      title: 'Debug Protocol',
      items: [
        { id: 'd1', label: 'Log captured values at callback registration', done: false },
        { id: 'd2', label: 'Prefer functional state updates in async callbacks', done: false },
        { id: 'd3', label: 'Confirm cleanup runs on unmount', done: true },
      ],
    },
  ],
  'context-rerender-metrics': [
    {
      type: 'metric-strip',
      title: 'Context Render Impact',
      metrics: [
        { id: 'cm1', label: 'Provider updates/min', value: '24', tone: 'warn' },
        { id: 'cm2', label: 'Consumers rerendered', value: '31', tone: 'warn' },
        { id: 'cm3', label: 'Wasted rerender rate', value: '68%', tone: 'warn' },
        { id: 'cm4', label: 'After split contexts', value: '14%', delta: '-54%', tone: 'good' },
      ],
    },
    {
      type: 'callout-stack',
      title: 'Context Optimization',
      items: [
        {
          id: 'co1',
          tone: 'insight',
          heading: 'Split read/write context',
          body: 'Separate state values and mutation actions to reduce accidental rerenders.',
        },
        {
          id: 'co2',
          tone: 'tip',
          heading: 'Memoize provider value',
          body: 'Wrap provider value object in useMemo to stabilize identity.',
        },
        {
          id: 'co3',
          tone: 'anti-pattern',
          heading: 'Monolithic app context',
          body: 'Large umbrella contexts make every tiny update expensive.',
        },
      ],
    },
    {
      type: 'code',
      language: 'tsx',
      filename: 'split-context.tsx',
      value: `const ThemeStateContext = createContext<'light' | 'dark'>('light');
const ThemeActionsContext = createContext<{ toggle: () => void }>({ toggle: () => {} });`,
    },
  ],
  'memoization-decision-kit': [
    {
      type: 'checklist',
      title: 'Memoization Decision Kit',
      items: [
        { id: 'md1', label: 'Is computation expensive and repeated?', done: true },
        { id: 'md2', label: 'Does child rely on stable callback identity?', done: true },
        { id: 'md3', label: 'Would memoization obscure readability?', done: false },
        { id: 'md4', label: 'Can profiling prove net benefit?', done: false },
      ],
    },
    {
      type: 'timeline',
      title: 'Optimization Order',
      steps: [
        { id: 'mo1', title: 'Measure baseline', detail: 'Collect render counts and flame graph.', state: 'done' },
        { id: 'mo2', title: 'Optimize hotspot', detail: 'Apply useMemo/useCallback at hotspot only.', state: 'active' },
        { id: 'mo3', title: 'Re-measure', detail: 'Verify lower total render cost and interaction latency.', state: 'next' },
      ],
    },
    {
      type: 'comparison-table',
      title: 'useMemo vs useCallback',
      leftLabel: 'useMemo',
      rightLabel: 'useCallback',
      rows: [
        { aspect: 'Memoizes', left: 'Computed values', right: 'Function identity' },
        { aspect: 'Common misuse', left: 'Wrapping cheap expressions', right: 'Wrapping every handler by default' },
      ],
    },
  ],
  'custom-hook-blueprint': [
    {
      type: 'timeline',
      title: 'Custom Hook Blueprint',
      steps: [
        { id: 'ch1', title: 'Identify repeated stateful logic', detail: 'Find duplication across components.', state: 'done' },
        { id: 'ch2', title: 'Extract pure API', detail: 'Return minimal stable contract.', state: 'active' },
        { id: 'ch3', title: 'Add test seams', detail: 'Inject dependencies and isolate side effects.', state: 'next' },
      ],
    },
    {
      type: 'code',
      language: 'tsx',
      filename: 'useDebouncedValue.ts',
      value: `export function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}`,
    },
    {
      type: 'callout-stack',
      items: [
        {
          id: 'cb1',
          tone: 'tip',
          heading: 'Name behavior, not implementation',
          body: 'Prefer useDebouncedValue over useTimeoutState for clarity.',
        },
      ],
    },
  ],
  'async-fetching-safety-checklist': [
    {
      type: 'checklist',
      title: 'Async Fetching Safety Checklist',
      items: [
        { id: 'af1', label: 'Abort stale requests on dependency change', done: true },
        { id: 'af2', label: 'Differentiate loading, success, and error UI', done: true },
        { id: 'af3', label: 'Guard against race conditions', done: false },
        { id: 'af4', label: 'Retry transient failures with backoff', done: false },
      ],
    },
    {
      type: 'code',
      language: 'tsx',
      filename: 'abort-controller.tsx',
      value: `useEffect(() => {
  const controller = new AbortController();

  fetch(url, { signal: controller.signal })
    .then(r => r.json())
    .then(setData)
    .catch(err => {
      if (err.name !== 'AbortError') setError(err);
    });

  return () => controller.abort();
}, [url]);`,
    },
    {
      type: 'callout-stack',
      items: [
        {
          id: 'aw1',
          tone: 'warning',
          heading: 'Race condition hotspot',
          body: 'Multiple fast filter changes can resolve out-of-order without request cancellation.',
        },
      ],
    },
  ],
  'render-waterfall-diagnosis': [
    {
      type: 'debug-trace',
      title: 'Render Waterfall Diagnosis',
      events: [
        { id: 'rw1', stage: 'render App', detail: 'parent state update', kind: 'render' },
        { id: 'rw2', stage: 'render Dashboard', detail: 'props object identity changed', kind: 'warning' },
        { id: 'rw3', stage: 'render Chart', detail: 'expensive calculations rerun', kind: 'warning' },
        { id: 'rw4', stage: 'network', detail: 'duplicate request fired', kind: 'network' },
      ],
    },
    {
      type: 'concept-map',
      title: 'Waterfall Causes',
      nodes: [
        { id: 'parent', label: 'Parent State', lane: 'core' },
        { id: 'unstable', label: 'Unstable Props', lane: 'support' },
        { id: 'expensive', label: 'Expensive Child', lane: 'support' },
        { id: 'dup', label: 'Duplicate Fetch', lane: 'risk' },
      ],
      edges: [
        { from: 'parent', to: 'unstable' },
        { from: 'unstable', to: 'expensive' },
        { from: 'expensive', to: 'dup', label: 'effect reruns' },
      ],
    },
    {
      type: 'metric-strip',
      metrics: [
        { id: 'rw-m1', label: 'Before', value: '54 renders / action', tone: 'warn' },
        { id: 'rw-m2', label: 'After memoization', value: '18 renders / action', delta: '-67%', tone: 'good' },
      ],
    },
  ],
  'anti-patterns-callout-wall': [
    {
      type: 'callout-stack',
      title: 'React Anti-pattern Wall',
      items: [
        {
          id: 'ap1',
          tone: 'anti-pattern',
          heading: 'Derived state duplication',
          body: 'Storing both source and derived values causes stale UI and sync bugs.',
        },
        {
          id: 'ap2',
          tone: 'anti-pattern',
          heading: 'Effect as event handler',
          body: 'Running business events from effects can create hidden loops and delayed UX.',
        },
        {
          id: 'ap3',
          tone: 'warning',
          heading: 'Index as key in mutable lists',
          body: 'Leads to state leakage across rows during insert/remove/reorder operations.',
        },
        {
          id: 'ap4',
          tone: 'tip',
          heading: 'Prefer explicit data flow',
          body: 'Prop drilling is sometimes clearer than over-generalized global context.',
        },
      ],
    },
    {
      type: 'code',
      language: 'tsx',
      filename: 'key-fix.tsx',
      value: `{items.map(item => (
  <Row key={item.id} item={item} />
))}`,
    },
  ],
  'performance-playbook': [
    {
      type: 'timeline',
      title: 'Performance Playbook',
      steps: [
        { id: 'pp1', title: 'Profile', detail: 'Find the actual bottleneck before optimizing.', state: 'done' },
        { id: 'pp2', title: 'Stabilize identities', detail: 'Memoize hot props and callbacks selectively.', state: 'active' },
        { id: 'pp3', title: 'Split heavy trees', detail: 'Isolate expensive subtrees with memo boundaries.', state: 'next' },
        { id: 'pp4', title: 'Re-verify UX', detail: 'Confirm latency and throughput improvements.', state: 'next' },
      ],
    },
    {
      type: 'metric-strip',
      title: 'Measured Gains',
      metrics: [
        { id: 'pm1', label: 'Interaction latency', value: '220ms → 96ms', tone: 'good' },
        { id: 'pm2', label: 'Frames dropped', value: '18 → 4', tone: 'good' },
        { id: 'pm3', label: 'Bundle delta', value: '+2.1KB', tone: 'neutral' },
      ],
    },
    {
      type: 'checklist',
      title: 'Guardrails',
      items: [
        { id: 'pg1', label: 'No optimization without baseline metric', done: true },
        { id: 'pg2', label: 'No blanket memoization', done: true },
        { id: 'pg3', label: 'Track regressions in PR review', done: false },
      ],
    },
  ],
  'architecture-learning-roadmap': [
    {
      type: 'concept-map',
      title: 'Frontend Architecture Learning Graph',
      nodes: [
        { id: 'local', label: 'Local State', lane: 'core' },
        { id: 'shared', label: 'Shared State', lane: 'core' },
        { id: 'effects', label: 'Side Effects', lane: 'core' },
        { id: 'perf', label: 'Performance', lane: 'support' },
        { id: 'testing', label: 'Testing', lane: 'support' },
        { id: 'scaling', label: 'Scaling Risks', lane: 'risk' },
      ],
      edges: [
        { from: 'local', to: 'shared' },
        { from: 'shared', to: 'effects' },
        { from: 'effects', to: 'perf' },
        { from: 'perf', to: 'testing' },
        { from: 'shared', to: 'scaling', label: 'without boundaries' },
      ],
    },
    {
      type: 'timeline',
      title: '4-Week Skill Path',
      steps: [
        { id: 'ar1', title: 'Week 1', detail: 'State modeling and transitions', state: 'done' },
        { id: 'ar2', title: 'Week 2', detail: 'Effects and async safety', state: 'active' },
        { id: 'ar3', title: 'Week 3', detail: 'Performance and memoization', state: 'next' },
        { id: 'ar4', title: 'Week 4', detail: 'Architecture and testing strategy', state: 'next' },
      ],
    },
    {
      type: 'flashcard-deck',
      topic: 'Architecture Signals',
      cards: [
        {
          id: 'ar-f1',
          question: 'When should you split context?',
          answer: 'When updates have distinct audiences or high-frequency writes affect unrelated consumers.',
        },
        {
          id: 'ar-f2',
          question: 'What indicates reducer over useState?',
          answer: 'Multiple transition paths, action semantics, and need for deterministic transition tests.',
        },
      ],
    },
  ],
};

export const TOPIC_DEFAULT_PACKS: Record<string, ContentPackId[]> = {
  useState: ['state-vs-reducer-tradeoff', 'hooks-lifecycle-map'],
  useEffect: ['effect-dependency-timeline', 'async-fetching-safety-checklist'],
  useContext: ['context-rerender-metrics', 'architecture-learning-roadmap'],
  useCallback: ['memoization-decision-kit', 'performance-playbook'],
  useMemo: ['performance-playbook', 'render-waterfall-diagnosis'],
  'Custom Hooks': ['custom-hook-blueprint', 'architecture-learning-roadmap'],
};

// Legacy exports retained for compatibility with older imports.
export const RICH_CODE_COUNTER = CONTENT_PACKS['hooks-lifecycle-map'];
export const RICH_CODE_TOPIC: Record<string, ContentBlock[]> = Object.fromEntries(
  Object.entries(TOPIC_DEFAULT_PACKS).map(([topic, packs]) => [topic, CONTENT_PACKS[packs[0]] ?? []]),
);
export const RICH_COMPARISON_TABLE = CONTENT_PACKS['state-vs-reducer-tradeoff'];
export const RICH_FLASHCARDS = CONTENT_PACKS['architecture-learning-roadmap'];
