export interface CodeBlock {
  type: 'code';
  language: string;
  filename?: string;
  value: string;
}

export interface ComparisonTableBlock {
  type: 'comparison-table';
  title: string;
  leftLabel: string;
  rightLabel: string;
  rows: Array<{ aspect: string; left: string; right: string }>;
}

export interface FlashcardDeckBlock {
  type: 'flashcard-deck';
  topic: string;
  cards: Array<{ id: string; question: string; answer: string }>;
}

export interface ConceptMapBlock {
  type: 'concept-map';
  title: string;
  nodes: Array<{ id: string; label: string; lane: 'core' | 'support' | 'risk' }>;
  edges: Array<{ from: string; to: string; label?: string }>;
}

export interface TimelineBlock {
  type: 'timeline';
  title: string;
  steps: Array<{ id: string; title: string; detail: string; duration?: string; state: 'done' | 'active' | 'next' }>;
}

export interface ChecklistBlock {
  type: 'checklist';
  title: string;
  items: Array<{ id: string; label: string; note?: string; done: boolean }>;
}

export interface CalloutStackBlock {
  type: 'callout-stack';
  title?: string;
  items: Array<{ id: string; tone: 'tip' | 'warning' | 'insight' | 'anti-pattern'; heading: string; body: string }>;
}

export interface MetricStripBlock {
  type: 'metric-strip';
  title?: string;
  metrics: Array<{ id: string; label: string; value: string; delta?: string; tone: 'good' | 'neutral' | 'warn' }>;
}

export interface DebugTraceBlock {
  type: 'debug-trace';
  title: string;
  events: Array<{ id: string; stage: string; detail: string; kind: 'render' | 'effect' | 'network' | 'warning' }>;
}

export type ContentBlock =
  | CodeBlock
  | ComparisonTableBlock
  | FlashcardDeckBlock
  | ConceptMapBlock
  | TimelineBlock
  | ChecklistBlock
  | CalloutStackBlock
  | MetricStripBlock
  | DebugTraceBlock;
