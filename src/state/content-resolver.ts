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
    keywords: ['timeline', 'interview flow', 'interview timeline', 'step by step'],
    reason: 'interview timeline intent',
    baseScore: 0,
  },
  {
    packId: 'state-vs-reducer-tradeoff',
    keywords: ['vs', 'versus', 'comparison', 'tradeoff', 'sql vs', 'dashboard vs'],
    reason: 'prioritization tradeoff intent',
    baseScore: 0,
  },
  {
    packId: 'stale-closure-debug-trace',
    keywords: ['debug', 'query issue', 'sql bug', 'trace', 'wrong result', 'stale', 'closure', 'rerender'],
    reason: 'query debugging intent',
    baseScore: 0,
  },
  {
    packId: 'async-fetching-safety-checklist',
    keywords: ['resume', 'cv', 'checklist', 'tailor', 'resume checklist'],
    reason: 'resume checklist intent',
    baseScore: 0,
  },
  {
    packId: 'context-rerender-metrics',
    keywords: ['mastery', 'score', 'metrics', 'progress', 'weak area'],
    reason: 'mastery metrics intent',
    baseScore: 0,
  },
  {
    packId: 'hooks-lifecycle-map',
    keywords: ['map', 'skill graph', 'overview', 'dependencies', 'learning graph'],
    reason: 'skill graph intent',
    baseScore: 0,
  },
  {
    packId: 'performance-playbook',
    keywords: ['dashboard performance', 'playbook', 'slow dashboard', 'latency'],
    reason: 'dashboard performance intent',
    baseScore: 0,
  },
  {
    packId: 'custom-hook-blueprint',
    keywords: ['blueprint', 'case answer', 'structure answer', 'answer framework'],
    reason: 'case answer blueprint intent',
    baseScore: 0,
  },
  {
    packId: 'render-waterfall-diagnosis',
    keywords: ['funnel', 'drop off', 'waterfall', 'diagnosis'],
    reason: 'funnel diagnosis intent',
    baseScore: 0,
  },
  {
    packId: 'anti-patterns-callout-wall',
    keywords: ['anti-pattern', 'mistake', 'pitfall', 'bad practice', 'interview mistake'],
    reason: 'interview anti-pattern intent',
    baseScore: 0,
  },
  {
    packId: 'architecture-learning-roadmap',
    keywords: ['roadmap', 'learning path', '8 week plan', 'job sprint'],
    reason: 'job sprint roadmap intent',
    baseScore: 0,
  },
  {
    packId: 'memoization-decision-kit',
    keywords: ['strategy', 'question strategy', 'decision kit', 'answer strategy'],
    reason: 'interview strategy intent',
    baseScore: 0,
  },
  /* SAT intent rules — Digital SAT 2024+ (baseScore:1 so SAT rules win keyword ties over Data Analyst rules) */
  {
    packId: 'sat-vocab-flashcards',
    keywords: ['flashcard', 'strategy card', 'tutor trick', 'purpose vs topic', 'grammar trap', 'desmos', 'calculator strategy'],
    reason: 'SAT strategy cards intent',
    baseScore: 1,
  },
  {
    packId: 'sat-reading-vs-writing',
    keywords: ['reading', 'writing', 'r&w', 'domain breakdown', 'conventions', 'craft and structure', 'where am i losing', 'point gap', 'diagnosis'],
    reason: 'SAT R&W domain diagnosis intent',
    baseScore: 1,
  },
  {
    packId: 'sat-common-traps',
    keywords: ['common trap', 'common mistake', 'wrong answer', 'trick', 'pitfall', 'sat mistake', 'sat trap', 'module 1', 'rushing'],
    reason: 'SAT reasoning traps intent',
    baseScore: 1,
  },
  {
    packId: 'sat-error-analysis-trace',
    keywords: ['error analysis', 'wrong answer analysis', 'mistake pattern', 'error pattern', 'reasoning trace', 'reasoning error', 'why did i miss', 'practice review', 'diagnose'],
    reason: 'SAT reasoning error diagnosis intent',
    baseScore: 1,
  },
  {
    packId: 'sat-study-plan-timeline',
    keywords: ['study plan', 'prep plan', 'schedule', 'week plan', '8 week', 'timeline', 'personalized plan', 'my plan'],
    reason: 'SAT personalized study plan intent',
    baseScore: 1,
  },
  {
    packId: 'sat-test-day-checklist',
    keywords: ['test day', 'test prep', 'what to bring', 'day of test', 'checklist', 'bluebook', 'device'],
    reason: 'Digital SAT test day checklist intent',
    baseScore: 1,
  },
  {
    packId: 'sat-score-progress-metrics',
    keywords: ['score', 'progress', 'improvement', 'target', 'domain accuracy', 'where am i', 'opportunity', 'diagnosis dashboard'],
    reason: 'SAT score diagnosis intent',
    baseScore: 1,
  },
  {
    packId: 'sat-skill-dependency-map',
    keywords: ['adaptive', 'module 1', 'module 2', 'sat structure', 'digital sat', 'how sat works', 'skill map', 'dependency'],
    reason: 'Digital SAT adaptive structure intent',
    baseScore: 1,
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
    const base = rule.baseScore ?? 0;
    let keywordHits = 0;
    for (const keyword of rule.keywords) {
      if (lower.includes(keyword.toLowerCase())) {
        keywordHits += 1;
      }
    }

    if (keywordHits === 0) {
      continue;
    }

    const score = base + keywordHits;
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
    if (topicPack && /example|show|visual|content|practice|drill/i.test(options.message)) {
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
