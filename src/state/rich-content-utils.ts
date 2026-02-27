import type { ContentBlock } from '../types/content-blocks';

export type LegacyFlashcardsBlock = {
  type: 'flashcards';
  topic?: string;
  cards?: Array<{ id: string; question: string; answer: string }>;
};

export type LegacyRichBlock = ContentBlock | LegacyFlashcardsBlock;

export function normalizeRichBlock(block: LegacyRichBlock): ContentBlock | null {
  switch (block.type) {
    case 'code':
    case 'comparison-table':
    case 'flashcard-deck':
    case 'concept-map':
    case 'timeline':
    case 'checklist':
    case 'callout-stack':
    case 'metric-strip':
    case 'debug-trace':
      return block;
    case 'flashcards': {
      if (!Array.isArray(block.cards) || block.cards.length === 0) {
        return null;
      }
      return {
        type: 'flashcard-deck',
        topic: block.topic ?? 'Practice',
        cards: block.cards,
      };
    }
    default:
      return null;
  }
}

export function richBlockKey(block: ContentBlock, index: number): string {
  switch (block.type) {
    case 'code':
      return `code-${block.filename ?? index}-${block.value.slice(0, 24)}`;
    case 'comparison-table':
      return `comparison-${block.title}-${block.rows.length}`;
    case 'flashcard-deck':
      return `flashcards-${block.topic}-${block.cards.length}`;
    case 'concept-map':
      return `concept-map-${block.title}-${block.nodes.length}-${block.edges.length}`;
    case 'timeline':
      return `timeline-${block.title}-${block.steps.length}`;
    case 'checklist':
      return `checklist-${block.title}-${block.items.length}`;
    case 'callout-stack':
      return `callout-${block.title ?? 'stack'}-${block.items.length}`;
    case 'metric-strip':
      return `metrics-${block.title ?? 'strip'}-${block.metrics.length}`;
    case 'debug-trace':
      return `debug-trace-${block.title}-${block.events.length}`;
    default:
      return `block-${index}`;
  }
}
