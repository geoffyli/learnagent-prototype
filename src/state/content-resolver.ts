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
  /* SAT intent rules */
  {
    packId: 'sat-vocab-flashcards',
    keywords: ['vocabulary', 'vocab', 'word meaning', 'definition', 'context clues', 'word choice'],
    reason: 'SAT vocabulary intent',
    baseScore: 0,
  },
  {
    packId: 'sat-reading-vs-writing',
    keywords: ['reading vs writing', 'reading strategy', 'writing strategy', 'passage strategy', 'section comparison'],
    reason: 'SAT section strategy comparison intent',
    baseScore: 0,
  },
  {
    packId: 'sat-common-traps',
    keywords: ['trap', 'common mistake', 'wrong answer', 'trick', 'pitfall', 'sat mistake', 'sat trap'],
    reason: 'SAT common traps intent',
    baseScore: 0,
  },
  {
    packId: 'sat-error-analysis-trace',
    keywords: ['error analysis', 'wrong answer analysis', 'mistake pattern', 'error pattern', 'practice review'],
    reason: 'SAT error analysis intent',
    baseScore: 0,
  },
  {
    packId: 'sat-study-plan-timeline',
    keywords: ['study plan', 'prep plan', 'sat schedule', 'week plan', 'sprint plan'],
    reason: 'SAT study plan intent',
    baseScore: 0,
  },
  {
    packId: 'sat-test-day-checklist',
    keywords: ['test day', 'test prep', 'what to bring', 'day of test', 'test day checklist'],
    reason: 'SAT test day checklist intent',
    baseScore: 0,
  },
  {
    packId: 'sat-score-progress-metrics',
    keywords: ['section score', 'score progress', 'improvement', 'target score', 'composite score'],
    reason: 'SAT score progress intent',
    baseScore: 0,
  },
  {
    packId: 'sat-skill-dependency-map',
    keywords: ['sat skill map', 'sat dependency', 'sat overview', 'sat learning path', 'sat graph'],
    reason: 'SAT skill dependency map intent',
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
