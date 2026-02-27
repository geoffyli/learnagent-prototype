import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, Copy, RotateCcw } from 'lucide-react';
import type { CodeBlock, ComparisonTableBlock, ContentBlock, FlashcardDeckBlock } from '../types/content-blocks';
import { MOTION_DURATION, springFor, tweenFor } from '../motion/tokens';
import { fadeSlideY, staggerContainer } from '../motion/variants';

type LegacyFlashcardsBlock = {
  type: 'flashcards';
  topic?: string;
  cards?: Array<{ id: string; question: string; answer: string }>;
};

type RenderableBlock = ContentBlock | FlashcardDeckBlock;

interface SelectionPopover {
  text: string;
  x: number;
  y: number;
}

function normalizeBlock(block: ContentBlock | LegacyFlashcardsBlock): RenderableBlock | null {
  if (block.type === 'code' || block.type === 'comparison-table' || block.type === 'flashcard-deck') {
    return block;
  }

  if (block.type === 'flashcards' && Array.isArray(block.cards) && block.cards.length > 0) {
    return {
      type: 'flashcard-deck',
      topic: block.topic ?? 'Practice',
      cards: block.cards,
    };
  }

  return null;
}

function CodeBlockView({ block }: { block: CodeBlock }) {
  const reducedMotion = useReducedMotion() ?? false;
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(block.value);
      setCopyFailed(false);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 2200);
    }
  };

  return (
    <motion.div
      className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 text-sm"
      variants={staggerContainer(reducedMotion, 0.04)}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="flex items-center justify-between border-b border-slate-700 px-4 py-2"
        variants={fadeSlideY(reducedMotion, 6, MOTION_DURATION.fast)}
      >
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500/70" />
            <span className="h-3 w-3 rounded-full bg-amber-500/70" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/70" />
          </div>
          {block.filename && (
            <span className="ml-1 font-mono text-[11px] text-slate-400">{block.filename}</span>
          )}
        </div>

        <motion.button
          type="button"
          onClick={handleCopy}
          whileHover={reducedMotion ? undefined : { y: -1 }}
          whileTap={reducedMotion ? undefined : { scale: 0.96 }}
          transition={springFor(reducedMotion, 'snappy')}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="copied"
                className="inline-flex items-center gap-1.5"
                initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: reducedMotion ? 1 : 0.92 }}
                transition={tweenFor(reducedMotion, MOTION_DURATION.fast)}
              >
                <Check className="h-3 w-3 text-emerald-400" /> Copied
              </motion.span>
            ) : copyFailed ? (
              <motion.span
                key="copy-failed"
                className="inline-flex items-center gap-1.5 text-rose-300"
                initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: reducedMotion ? 1 : 0.92 }}
                transition={tweenFor(reducedMotion, MOTION_DURATION.fast)}
              >
                Copy failed
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                className="inline-flex items-center gap-1.5"
                initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: reducedMotion ? 1 : 0.92 }}
                transition={tweenFor(reducedMotion, MOTION_DURATION.fast)}
              >
                <Copy className="h-3 w-3" /> Copy
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>

      <motion.pre
        className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-slate-200"
        variants={fadeSlideY(reducedMotion, 8, MOTION_DURATION.base)}
      >
        <code>{block.value}</code>
      </motion.pre>
    </motion.div>
  );
}

function ComparisonTableView({ block }: { block: ComparisonTableBlock }) {
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <motion.div
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
      variants={staggerContainer(reducedMotion, 0.04)}
      initial="hidden"
      animate="visible"
    >
      {block.title && (
        <motion.div className="border-b border-slate-100 px-4 py-3" variants={fadeSlideY(reducedMotion, 6, MOTION_DURATION.fast)}>
          <p className="font-heading text-sm font-semibold text-slate-900">{block.title}</p>
        </motion.div>
      )}
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            <th className="px-4 py-2.5 text-left font-semibold text-slate-500">Aspect</th>
            <th className="px-4 py-2.5 text-left font-semibold text-teal-700">{block.leftLabel}</th>
            <th className="px-4 py-2.5 text-left font-semibold text-violet-700">{block.rightLabel}</th>
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, i) => (
            <motion.tr
              key={i}
              initial={{ opacity: 0, y: reducedMotion ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                ...tweenFor(reducedMotion, MOTION_DURATION.base),
                delay: reducedMotion ? 0 : i * 0.04,
              }}
              whileHover={reducedMotion ? undefined : { y: -1, opacity: 0.98 }}
              className={`border-b border-slate-100 last:border-0 ${i % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}`}
            >
              <td className="px-4 py-2.5 font-medium text-slate-600">{row.aspect}</td>
              <td className="px-4 py-2.5 text-slate-700">{row.left}</td>
              <td className="px-4 py-2.5 text-slate-700">{row.right}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}

function FlashcardDeckView({ block }: { block: FlashcardDeckBlock }) {
  const reducedMotion = useReducedMotion() ?? false;
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = block.cards[index];
  const total = block.cards.length;

  const goTo = (next: number) => {
    setIndex(next);
    setFlipped(false);
  };

  return (
    <motion.div className="overflow-hidden rounded-2xl border border-slate-200 bg-white" variants={fadeSlideY(reducedMotion, 8)}>
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <p className="font-heading text-sm font-semibold text-slate-900">{block.topic} — Flashcards</p>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
          {index + 1} / {total}
        </span>
      </div>

      <div className="p-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={card.id}
            initial={{ opacity: 0, x: reducedMotion ? 0 : 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: reducedMotion ? 0 : -12 }}
            transition={tweenFor(reducedMotion, MOTION_DURATION.base)}
            className="[perspective:1200px]"
          >
            {reducedMotion ? (
              <button
                type="button"
                onClick={() => setFlipped((f) => !f)}
                className="group relative w-full cursor-pointer rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 text-left transition hover:border-teal-300 hover:shadow-sm"
                style={{ minHeight: 140 }}
              >
                <span className="mb-3 inline-block rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  {flipped ? 'Answer' : 'Question'}
                </span>
                <p className={`text-sm leading-relaxed ${flipped ? 'text-teal-800' : 'text-slate-800'}`}>
                  {flipped ? card.answer : card.question}
                </p>
                <p className="mt-3 text-[11px] text-slate-400 group-hover:text-slate-500">
                  {flipped ? 'Click to see question' : 'Click to reveal answer'}
                </p>
              </button>
            ) : (
              <motion.button
                type="button"
                onClick={() => setFlipped((f) => !f)}
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={springFor(reducedMotion, 'card')}
                className="group relative w-full cursor-pointer rounded-2xl text-left"
                style={{ minHeight: 140, transformStyle: 'preserve-3d' }}
              >
                <div
                  className="absolute inset-0 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <span className="mb-3 inline-block rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Question
                  </span>
                  <p className="text-sm leading-relaxed text-slate-800">{card.question}</p>
                  <p className="mt-3 text-[11px] text-slate-400 group-hover:text-slate-500">
                    Click to reveal answer
                  </p>
                </div>

                <div
                  className="absolute inset-0 rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white p-6"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <span className="mb-3 inline-block rounded-lg border border-teal-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal-500">
                    Answer
                  </span>
                  <p className="text-sm leading-relaxed text-teal-800">{card.answer}</p>
                  <p className="mt-3 text-[11px] text-teal-500/80">
                    Click to see question
                  </p>
                </div>

                <div className="pointer-events-none opacity-0" style={{ minHeight: 140 }} />
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
        <motion.button
          type="button"
          disabled={index === 0}
          onClick={() => goTo(index - 1)}
          whileTap={reducedMotion ? undefined : { scale: 0.96 }}
          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Prev
        </motion.button>

        <motion.button
          type="button"
          onClick={() => { setFlipped(false); setIndex(0); }}
          whileTap={reducedMotion ? undefined : { scale: 0.96 }}
          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-slate-500 transition hover:bg-slate-100"
        >
          <RotateCcw className="h-3 w-3" /> Restart
        </motion.button>

        <motion.button
          type="button"
          disabled={index === total - 1}
          onClick={() => goTo(index + 1)}
          whileTap={reducedMotion ? undefined : { scale: 0.96 }}
          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next <ChevronRight className="h-3.5 w-3.5" />
        </motion.button>
      </div>
    </motion.div>
  );
}

function blockKey(block: ContentBlock, index: number): string {
  if (block.type === 'code') {
    return `code-${block.filename ?? index}-${block.value.slice(0, 24)}`;
  }
  if (block.type === 'comparison-table') {
    return `comparison-${block.title}-${block.rows.length}`;
  }
  return `flashcards-${block.topic}-${block.cards.length}`;
}

export default function RichContentPanel({
  blocks,
  onCreateBranch,
}: {
  blocks: ContentBlock[];
  onCreateBranch?: (kind: 'ask' | 'explain', selectedText: string) => void;
}) {
  const reducedMotion = useReducedMotion() ?? false;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [selectionPopover, setSelectionPopover] = useState<SelectionPopover | null>(null);
  const [selectionText, setSelectionText] = useState('');

  const normalizedBlocks = useMemo(
    () => blocks
      .map((block) => normalizeBlock(block as ContentBlock | LegacyFlashcardsBlock))
      .filter((block): block is RenderableBlock => block !== null),
    [blocks],
  );

  const sequenceKey = useMemo(
    () => normalizedBlocks.map((block, i) => blockKey(block, i)).join('|') || 'empty',
    [normalizedBlocks],
  );

  const getSelectionState = useCallback((): SelectionPopover | null => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      return null;
    }

    const text = selection.toString().replace(/\s+/g, ' ').trim();
    if (text.length < 3) {
      return null;
    }

    const range = selection.getRangeAt(0);
    const node = range.commonAncestorContainer;
    const element =
      node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element);

    if (!element) {
      return null;
    }

    const selectableRegion = element.closest('[data-rich-selectable="true"]');
    const scroller = scrollerRef.current;
    if (!selectableRegion || !scroller || !scroller.contains(selectableRegion)) {
      return null;
    }

    const rect = range.getBoundingClientRect();
    const containerRect = scroller.getBoundingClientRect();

    return {
      text,
      x: rect.left - containerRect.left + rect.width / 2 + scroller.scrollLeft,
      y: rect.top - containerRect.top + scroller.scrollTop - 10,
    };
  }, []);

  useEffect(() => {
    const handleSelectionChange = () => {
      const current = getSelectionState();
      if (!current) {
        setSelectionText('');
        setSelectionPopover(null);
        return;
      }
      setSelectionText(current.text);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [getSelectionState]);

  const clearNativeSelection = () => {
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }
    setSelectionPopover(null);
    setSelectionText('');
  };

  const handleMouseUpSelection = () => {
    const current = getSelectionState();
    if (!current) {
      setSelectionPopover(null);
      setSelectionText('');
      return;
    }
    setSelectionText(current.text);
    setSelectionPopover(current);
  };

  const handleBranch = (kind: 'ask' | 'explain', text: string) => {
    if (!onCreateBranch) {
      return;
    }
    onCreateBranch(kind, text);
    clearNativeSelection();
  };

  if (normalizedBlocks.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center">
          <p className="text-sm font-medium text-slate-700">No content to display yet.</p>
          <p className="mt-1 text-xs text-slate-500">
            Ask for an example, comparison, or quiz to generate rich content.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollerRef}
      onMouseUp={handleMouseUpSelection}
      className="relative h-full overflow-y-auto p-4"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={sequenceKey}
          className="space-y-4"
          data-rich-selectable="true"
          variants={staggerContainer(reducedMotion, 0.08)}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, y: reducedMotion ? 0 : -8, transition: tweenFor(reducedMotion, MOTION_DURATION.fast, 'exit') }}
        >
          {normalizedBlocks.map((block, i) => {
            const key = blockKey(block, i);
            if (block.type === 'code') {
              return (
                <motion.div key={key} variants={fadeSlideY(reducedMotion, 8)}>
                  <CodeBlockView block={block} />
                </motion.div>
              );
            }
            if (block.type === 'comparison-table') {
              return (
                <motion.div key={key} variants={fadeSlideY(reducedMotion, 8)}>
                  <ComparisonTableView block={block} />
                </motion.div>
              );
            }
            if (block.type === 'flashcard-deck') {
              return (
                <motion.div key={key} variants={fadeSlideY(reducedMotion, 8)}>
                  <FlashcardDeckView block={block} />
                </motion.div>
              );
            }
            return null;
          })}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {selectionPopover && onCreateBranch && (
          <motion.div
            className="absolute z-30 -translate-x-1/2 -translate-y-full rounded-xl border border-slate-200 bg-white p-2 shadow-lg"
            style={{ left: selectionPopover.x, top: selectionPopover.y }}
            initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.96, y: reducedMotion ? 0 : 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: reducedMotion ? 1 : 0.96, y: reducedMotion ? 0 : 4 }}
            transition={tweenFor(reducedMotion, MOTION_DURATION.fast)}
          >
            <p className="mb-2 max-w-[220px] text-[11px] text-slate-500">
              Branch from selected content:
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleBranch('ask', selectionPopover.text)}
                className="rounded-lg bg-cyan-50 px-3 py-1.5 text-xs font-medium text-cyan-700 transition hover:bg-cyan-100"
              >
                Ask
              </button>
              <button
                type="button"
                onClick={() => handleBranch('explain', selectionPopover.text)}
                className="rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700 transition hover:bg-orange-100"
              >
                Explain
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!selectionPopover && selectionText && onCreateBranch && (
          <motion.div
            className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-xl border border-slate-200 bg-white/95 p-2 shadow-lg backdrop-blur-sm"
            initial={{ opacity: 0, y: reducedMotion ? 0 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reducedMotion ? 0 : 6 }}
            transition={tweenFor(reducedMotion, MOTION_DURATION.fast)}
          >
            <p className="mb-2 max-w-[250px] text-[11px] text-slate-500">
              Branch from selected content:
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleBranch('ask', selectionText)}
                className="rounded-lg bg-cyan-50 px-3 py-1.5 text-xs font-medium text-cyan-700 transition hover:bg-cyan-100"
              >
                Ask
              </button>
              <button
                type="button"
                onClick={() => handleBranch('explain', selectionText)}
                className="rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700 transition hover:bg-orange-100"
              >
                Explain
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
