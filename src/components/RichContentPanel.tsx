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
  MetricStripBlock,
  TimelineBlock,
} from '../types/content-blocks';
import { MOTION_DURATION, springFor, tweenFor } from '../motion/tokens';
import { fadeSlideY, staggerContainer } from '../motion/variants';
import { normalizeRichBlock, richBlockKey } from '../state/rich-content-utils';

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
      className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 text-sm shadow-[0_12px_30px_rgba(2,6,23,0.35)]"
      variants={staggerContainer(reducedMotion, 0.04)}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="flex items-center justify-between border-b border-slate-800 px-4 py-2"
        variants={fadeSlideY(reducedMotion, 6, MOTION_DURATION.fast)}
      >
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500/80" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
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
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      variants={staggerContainer(reducedMotion, 0.04)}
      initial="hidden"
      animate="visible"
    >
      {block.title && (
        <motion.div className="border-b border-slate-100 px-4 py-3" variants={fadeSlideY(reducedMotion, 6, MOTION_DURATION.fast)}>
          <p className="font-heading text-base font-semibold text-slate-900">{block.title}</p>
        </motion.div>
      )}
      <table className="w-full text-sm">
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
    <motion.div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" variants={fadeSlideY(reducedMotion, 8)}>
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <p className="font-heading text-base font-semibold text-slate-900">{block.topic} - Flashcards</p>
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
                className="group relative w-full cursor-pointer rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 text-left"
                style={{ minHeight: 140 }}
              >
                <span className="mb-3 inline-block rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                  {flipped ? 'Answer' : 'Question'}
                </span>
                <p className={`text-sm leading-relaxed ${flipped ? 'text-teal-800' : 'text-slate-800'}`}>
                  {flipped ? card.answer : card.question}
                </p>
                <p className="mt-3 text-xs text-slate-500 group-hover:text-slate-600">
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
                  <span className="mb-3 inline-block rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                    Question
                  </span>
                  <p className="text-sm leading-relaxed text-slate-800">{card.question}</p>
                </div>

                <div
                  className="absolute inset-0 rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white p-6"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <span className="mb-3 inline-block rounded-lg border border-teal-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-teal-600">
                    Answer
                  </span>
                  <p className="text-sm leading-relaxed text-teal-800">{card.answer}</p>
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
          onClick={() => {
            setFlipped(false);
            setIndex(0);
          }}
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
    <motion.div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" variants={fadeSlideY(reducedMotion, 8)}>
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
        <p className="font-heading text-base font-semibold text-slate-900">{block.title}</p>
      </div>

      <div className="grid gap-3 p-4 md:grid-cols-3">
        <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-3">
          <p className="text-sm font-semibold text-teal-700">Core</p>
          <div className="mt-2 space-y-1.5">
            {grouped.core.map((node) => (
              <p key={node.id} className="rounded-md bg-white px-2 py-1 text-sm font-medium text-slate-800">{node.label}</p>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3">
          <p className="text-sm font-semibold text-blue-700">Support</p>
          <div className="mt-2 space-y-1.5">
            {grouped.support.map((node) => (
              <p key={node.id} className="rounded-md bg-white px-2 py-1 text-sm font-medium text-slate-800">{node.label}</p>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3">
          <p className="text-sm font-semibold text-rose-700">Risk</p>
          <div className="mt-2 space-y-1.5">
            {grouped.risk.map((node) => (
              <p key={node.id} className="rounded-md bg-white px-2 py-1 text-sm font-medium text-slate-800">{node.label}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 px-4 py-3">
        <p className="text-sm font-semibold text-slate-700">Connections</p>
        <div className="mt-2 space-y-1.5">
          {block.edges.map((edge) => (
            <p key={`${edge.from}-${edge.to}-${edge.label ?? ''}`} className="text-sm text-slate-600">
              <span className="font-semibold text-slate-800">{edge.from}</span>{' -> '}<span className="font-semibold text-slate-800">{edge.to}</span>
              {edge.label ? <span className="text-slate-500"> ({edge.label})</span> : null}
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
    <motion.div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" variants={fadeSlideY(reducedMotion, 8)}>
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
        <p className="font-heading text-base font-semibold text-slate-900">{block.title}</p>
      </div>
      <div className="space-y-3 p-4">
        {block.steps.map((step, index) => {
          const isActive = step.state === 'active';
          const isDone = step.state === 'done';

          return (
            <div key={step.id} className="flex items-start gap-3">
              <div className="mt-0.5">
                {isDone ? (
                  <CircleCheck className="h-4 w-4 text-emerald-600" />
                ) : isActive ? (
                  <CircleDot className="h-4 w-4 text-amber-600" />
                ) : (
                  <CircleDashed className="h-4 w-4 text-slate-300" />
                )}
              </div>
              <div className="min-w-0 flex-1 rounded-xl border px-3 py-2.5 text-xs leading-relaxed">
                <p className="font-semibold text-slate-900">{step.title}</p>
                <p className="mt-1 text-slate-600">{step.detail}</p>
                {step.duration ? (
                  <p className="mt-1.5 text-[11px] text-slate-500">{step.duration}</p>
                ) : null}
              </div>
              <p className="text-[11px] text-slate-400">{index + 1}</p>
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
    <motion.div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" variants={fadeSlideY(reducedMotion, 8)}>
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
        <p className="font-heading text-base font-semibold text-slate-900">{block.title}</p>
      </div>
      <div className="space-y-2.5 p-4">
        {block.items.map((item) => (
          <div key={item.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
            <div className="flex items-start gap-2">
              {item.done ? (
                <CircleCheck className="mt-0.5 h-4 w-4 text-emerald-600" />
              ) : (
                <CircleDashed className="mt-0.5 h-4 w-4 text-slate-400" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                {item.note ? <p className="mt-1 text-[11px] text-slate-500">{item.note}</p> : null}
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

  const toneMeta: Record<CalloutStackBlock['items'][number]['tone'], { icon: JSX.Element; className: string }> = {
    tip: {
      icon: <Lightbulb className="h-4 w-4" />,
      className: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    },
    warning: {
      icon: <AlertTriangle className="h-4 w-4" />,
      className: 'border-amber-200 bg-amber-50 text-amber-900',
    },
    insight: {
      icon: <Info className="h-4 w-4" />,
      className: 'border-blue-200 bg-blue-50 text-blue-900',
    },
    'anti-pattern': {
      icon: <XCircle className="h-4 w-4" />,
      className: 'border-rose-200 bg-rose-50 text-rose-900',
    },
  };

  return (
    <motion.div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" variants={fadeSlideY(reducedMotion, 8)}>
      {block.title ? (
        <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
          <p className="font-heading text-base font-semibold text-slate-900">{block.title}</p>
        </div>
      ) : null}
      <div className="space-y-2.5 p-4">
        {block.items.map((item) => {
          const meta = toneMeta[item.tone];
          return (
            <div key={item.id} className={`rounded-xl border px-3 py-2.5 ${meta.className}`}>
              <div className="flex items-start gap-2">
                <span className="mt-0.5">{meta.icon}</span>
                <div>
                  <p className="text-sm font-semibold">{item.heading}</p>
                  <p className="mt-1 text-sm opacity-90">{item.body}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function MetricStripView({ block }: { block: MetricStripBlock }) {
  const reducedMotion = useReducedMotion() ?? false;

  const toneClass: Record<MetricStripBlock['metrics'][number]['tone'], string> = {
    good: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    neutral: 'border-slate-200 bg-slate-50 text-slate-900',
    warn: 'border-amber-200 bg-amber-50 text-amber-900',
  };

  return (
    <motion.div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" variants={fadeSlideY(reducedMotion, 8)}>
      {block.title ? (
        <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
          <p className="font-heading text-base font-semibold text-slate-900">{block.title}</p>
        </div>
      ) : null}
      <div className="grid gap-2 p-4 sm:grid-cols-2 xl:grid-cols-3">
        {block.metrics.map((metric) => (
          <div key={metric.id} className={`rounded-xl border px-3 py-2.5 ${toneClass[metric.tone]}`}>
            <p className="text-sm opacity-90">{metric.label}</p>
            <p className="mt-1 text-sm font-semibold">{metric.value}</p>
            {metric.delta ? <p className="mt-1 text-[11px] opacity-80">{metric.delta}</p> : null}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function DebugTraceView({ block }: { block: DebugTraceBlock }) {
  const reducedMotion = useReducedMotion() ?? false;

  const kindTone: Record<DebugTraceBlock['events'][number]['kind'], string> = {
    render: 'text-blue-700 border-blue-200 bg-blue-50',
    effect: 'text-teal-700 border-teal-200 bg-teal-50',
    network: 'text-violet-700 border-violet-200 bg-violet-50',
    warning: 'text-rose-700 border-rose-200 bg-rose-50',
  };

  return (
    <motion.div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" variants={fadeSlideY(reducedMotion, 8)}>
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
        <p className="font-heading text-base font-semibold text-slate-900">{block.title}</p>
      </div>
      <div className="space-y-2 p-4 font-mono text-xs">
        {block.events.map((event) => (
          <div key={event.id} className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-slate-800">{event.stage}</p>
              <span className={`rounded-md border px-1.5 py-0.5 text-[11px] ${kindTone[event.kind]}`}>
                {event.kind}
              </span>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-600">{event.detail}</p>
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
            const key = richBlockKey(block, i);

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

            if (block.type === 'concept-map') {
              return (
                <motion.div key={key} variants={fadeSlideY(reducedMotion, 8)}>
                  <ConceptMapView block={block} />
                </motion.div>
              );
            }

            if (block.type === 'timeline') {
              return (
                <motion.div key={key} variants={fadeSlideY(reducedMotion, 8)}>
                  <TimelineView block={block} />
                </motion.div>
              );
            }

            if (block.type === 'checklist') {
              return (
                <motion.div key={key} variants={fadeSlideY(reducedMotion, 8)}>
                  <ChecklistView block={block} />
                </motion.div>
              );
            }

            if (block.type === 'callout-stack') {
              return (
                <motion.div key={key} variants={fadeSlideY(reducedMotion, 8)}>
                  <CalloutStackView block={block} />
                </motion.div>
              );
            }

            if (block.type === 'metric-strip') {
              return (
                <motion.div key={key} variants={fadeSlideY(reducedMotion, 8)}>
                  <MetricStripView block={block} />
                </motion.div>
              );
            }

            if (block.type === 'debug-trace') {
              return (
                <motion.div key={key} variants={fadeSlideY(reducedMotion, 8)}>
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
