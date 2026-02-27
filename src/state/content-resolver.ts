import { CONTENT_PACKS, CONTENT_PACK_LABELS, TOPIC_DEFAULT_PACKS, type ContentPackId } from '../data/richReplies';
import type { ContentBlock } from '../types/content-blocks';
import type { SessionKind } from '../types/session-graph';

export interface ResolveRichContentOptions {
  sessionKind: SessionKind;
  message: string;
  topicTitle?: string;
}

export interface IntentMatch {
  packId: ContentPackId;
  score: number;
  reason: string;
}

export interface RichContentResult {
  text: string;
  rich?: ContentBlock[];
  source: 'explicit' | 'intent' | 'none';
}

interface IntentRule {
  packId: ContentPackId;
  keywords: string[];
  reason: string;
  baseScore?: number;
}

const EXPLICIT_PATTERN = /@content:([a-z0-9-]+)/i;

const INTENT_RULES: IntentRule[] = [
  {
    packId: 'effect-dependency-timeline',
    keywords: ['lifecycle', 'effect', 'dependency', 'deps', 'cleanup'],
    reason: 'effect lifecycle intent',
    baseScore: 0,
  },
  {
    packId: 'state-vs-reducer-tradeoff',
    keywords: ['vs', 'versus', 'comparison', 'tradeoff', 'useReducer', 'reducer'],
    reason: 'tradeoff intent',
    baseScore: 0,
  },
  {
    packId: 'stale-closure-debug-trace',
    keywords: ['debug', 'stale', 'closure', 'rerender', 'why rerender', 'trace'],
    reason: 'debugging intent',
    baseScore: 0,
  },
  {
    packId: 'async-fetching-safety-checklist',
    keywords: ['checklist', 'safe', 'steps', 'fetch', 'race', 'abort'],
    reason: 'safety checklist intent',
    baseScore: 0,
  },
  {
    packId: 'context-rerender-metrics',
    keywords: ['metrics', 'measure', 'perf', 'performance', 'optimize', 'context'],
    reason: 'metrics/performance intent',
    baseScore: 0,
  },
  {
    packId: 'hooks-lifecycle-map',
    keywords: ['map', 'mental model', 'overview', 'graph'],
    reason: 'concept map intent',
    baseScore: 0,
  },
  {
    packId: 'performance-playbook',
    keywords: ['playbook', 'optimize', 'latency', 'slow'],
    reason: 'performance playbook intent',
    baseScore: 0,
  },
  {
    packId: 'custom-hook-blueprint',
    keywords: ['custom hook', 'blueprint', 'extract', 'reuse'],
    reason: 'custom hook design intent',
    baseScore: 0,
  },
  {
    packId: 'render-waterfall-diagnosis',
    keywords: ['waterfall', 'cascade', 'duplicate render'],
    reason: 'render waterfall diagnosis intent',
    baseScore: 0,
  },
  {
    packId: 'anti-patterns-callout-wall',
    keywords: ['anti-pattern', 'mistake', 'pitfall', 'bad practice'],
    reason: 'anti-pattern intent',
    baseScore: 0,
  },
  {
    packId: 'architecture-learning-roadmap',
    keywords: ['architecture', 'roadmap', 'plan learning', 'learning path'],
    reason: 'architecture roadmap intent',
    baseScore: 0,
  },
  {
    packId: 'memoization-decision-kit',
    keywords: ['memo', 'memoize', 'useMemo', 'useCallback', 'decision'],
    reason: 'memoization decision intent',
    baseScore: 0,
  },
];

function isContentPackId(value: string): value is ContentPackId {
  return Object.prototype.hasOwnProperty.call(CONTENT_PACKS, value);
}

function labelForPack(packId: ContentPackId): string {
  return CONTENT_PACK_LABELS[packId] ?? packId;
}

function extractExplicitPackId(message: string): string | null {
  const match = EXPLICIT_PATTERN.exec(message);
  return match?.[1] ?? null;
}

export function resolvePackById(id: string): ContentBlock[] | null {
  if (!isContentPackId(id)) {
    return null;
  }
  return CONTENT_PACKS[id];
}

export function matchIntent(message: string): IntentMatch | null {
  const lower = message.toLowerCase();

  let best: IntentMatch | null = null;
  for (const rule of INTENT_RULES) {
    let score = rule.baseScore ?? 0;
    for (const keyword of rule.keywords) {
      if (lower.includes(keyword.toLowerCase())) {
        score += 1;
      }
    }

    if (score <= 0) {
      continue;
    }

    if (!best || score > best.score) {
      best = {
        packId: rule.packId,
        score,
        reason: rule.reason,
      };
    }
  }

  return best;
}

function topicDefaultPack(topicTitle?: string): ContentPackId | null {
  if (!topicTitle) {
    return null;
  }
  const pack = TOPIC_DEFAULT_PACKS[topicTitle]?.[0] ?? null;
  return pack;
}

export function resolveRichContent(options: ResolveRichContentOptions): RichContentResult {
  const explicitId = extractExplicitPackId(options.message);

  if (explicitId) {
    const explicitPack = resolvePackById(explicitId);
    if (!explicitPack) {
      return {
        source: 'explicit',
        text: `I couldn't find content pack "${explicitId}". Try another rich content action.`,
      };
    }

    return {
      source: 'explicit',
      text: `Loaded ${labelForPack(explicitId as ContentPackId)}.`,
      rich: explicitPack,
    };
  }

  const intent = matchIntent(options.message);
  if (intent) {
    return {
      source: 'intent',
      text: `Generated ${labelForPack(intent.packId)} based on your request.`,
      rich: CONTENT_PACKS[intent.packId],
    };
  }

  if (options.sessionKind === 'topic') {
    const topicPack = topicDefaultPack(options.topicTitle);
    if (topicPack && /example|show|visual|content/i.test(options.message)) {
      return {
        source: 'intent',
        text: `Here is ${labelForPack(topicPack)} for ${options.topicTitle}.`,
        rich: CONTENT_PACKS[topicPack],
      };
    }
  }

  return {
    source: 'none',
    text: '',
  };
}
