import type { AgentNodeSuggestion, BranchIntent, SessionNode } from '../types/session-graph';

interface GenerateNodeSuggestionsInput {
  parentSessionId: string;
  parentTitle: string;
  skillNodeId?: string;
  userMessage: string;
  assistantMessage: string;
  siblingNodes: readonly SessionNode[];
  now: number;
}

interface SuggestContext {
  parentSessionId: string;
  skillNodeId?: string;
  now: number;
}

const MAX_NEW_SUGGESTIONS = 3;

const INTENT_RULES: Array<{ intent: BranchIntent; keywords: string[] }> = [
  { intent: 'debug', keywords: ['debug', 'trace', 'rerender', 'stale', 'bug'] },
  { intent: 'compare', keywords: ['compare', 'vs', 'versus', 'tradeoff', 'difference'] },
  { intent: 'practice', keywords: ['exercise', 'quiz', 'practice', 'challenge'] },
  { intent: 'plan', keywords: ['plan', 'roadmap', 'steps', 'next'] },
  { intent: 'recap', keywords: ['recap', 'summary', 'summarize', 'review'] },
  { intent: 'ask', keywords: ['question', 'ask', 'clarify'] },
  { intent: 'explain', keywords: ['explain', 'mental model', 'analogy'] },
];

const INTENT_PRIORITY: Record<BranchIntent, number> = {
  debug: 0,
  compare: 1,
  practice: 2,
  plan: 3,
  recap: 4,
  ask: 5,
  explain: 6,
};

function titleForIntent(intent: BranchIntent, sourceText: string): string {
  const snippet = sourceText.replace(/\s+/g, ' ').trim().slice(0, 44);
  const prefix = intent.charAt(0).toUpperCase() + intent.slice(1);
  if (!snippet) {
    return `${prefix} Branch`;
  }
  return `${prefix} • ${snippet}`;
}

function promptProfileForIntent(intent: BranchIntent): string {
  if (intent === 'ask') return 'ask-concept-subagent';
  if (intent === 'explain') return 'explain-concept-subagent';
  if (intent === 'debug') return 'debug-subagent';
  if (intent === 'compare') return 'compare-subagent';
  if (intent === 'practice') return 'practice-subagent';
  if (intent === 'plan') return 'planning-subagent';
  return 'general-subagent';
}

function seedIntroForIntent(intent: BranchIntent): string {
  if (intent === 'debug') return 'I can trace this step-by-step and isolate likely root causes.';
  if (intent === 'compare') return 'I will compare the options with tradeoffs and clear decision points.';
  if (intent === 'practice') return 'I will turn this into practice prompts and quick checks.';
  if (intent === 'plan') return 'I will break this into an actionable plan with ordered steps.';
  if (intent === 'recap') return 'I will recap the key points in a concise review.';
  if (intent === 'ask') return 'Ask your follow-up and I will drill into the exact gap.';
  return 'I will explain this concept with a concise mental model and examples.';
}

function normalizeTitle(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function suggestionIdentityKey(suggestion: AgentNodeSuggestion): string {
  if (suggestion.action === 'create') {
    return `${suggestion.parentSessionId}|create|${suggestion.intent ?? 'none'}|${normalizeTitle(suggestion.title)}`;
  }
  if (suggestion.action === 'retitle') {
    return `${suggestion.parentSessionId}|retitle|${suggestion.targetSessionId}|${normalizeTitle(suggestion.nextTitle)}`;
  }
  return `${suggestion.parentSessionId}|reprioritize|${suggestion.targetSessionId}|${suggestion.nextRank}`;
}

function stableSuggestionId(prefix: string, key: string): string {
  return `${prefix}-${key.replace(/[^a-z0-9|]/gi, '-').slice(0, 48)}`;
}

function detectIntents(text: string): BranchIntent[] {
  const lower = text.toLowerCase();
  const detected: BranchIntent[] = [];
  for (const rule of INTENT_RULES) {
    if (rule.keywords.some((keyword) => lower.includes(keyword))) {
      detected.push(rule.intent);
    }
  }
  return detected;
}

export function dedupeSuggestions(
  existing: readonly AgentNodeSuggestion[],
  incoming: readonly AgentNodeSuggestion[],
): AgentNodeSuggestion[] {
  const seen = new Set(existing.map((item) => suggestionIdentityKey(item)));
  const merged: AgentNodeSuggestion[] = [...existing];
  for (const suggestion of incoming) {
    const key = suggestionIdentityKey(suggestion);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    merged.push(suggestion);
  }
  return merged;
}

export function suggestRetitle(
  nodes: readonly SessionNode[],
  context: SuggestContext,
): AgentNodeSuggestion[] {
  const target = nodes.find(
    (node) =>
      node.parentId === context.parentSessionId &&
      node.kind === 'branch' &&
      /^(ask|explain)\s*•/i.test(node.title) &&
      node.title.length > 36,
  );

  if (!target) {
    return [];
  }

  const intentLabel = (target.intent ?? 'branch').toUpperCase();
  const compact = target.title.split('•')[1]?.trim().slice(0, 24) ?? target.title.slice(0, 24);
  const nextTitle = `${intentLabel} • ${compact}`;

  const key = `${context.parentSessionId}|${target.id}|${nextTitle}`;
  return [
    {
      id: stableSuggestionId('sg-retitle', key),
      parentSessionId: context.parentSessionId,
      skillNodeId: context.skillNodeId,
      action: 'retitle',
      rationale: 'Shorter branch title improves scanability in the tree.',
      createdAt: context.now,
      targetSessionId: target.id,
      nextTitle,
    },
  ];
}

export function suggestReprioritize(
  nodes: readonly SessionNode[],
  context: SuggestContext,
): AgentNodeSuggestion[] {
  const siblings = nodes
    .filter((node) => node.parentId === context.parentSessionId && node.kind === 'branch')
    .sort((a, b) => (a.rank ?? Number.MAX_SAFE_INTEGER) - (b.rank ?? Number.MAX_SAFE_INTEGER));

  if (siblings.length < 4) {
    return [];
  }

  const target = siblings.find(
    (node) => (node.intent === 'debug' || node.intent === 'compare') && (node.rank ?? 99) > 0,
  );
  if (!target) {
    return [];
  }

  const key = `${context.parentSessionId}|${target.id}|0`;
  return [
    {
      id: stableSuggestionId('sg-reprio', key),
      parentSessionId: context.parentSessionId,
      skillNodeId: context.skillNodeId,
      action: 'reprioritize',
      rationale: 'Promote high-signal debug/compare branch closer to the top of sibling nodes.',
      createdAt: context.now,
      targetSessionId: target.id,
      nextRank: 0,
    },
  ];
}

export function generateNodeSuggestions(input: GenerateNodeSuggestionsInput): AgentNodeSuggestion[] {
  const sourceText = `${input.userMessage} ${input.assistantMessage}`.trim();
  const intents = detectIntents(sourceText).sort((a, b) => INTENT_PRIORITY[a] - INTENT_PRIORITY[b]);
  const createSuggestions: AgentNodeSuggestion[] = [];

  for (const intent of intents) {
    if (createSuggestions.length >= MAX_NEW_SUGGESTIONS) {
      break;
    }
    const title = titleForIntent(intent, input.userMessage || input.parentTitle);
    const key = `${input.parentSessionId}|${intent}|${title}`;
    createSuggestions.push({
      id: stableSuggestionId('sg-create', key),
      parentSessionId: input.parentSessionId,
      skillNodeId: input.skillNodeId,
      action: 'create',
      intent,
      rationale: `Detected ${intent} intent in the latest exchange.`,
      createdAt: input.now,
      title,
      promptProfile: promptProfileForIntent(intent),
      contextNote: `Agent suggested a ${intent} branch from the latest turn in ${input.parentTitle}.`,
      seedIntro: seedIntroForIntent(intent),
    });
  }

  const context: SuggestContext = {
    parentSessionId: input.parentSessionId,
    skillNodeId: input.skillNodeId,
    now: input.now,
  };

  const retitleSuggestions = suggestRetitle(input.siblingNodes, context);
  const reprioritizeSuggestions = suggestReprioritize(input.siblingNodes, context);

  return [...createSuggestions, ...retitleSuggestions, ...reprioritizeSuggestions].slice(0, MAX_NEW_SUGGESTIONS);
}
