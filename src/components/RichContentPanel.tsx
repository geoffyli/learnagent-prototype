import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleDashed,
  CircleDot,
  Copy,
  GripVertical,
  Info,
  Lightbulb,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import type {
  CalloutStackBlock,
  ChecklistBlock,
  CodeBlock,
  ComparisonTableBlock,
  ConceptMapBlock,
  ContentBlock,
  DebugTraceBlock,
  FlashcardDeckBlock,
  FlashcardItem,
  MetricStripBlock,
  TimelineBlock,
} from '../types/content-blocks';
import { MOTION_DURATION, springFor, tweenFor } from '../motion/tokens';
import { fadeSlideY, staggerContainer } from '../motion/variants';
import { normalizeRichBlock, richBlockKey } from '../state/rich-content-utils';

function contentTypeBadge(type: string): { label: string; color: string } {
  const badges: Record<string, { label: string; color: string }> = {
    'comparison-table': { label: 'Comparison Table', color: 'text-blue-700 bg-blue-50 border-blue-200' },
    'flashcard-deck': { label: 'Flashcard Deck', color: 'text-violet-700 bg-violet-50 border-violet-200' },
    'concept-map': { label: 'Concept Map', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    'timeline': { label: 'Timeline', color: 'text-amber-700 bg-amber-50 border-amber-200' },
    'checklist': { label: 'Checklist', color: 'text-teal-700 bg-teal-50 border-teal-200' },
    'callout-stack': { label: 'Callout Stack', color: 'text-rose-700 bg-rose-50 border-rose-200' },
    'metric-strip': { label: 'Metric Strip', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
    'debug-trace': { label: 'Debug Trace', color: 'text-orange-700 bg-orange-50 border-orange-200' },
    'code': { label: 'Code', color: 'text-slate-700 bg-slate-50 border-slate-200' },
  };
  return badges[type] ?? { label: type, color: 'text-slate-700 bg-slate-50 border-slate-200' };
}

function ContentTypeBadge({ type }: { type: string }) {
  const badge = contentTypeBadge(type);
  return (
    <span className={`mb-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badge.color}`}>
      {badge.label}
    </span>
  );
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
      className="flex flex-1 flex-col overflow-hidden rounded-[22px] border border-gray-700 bg-[#0f172a] text-sm"
      variants={staggerContainer(reducedMotion, 0.04)}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="flex items-center justify-between border-b border-gray-800 px-4 py-2"
        variants={fadeSlideY(reducedMotion, 6, MOTION_DURATION.fast)}
      >
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500/80" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
          </div>
          {block.filename && (
            <span className="ml-1 font-mono text-[11px] text-[#64748b]">{block.filename}</span>
          )}
        </div>

        <motion.button
          type="button"
          onClick={handleCopy}
          whileHover={reducedMotion ? undefined : { y: -1 }}
          whileTap={reducedMotion ? undefined : { scale: 0.96 }}
          transition={springFor(reducedMotion, 'snappy')}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] text-[#64748b] transition hover:bg-gray-800 hover:text-white"
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
        className="flex-1 overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-gray-200"
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
      className="flex flex-1 flex-col overflow-hidden rounded-[22px] border border-[#e2e8f0] bg-white"
      variants={staggerContainer(reducedMotion, 0.04)}
      initial="hidden"
      animate="visible"
    >
      {block.title && (
        <motion.div className="border-b border-[#f1f5f9] px-4 py-3" variants={fadeSlideY(reducedMotion, 6, MOTION_DURATION.fast)}>
          <p className="font-heading text-lg font-normal tracking-[-0.32px] text-[#0f172a]">{block.title}</p>
        </motion.div>
      )}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#f1f5f9] bg-[#f8fafc]">
            <th className="px-4 py-2.5 text-left font-medium text-[#0f172a]">Aspect</th>
            <th className="px-4 py-2.5 text-left font-medium text-[#0f172a]">{block.leftLabel}</th>
            <th className="px-4 py-2.5 text-left font-medium text-[#0f172a]">{block.rightLabel}</th>
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
              className={`border-b border-[#f1f5f9] last:border-0 ${i % 2 === 1 ? 'bg-[#f8fafc]' : 'bg-white'}`}
            >
              <td className="px-4 py-2.5 font-medium text-[#0f172a]">{row.aspect}</td>
              <td className="px-4 py-2.5 text-[#0f172a]">{row.left}</td>
              <td className="px-4 py-2.5 text-[#0f172a]">{row.right}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}

/* ---------- Flashcard helpers ---------- */

function cardTextSize(text: string): string {
  const len = text.length;
  if (len < 60) return 'text-2xl leading-snug font-medium';
  if (len < 120) return 'text-xl leading-snug font-medium';
  if (len < 250) return 'text-lg leading-relaxed';
  return 'text-base leading-relaxed';
}

const CARD_KIND_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  flip: { label: 'Flip', bg: 'bg-violet-100', text: 'text-violet-600' },
  'fill-blank': { label: 'Fill Blank', bg: 'bg-sky-100', text: 'text-sky-600' },
  mcq: { label: 'Choice', bg: 'bg-amber-100', text: 'text-amber-700' },
  order: { label: 'Order', bg: 'bg-emerald-100', text: 'text-emerald-600' },
};

/* --- Flip card (3D) --- */

function FlipCard({
  card,
  index,
  total,
  reducedMotion,
}: {
  card: Extract<FlashcardItem, { kind: 'flip' }>;
  index: number;
  total: number;
  reducedMotion: boolean;
}) {
  const [flipped, setFlipped] = useState(false);

  const renderFace = (side: 'question' | 'answer', text: string) => (
    <>
      <span className="pointer-events-none absolute right-6 top-4 select-none font-serif text-[120px] font-bold leading-none text-slate-100/80">
        {side === 'question' ? 'Q' : 'A'}
      </span>
      <div className="relative z-10 flex items-start justify-between">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${side === 'question' ? 'bg-violet-100 text-violet-600' : 'bg-emerald-100 text-emerald-600'}`}>
          {side === 'question' ? 'Question' : 'Answer'}
        </span>
        <span className="text-[11px] font-medium text-slate-400">{index + 1} of {total}</span>
      </div>
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-6">
        <p className={`${cardTextSize(text)} text-center text-[#0f172a]`}>{text}</p>
      </div>
      <div className="relative z-10 flex items-center justify-center gap-2 text-slate-400 group-hover:text-violet-500">
        <RotateCcw className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
        <span className="text-xs font-medium transition-colors">
          {side === 'question' ? 'Tap to reveal answer' : 'Tap to see question'}
        </span>
      </div>
    </>
  );

  if (reducedMotion) {
    return (
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="group relative flex w-full flex-1 cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6"
      >
        {renderFace(flipped ? 'answer' : 'question', flipped ? card.answer : card.question)}
      </button>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={() => setFlipped((f) => !f)}
      animate={{ rotateY: flipped ? 180 : 0 }}
      transition={springFor(reducedMotion, 'card')}
      className="group relative w-full flex-1 cursor-pointer rounded-2xl"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div
        className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6"
        style={{ backfaceVisibility: 'hidden' }}
      >
        {renderFace('question', card.question)}
      </div>
      <div
        className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6"
        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
      >
        {renderFace('answer', card.answer)}
      </div>
      <div className="pointer-events-none min-h-[140px] opacity-0" />
    </motion.button>
  );
}

/* --- Fill-blank card --- */

function FillBlankCard({
  card,
  index,
  total,
}: {
  card: Extract<FlashcardItem, { kind: 'fill-blank' }>;
  index: number;
  total: number;
}) {
  const [input, setInput] = useState('');
  const [checked, setChecked] = useState(false);
  const isCorrect = checked && input.trim().toLowerCase() === card.answer.toLowerCase();
  const isWrong = checked && !isCorrect;

  return (
    <div className="flex w-full flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6">
      {/* Top */}
      <div className="flex items-start justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-sky-600">
          Fill in the Blank
        </span>
        <span className="text-[11px] font-medium text-slate-400">{index + 1} of {total}</span>
      </div>

      {/* Watermark */}
      <span className="pointer-events-none absolute right-6 top-4 select-none font-serif text-[120px] font-bold leading-none text-slate-100/80">
        F
      </span>

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-4 py-6">
        <p className={`${cardTextSize(card.prompt)} text-center text-[#0f172a]`}>{card.prompt}</p>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value); setChecked(false); }}
            placeholder="Type your answer..."
            className={`w-48 rounded-xl border-2 px-4 py-2.5 text-center text-base font-medium outline-none transition-colors ${
              isCorrect
                ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                : isWrong
                ? 'border-rose-400 bg-rose-50 text-rose-700'
                : 'border-slate-200 bg-slate-50 text-[#0f172a] focus:border-sky-400 focus:bg-white'
            }`}
          />
          <button
            type="button"
            onClick={() => setChecked(true)}
            disabled={!input.trim()}
            className="rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-600 disabled:opacity-40"
          >
            Check
          </button>
        </div>

        {checked && (
          <div className={`rounded-xl px-4 py-2 text-sm font-medium ${isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            {isCorrect ? (
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4" /> Correct!</span>
            ) : (
              <span>The answer is: <strong>{card.answer}</strong></span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* --- Multiple choice card --- */

function McqCard({
  card,
  index,
  total,
}: {
  card: Extract<FlashcardItem, { kind: 'mcq' }>;
  index: number;
  total: number;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  const labels = ['A', 'B', 'C', 'D'];

  return (
    <div className="flex w-full flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6">
      {/* Top */}
      <div className="flex items-start justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-700">
          Multiple Choice
        </span>
        <span className="text-[11px] font-medium text-slate-400">{index + 1} of {total}</span>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-2 py-6">
        <p className={`${cardTextSize(card.question)} text-center text-[#0f172a]`}>{card.question}</p>

        <div className="grid w-full max-w-lg gap-2.5">
          {card.options.map((opt, i) => {
            const isCorrect = i === card.correctIndex;
            const isSelected = i === selected;
            let optClass = 'border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/50';
            if (answered) {
              if (isCorrect) optClass = 'border-emerald-400 bg-emerald-50';
              else if (isSelected && !isCorrect) optClass = 'border-rose-400 bg-rose-50';
              else optClass = 'border-slate-100 bg-slate-50 opacity-60';
            }
            return (
              <button
                key={i}
                type="button"
                onClick={() => !answered && setSelected(i)}
                disabled={answered}
                className={`flex items-start gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm transition ${optClass}`}
              >
                <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  answered && isCorrect
                    ? 'bg-emerald-500 text-white'
                    : answered && isSelected && !isCorrect
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {answered && isCorrect ? <Check className="h-3.5 w-3.5" /> : labels[i]}
                </span>
                <span className="text-[#0f172a]">{opt}</span>
              </button>
            );
          })}
        </div>

        {answered && (
          <p className={`text-sm font-medium ${selected === card.correctIndex ? 'text-emerald-600' : 'text-rose-600'}`}>
            {selected === card.correctIndex ? 'Correct!' : `Correct answer: ${labels[card.correctIndex]}`}
          </p>
        )}
      </div>
    </div>
  );
}

/* --- Order card --- */

function OrderCard({
  card,
  index,
  total,
}: {
  card: Extract<FlashcardItem, { kind: 'order' }>;
  index: number;
  total: number;
}) {
  const [sequence, setSequence] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);

  const toggleItem = (itemIdx: number) => {
    if (checked) return;
    if (sequence.includes(itemIdx)) {
      setSequence(sequence.filter((i) => i !== itemIdx));
    } else {
      setSequence([...sequence, itemIdx]);
    }
  };

  const isItemCorrect = (itemIdx: number) => {
    if (!checked) return null;
    const seqPos = sequence.indexOf(itemIdx);
    if (seqPos === -1) return false;
    return card.correctOrder[seqPos] === itemIdx;
  };

  const allCorrect = checked && sequence.length === card.items.length && sequence.every((idx, pos) => card.correctOrder[pos] === idx);

  return (
    <div className="flex w-full flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6">
      {/* Top */}
      <div className="flex items-start justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
          Put in Order
        </span>
        <span className="text-[11px] font-medium text-slate-400">{index + 1} of {total}</span>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-5 px-2 py-6">
        <p className={`${cardTextSize(card.instruction)} text-center text-[#0f172a]`}>{card.instruction}</p>

        <div className="grid w-full max-w-lg gap-2">
          {card.items.map((item, i) => {
            const seqNum = sequence.indexOf(i);
            const correct = isItemCorrect(i);
            let itemClass = 'border-slate-200 bg-white hover:border-emerald-300';
            if (seqNum !== -1 && !checked) itemClass = 'border-emerald-400 bg-emerald-50';
            if (checked && correct === true) itemClass = 'border-emerald-400 bg-emerald-50';
            if (checked && correct === false) itemClass = 'border-rose-400 bg-rose-50';
            if (checked && seqNum === -1) itemClass = 'border-slate-100 bg-slate-50 opacity-60';
            return (
              <button
                key={i}
                type="button"
                onClick={() => toggleItem(i)}
                disabled={checked}
                className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm transition ${itemClass}`}
              >
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  seqNum !== -1
                    ? checked
                      ? correct ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                      : 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  {seqNum !== -1 ? seqNum + 1 : <GripVertical className="h-3.5 w-3.5" />}
                </span>
                <span className="text-[#0f172a]">{item}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {!checked && (
            <button
              type="button"
              onClick={() => setChecked(true)}
              disabled={sequence.length !== card.items.length}
              className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:opacity-40"
            >
              Check Order
            </button>
          )}
          {checked && (
            <p className={`text-sm font-medium ${allCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
              {allCorrect ? 'Perfect order!' : 'Not quite — try again!'}
            </p>
          )}
          {checked && !allCorrect && (
            <button
              type="button"
              onClick={() => { setSequence([]); setChecked(false); }}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* --- Card dispatcher --- */

function CardContent({
  card,
  index,
  total,
  reducedMotion,
}: {
  card: FlashcardItem;
  index: number;
  total: number;
  reducedMotion: boolean;
}) {
  switch (card.kind) {
    case 'flip':
      return <FlipCard card={card} index={index} total={total} reducedMotion={reducedMotion} />;
    case 'fill-blank':
      return <FillBlankCard card={card} index={index} total={total} />;
    case 'mcq':
      return <McqCard card={card} index={index} total={total} />;
    case 'order':
      return <OrderCard card={card} index={index} total={total} />;
    default:
      return null;
  }
}

/* --- Main deck view --- */

function FlashcardDeckView({ block }: { block: FlashcardDeckBlock }) {
  const reducedMotion = useReducedMotion() ?? false;
  const [index, setIndex] = useState(0);

  const card = block.cards[index];
  const total = block.cards.length;
  const badge = CARD_KIND_BADGE[card.kind] ?? CARD_KIND_BADGE.flip;

  const goTo = (next: number) => {
    setIndex(next);
  };

  return (
    <motion.div className="flex flex-1 flex-col overflow-hidden rounded-[22px] border border-[#e2e8f0] bg-white" variants={fadeSlideY(reducedMotion, 8)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#f1f5f9] px-4 py-3">
        <p className="font-heading text-base font-semibold text-[#0f172a]">{block.topic}</p>
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${badge.bg} ${badge.text}`}>
          {badge.label}
        </span>
      </div>

      {/* Card area */}
      <div className="flex flex-1 flex-col p-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={card.id}
            initial={{ opacity: 0, x: reducedMotion ? 0 : 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: reducedMotion ? 0 : -12 }}
            transition={tweenFor(reducedMotion, MOTION_DURATION.base)}
            className="flex flex-1 flex-col [perspective:1200px]"
          >
            <CardContent card={card} index={index} total={total} reducedMotion={reducedMotion} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer: nav + progress dots */}
      <div className="flex items-center justify-between border-t border-[#f1f5f9] px-4 py-3">
        <motion.button
          type="button"
          disabled={index === 0}
          onClick={() => goTo(index - 1)}
          whileTap={reducedMotion ? undefined : { scale: 0.96 }}
          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-[#0f172a] transition hover:text-[#2563eb] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Prev
        </motion.button>

        <div className="flex items-center gap-1.5">
          {block.cards.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all duration-200 ${
                i === index
                  ? 'w-5 bg-violet-500'
                  : i < index
                  ? 'w-2 bg-violet-300'
                  : 'w-2 bg-slate-200'
              }`}
              aria-label={`Go to card ${i + 1}`}
            />
          ))}
        </div>

        <motion.button
          type="button"
          disabled={index === total - 1}
          onClick={() => goTo(index + 1)}
          whileTap={reducedMotion ? undefined : { scale: 0.96 }}
          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-[#0f172a] transition hover:text-[#2563eb] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next <ChevronRight className="h-3.5 w-3.5" />
        </motion.button>
      </div>
    </motion.div>
  );
}

function ConceptMapView({ block }: { block: ConceptMapBlock }) {
  const reducedMotion = useReducedMotion() ?? false;
  const grouped = useMemo(
    () => ({
      core: block.nodes.filter((n) => n.lane === 'core'),
      support: block.nodes.filter((n) => n.lane === 'support'),
      risk: block.nodes.filter((n) => n.lane === 'risk'),
    }),
    [block.nodes],
  );

  return (
    <motion.div className="flex flex-1 flex-col overflow-hidden rounded-[22px] border border-[#e2e8f0] bg-white" variants={fadeSlideY(reducedMotion, 8)}>
      <div className="border-b border-[#f1f5f9] bg-[#f8fafc] px-4 py-3">
        <p className="font-heading text-lg font-normal tracking-[-0.32px] text-[#0f172a]">{block.title}</p>
      </div>

      <div className="flex-1 grid gap-3 p-4 md:grid-cols-3">
        <div className="rounded-[22px] border border-[#e2e8f0] bg-white p-3">
          <p className="label-code text-sm">Core</p>
          <div className="mt-2 space-y-1.5">
            {grouped.core.map((node) => (
              <p key={node.id} className="rounded-[22px] border border-[#e2e8f0] bg-white px-2 py-1 text-sm font-medium text-[#0f172a]">{node.label}</p>
            ))}
          </div>
        </div>

        <div className="rounded-[22px] border border-[#e2e8f0] bg-white p-3">
          <p className="label-code text-sm">Support</p>
          <div className="mt-2 space-y-1.5">
            {grouped.support.map((node) => (
              <p key={node.id} className="rounded-[22px] border border-[#e2e8f0] bg-white px-2 py-1 text-sm font-medium text-[#0f172a]">{node.label}</p>
            ))}
          </div>
        </div>

        <div className="rounded-[22px] border border-[#e2e8f0] bg-white p-3">
          <p className="label-code text-sm">Risk</p>
          <div className="mt-2 space-y-1.5">
            {grouped.risk.map((node) => (
              <p key={node.id} className="rounded-[22px] border border-[#e2e8f0] bg-white px-2 py-1 text-sm font-medium text-[#0f172a]">{node.label}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-[#f1f5f9] px-4 py-3">
        <p className="text-sm font-semibold text-[#0f172a]">Connections</p>
        <div className="mt-2 space-y-1.5">
          {block.edges.map((edge) => (
            <p key={`${edge.from}-${edge.to}-${edge.label ?? ''}`} className="text-sm text-[#1e293b]">
              <span className="font-semibold text-[#0f172a]">{edge.from}</span>{' -> '}<span className="font-semibold text-[#0f172a]">{edge.to}</span>
              {edge.label ? <span className="text-[#64748b]"> ({edge.label})</span> : null}
            </p>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function TimelineView({ block }: { block: TimelineBlock }) {
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <motion.div className="flex flex-1 flex-col overflow-hidden rounded-[22px] border border-[#e2e8f0] bg-white" variants={fadeSlideY(reducedMotion, 8)}>
      <div className="border-b border-[#f1f5f9] bg-[#f8fafc] px-4 py-3">
        <p className="font-heading text-lg font-normal tracking-[-0.32px] text-[#0f172a]">{block.title}</p>
      </div>
      <div className="flex-1 space-y-3 p-4">
        {block.steps.map((step, index) => {
          const isActive = step.state === 'active';
          const isDone = step.state === 'done';

          return (
            <div key={step.id} className="flex items-start gap-3">
              <div className="mt-0.5">
                {isDone ? (
                  <CircleCheck className="h-4 w-4 text-[#16a34a]" />
                ) : isActive ? (
                  <CircleDot className="h-4 w-4 text-[#0f172a]" />
                ) : (
                  <CircleDashed className="h-4 w-4 text-[#94a3b8]" />
                )}
              </div>
              <div className="min-w-0 flex-1 rounded-[22px] border px-3 py-2.5 text-xs leading-relaxed">
                <p className="font-semibold text-[#0f172a]">{step.title}</p>
                <p className="mt-1 text-[#1e293b]">{step.detail}</p>
                {step.duration ? (
                  <p className="mt-1.5 text-[11px] text-[#64748b]">{step.duration}</p>
                ) : null}
              </div>
              <p className="text-[11px] text-[#64748b]">{index + 1}</p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function ChecklistView({ block }: { block: ChecklistBlock }) {
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <motion.div className="flex flex-1 flex-col overflow-hidden rounded-[22px] border border-[#e2e8f0] bg-white" variants={fadeSlideY(reducedMotion, 8)}>
      <div className="border-b border-[#f1f5f9] bg-[#f8fafc] px-4 py-3">
        <p className="font-heading text-lg font-normal tracking-[-0.32px] text-[#0f172a]">{block.title}</p>
      </div>
      <div className="flex-1 space-y-2.5 p-4">
        {block.items.map((item) => (
          <div key={item.id} className="rounded-[22px] border border-[#e2e8f0] bg-white px-3 py-2.5">
            <div className="flex items-start gap-2">
              {item.done ? (
                <CircleCheck className="mt-0.5 h-4 w-4 text-[#0f172a]" />
              ) : (
                <CircleDashed className="mt-0.5 h-4 w-4 text-[#64748b]" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#0f172a]">{item.label}</p>
                {item.note ? <p className="mt-1 text-[11px] text-[#64748b]">{item.note}</p> : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function CalloutStackView({ block }: { block: CalloutStackBlock }) {
  const reducedMotion = useReducedMotion() ?? false;

  const toneStyles: Record<CalloutStackBlock['items'][number]['tone'], { bg: string; border: string; iconClass: string }> = {
    tip: { bg: 'bg-emerald-50', border: 'border-emerald-200', iconClass: 'text-emerald-600' },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', iconClass: 'text-amber-600' },
    insight: { bg: 'bg-blue-50', border: 'border-blue-200', iconClass: 'text-blue-600' },
    'anti-pattern': { bg: 'bg-rose-50', border: 'border-rose-200', iconClass: 'text-rose-600' },
  };

  const toneIcons: Record<CalloutStackBlock['items'][number]['tone'], (cls: string) => JSX.Element> = {
    tip: (cls) => <Lightbulb className={`h-4 w-4 ${cls}`} />,
    warning: (cls) => <AlertTriangle className={`h-4 w-4 ${cls}`} />,
    insight: (cls) => <Info className={`h-4 w-4 ${cls}`} />,
    'anti-pattern': (cls) => <XCircle className={`h-4 w-4 ${cls}`} />,
  };

  return (
    <motion.div className="flex flex-1 flex-col overflow-hidden rounded-[22px] border border-[#e2e8f0] bg-white" variants={fadeSlideY(reducedMotion, 8)}>
      {block.title ? (
        <div className="border-b border-[#f1f5f9] bg-[#f8fafc] px-4 py-3">
          <p className="font-heading text-lg font-normal tracking-[-0.32px] text-[#0f172a]">{block.title}</p>
        </div>
      ) : null}
      <div className="flex-1 space-y-2.5 p-4">
        {block.items.map((item) => {
          const style = toneStyles[item.tone];
          return (
            <div key={item.id} className={`rounded-[22px] border ${style.border} ${style.bg} px-3 py-2.5`}>
              <div className="flex items-start gap-2">
                <span className="mt-0.5">{toneIcons[item.tone](style.iconClass)}</span>
                <div>
                  <p className="text-sm font-semibold text-[#0f172a]">
                    {item.heading}
                  </p>
                  <p className="mt-1 text-sm text-[#1e293b]">{item.body}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function metricToneClass(value: string | number): string {
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(num)) return 'bg-blue-500';
  if (num >= 70) return 'bg-emerald-500';
  if (num >= 40) return 'bg-amber-500';
  return 'bg-blue-500';
}

function MetricStripView({ block }: { block: MetricStripBlock }) {
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <motion.div className="flex flex-1 flex-col overflow-hidden rounded-[22px] border border-[#e2e8f0] bg-white" variants={fadeSlideY(reducedMotion, 8)}>
      {block.title ? (
        <div className="border-b border-[#f1f5f9] bg-[#f8fafc] px-4 py-3">
          <p className="font-heading text-lg font-normal tracking-[-0.32px] text-[#0f172a]">{block.title}</p>
        </div>
      ) : null}
      <div className="flex-1 grid gap-2 p-4 sm:grid-cols-2 xl:grid-cols-3">
        {block.metrics.map((metric) => (
          <div key={metric.id} className="rounded-[22px] border border-[#f1f5f9] bg-white px-3 py-2.5">
            <p className="text-sm text-[#64748b]">{metric.label}</p>
            <p className="font-heading mt-1 text-2xl text-[#0f172a]">{metric.value}</p>
            <div className="mt-1.5 h-1 w-full rounded-full bg-[#f1f5f9] overflow-hidden">
              <div
                className={`h-full rounded-full ${metricToneClass(metric.value)}`}
                style={{ width: `${Math.min(100, Math.max(10, parseFloat(String(metric.value)) || 50))}%` }}
              />
            </div>
            {metric.delta ? <p className="mt-1 text-[11px] text-[#64748b]">{metric.delta}</p> : null}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function DebugTraceView({ block }: { block: DebugTraceBlock }) {
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <motion.div className="flex flex-1 flex-col overflow-hidden rounded-[22px] border border-[#e2e8f0] bg-white" variants={fadeSlideY(reducedMotion, 8)}>
      <div className="border-b border-[#f1f5f9] bg-[#f8fafc] px-4 py-3">
        <p className="font-heading text-lg font-normal tracking-[-0.32px] text-[#0f172a]">{block.title}</p>
      </div>
      <div className="flex-1 space-y-2 p-4 font-mono text-xs">
        {block.events.map((event) => (
          <div key={event.id} className="rounded-[22px] border border-[#e2e8f0] bg-white px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-[#0f172a]">{event.stage}</p>
              <span className="label-code rounded-md border border-[#e2e8f0] bg-white px-1.5 py-0.5">
                {event.kind}
              </span>
            </div>
            <p className="mt-1.5 text-[11px] text-[#1e293b]">{event.detail}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function RichContentPanel({
  blocks,
}: {
  blocks: ContentBlock[];
}) {
  const reducedMotion = useReducedMotion() ?? false;
  const scrollerRef = useRef<HTMLDivElement>(null);

  const normalizedBlocks = useMemo(
    () => blocks
      .map((block) => normalizeRichBlock(block))
      .filter((block): block is ContentBlock => block !== null),
    [blocks],
  );

  const sequenceKey = useMemo(
    () => normalizedBlocks.map((block, i) => richBlockKey(block, i)).join('|') || 'empty',
    [normalizedBlocks],
  );

  if (normalizedBlocks.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="rounded-[22px] border border-[#e2e8f0] bg-white px-5 py-4 text-center">
          <p className="text-sm font-medium text-[#0f172a]">No content to display yet.</p>
          <p className="mt-1 text-xs text-[#64748b]">
            Ask for an example, comparison, or quiz to generate rich content.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollerRef}
      className="relative h-full overflow-y-auto p-4"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={sequenceKey}
          className="flex min-h-full flex-col gap-4"
          data-rich-selectable="true"
          variants={staggerContainer(reducedMotion, 0.08, 0.03)}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, y: reducedMotion ? 0 : -8, transition: tweenFor(reducedMotion, MOTION_DURATION.fast, 'exit') }}
        >
          {normalizedBlocks.map((block, i) => {
            const key = richBlockKey(block, i);

            if (block.type === 'code') {
              return (
                <motion.div key={key} className="flex flex-1 flex-col" variants={fadeSlideY(reducedMotion, 8)}>
                  <ContentTypeBadge type={block.type} />
                  <CodeBlockView block={block} />
                </motion.div>
              );
            }

            if (block.type === 'comparison-table') {
              return (
                <motion.div key={key} className="flex flex-1 flex-col" variants={fadeSlideY(reducedMotion, 8)}>
                  <ContentTypeBadge type={block.type} />
                  <ComparisonTableView block={block} />
                </motion.div>
              );
            }

            if (block.type === 'flashcard-deck') {
              return (
                <motion.div key={key} className="flex flex-1 flex-col" variants={fadeSlideY(reducedMotion, 8)}>
                  <ContentTypeBadge type={block.type} />
                  <FlashcardDeckView block={block} />
                </motion.div>
              );
            }

            if (block.type === 'concept-map') {
              return (
                <motion.div key={key} className="flex flex-1 flex-col" variants={fadeSlideY(reducedMotion, 8)}>
                  <ContentTypeBadge type={block.type} />
                  <ConceptMapView block={block} />
                </motion.div>
              );
            }

            if (block.type === 'timeline') {
              return (
                <motion.div key={key} className="flex flex-1 flex-col" variants={fadeSlideY(reducedMotion, 8)}>
                  <ContentTypeBadge type={block.type} />
                  <TimelineView block={block} />
                </motion.div>
              );
            }

            if (block.type === 'checklist') {
              return (
                <motion.div key={key} className="flex flex-1 flex-col" variants={fadeSlideY(reducedMotion, 8)}>
                  <ContentTypeBadge type={block.type} />
                  <ChecklistView block={block} />
                </motion.div>
              );
            }

            if (block.type === 'callout-stack') {
              return (
                <motion.div key={key} className="flex flex-1 flex-col" variants={fadeSlideY(reducedMotion, 8)}>
                  <ContentTypeBadge type={block.type} />
                  <CalloutStackView block={block} />
                </motion.div>
              );
            }

            if (block.type === 'metric-strip') {
              return (
                <motion.div key={key} className="flex flex-1 flex-col" variants={fadeSlideY(reducedMotion, 8)}>
                  <ContentTypeBadge type={block.type} />
                  <MetricStripView block={block} />
                </motion.div>
              );
            }

            if (block.type === 'debug-trace') {
              return (
                <motion.div key={key} className="flex flex-1 flex-col" variants={fadeSlideY(reducedMotion, 8)}>
                  <ContentTypeBadge type={block.type} />
                  <DebugTraceView block={block} />
                </motion.div>
              );
            }

            return null;
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
