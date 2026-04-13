import { describe, expect, it } from 'vitest';
import type { ContentBlock } from '../../types/content-blocks';
import { normalizeRichBlock, richBlockKey } from '../rich-content-utils';

const sampleBlocks: ContentBlock[] = [
  { type: 'code', language: 'tsx', filename: 'a.tsx', value: 'const x = 1;' },
  {
    type: 'comparison-table',
    title: 'A vs B',
    leftLabel: 'A',
    rightLabel: 'B',
    rows: [{ aspect: 'Speed', left: 'Fast', right: 'Faster' }],
  },
  {
    type: 'flashcard-deck',
    topic: 'Hooks',
    cards: [{ id: 'c1', kind: 'flip', question: 'Q', answer: 'A' }],
  },
  {
    type: 'concept-map',
    title: 'Map',
    nodes: [{ id: 'n1', label: 'Core', lane: 'core' }],
    edges: [{ from: 'n1', to: 'n1' }],
  },
  {
    type: 'timeline',
    title: 'Timeline',
    steps: [{ id: 't1', title: 'Step', detail: 'Detail', state: 'active' }],
  },
  {
    type: 'checklist',
    title: 'Checklist',
    items: [{ id: 'i1', label: 'Item', done: false }],
  },
  {
    type: 'callout-stack',
    title: 'Callout',
    items: [{ id: 'o1', tone: 'tip', heading: 'Tip', body: 'Body' }],
  },
  {
    type: 'metric-strip',
    title: 'Metrics',
    metrics: [{ id: 'm1', label: 'L', value: '1', tone: 'neutral' }],
  },
  {
    type: 'debug-trace',
    title: 'Trace',
    events: [{ id: 'e1', stage: 'render', detail: 'info', kind: 'render' }],
  },
];

describe('rich-content-utils', () => {
  it('normalizes legacy flashcards into flashcard-deck', () => {
    const normalized = normalizeRichBlock({
      type: 'flashcards',
      topic: 'Legacy',
      cards: [{ id: 'f1', question: 'Q', answer: 'A' }],
    });

    expect(normalized?.type).toBe('flashcard-deck');
  });

  it('returns null for unknown block types', () => {
    const normalized = normalizeRichBlock({ type: 'unknown-block' } as never);
    expect(normalized).toBeNull();
  });

  it('produces stable key prefixes for all supported block types', () => {
    const keys = sampleBlocks.map((block, index) => richBlockKey(block, index));

    expect(keys[0]).toContain('code-');
    expect(keys[1]).toContain('comparison-');
    expect(keys[2]).toContain('flashcards-');
    expect(keys[3]).toContain('concept-map-');
    expect(keys[4]).toContain('timeline-');
    expect(keys[5]).toContain('checklist-');
    expect(keys[6]).toContain('callout-');
    expect(keys[7]).toContain('metrics-');
    expect(keys[8]).toContain('debug-trace-');
  });
});
