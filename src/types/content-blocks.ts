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

export type ContentBlock = CodeBlock | ComparisonTableBlock | FlashcardDeckBlock;
