import { describe, expect, it } from 'vitest';
import type { SessionNode } from '../../types/session-graph';
import {
  dedupeSuggestions,
  generateNodeSuggestions,
  suggestReprioritize,
  suggestRetitle,
} from '../skill-tree-agent';

const baseNodes: SessionNode[] = [
  {
    id: 'parent',
    title: 'Parent',
    kind: 'topic',
    status: 'active',
    parentId: 'session-main',
    depth: 1,
    createdAt: 1,
    skillNodeId: 'skill-useEffect',
  },
];

describe('skill-tree-agent', () => {
  it('yields create suggestion for debug intent', () => {
    const suggestions = generateNodeSuggestions({
      parentSessionId: 'parent',
      parentTitle: 'useEffect',
      skillNodeId: 'skill-useEffect',
      userMessage: 'please debug this stale closure rerender issue',
      assistantMessage: 'Let us trace it',
      siblingNodes: baseNodes,
      now: 10,
    });

    expect(suggestions.some((s) => s.action === 'create' && s.intent === 'debug')).toBe(true);
  });

  it('yields create suggestion for compare intent', () => {
    const suggestions = generateNodeSuggestions({
      parentSessionId: 'parent',
      parentTitle: 'useState',
      skillNodeId: 'skill-useState',
      userMessage: 'can you compare this vs reducer tradeoff',
      assistantMessage: 'yes',
      siblingNodes: baseNodes,
      now: 20,
    });

    expect(suggestions.some((s) => s.action === 'create' && s.intent === 'compare')).toBe(true);
  });

  it('dedupes repeated suggestions', () => {
    const incoming = generateNodeSuggestions({
      parentSessionId: 'parent',
      parentTitle: 'useEffect',
      skillNodeId: 'skill-useEffect',
      userMessage: 'debug this',
      assistantMessage: 'debug trace',
      siblingNodes: baseNodes,
      now: 30,
    });
    const merged = dedupeSuggestions(incoming, incoming);
    expect(merged).toHaveLength(incoming.length);
  });

  it('emits retitle for noisy ask/explain title', () => {
    const result = suggestRetitle(
      [
        ...baseNodes,
        {
          id: 'branch-1',
          title: 'Ask • this is a very long branch title that should be shortened',
          kind: 'branch',
          intent: 'ask',
          status: 'idle',
          parentId: 'parent',
          depth: 2,
          createdAt: 3,
        },
      ],
      { parentSessionId: 'parent', skillNodeId: 'skill-useEffect', now: 40 },
    );
    expect(result).toHaveLength(1);
    expect(result[0].action).toBe('retitle');
  });

  it('emits reprioritize when sibling branch count is high', () => {
    const siblings: SessionNode[] = [
      ...baseNodes,
      {
        id: 'b1',
        title: 'one',
        kind: 'branch',
        intent: 'ask',
        status: 'idle',
        parentId: 'parent',
        depth: 2,
        createdAt: 10,
        rank: 0,
      },
      {
        id: 'b2',
        title: 'two',
        kind: 'branch',
        intent: 'practice',
        status: 'idle',
        parentId: 'parent',
        depth: 2,
        createdAt: 11,
        rank: 1,
      },
      {
        id: 'b3',
        title: 'three',
        kind: 'branch',
        intent: 'compare',
        status: 'idle',
        parentId: 'parent',
        depth: 2,
        createdAt: 12,
        rank: 4,
      },
      {
        id: 'b4',
        title: 'four',
        kind: 'branch',
        intent: 'explain',
        status: 'idle',
        parentId: 'parent',
        depth: 2,
        createdAt: 13,
        rank: 3,
      },
    ];
    const result = suggestReprioritize(
      siblings,
      { parentSessionId: 'parent', skillNodeId: 'skill-useEffect', now: 50 },
    );
    expect(result).toHaveLength(1);
    expect(result[0].action).toBe('reprioritize');
  });

  it('enforces max 3 suggestions per turn', () => {
    const suggestions = generateNodeSuggestions({
      parentSessionId: 'parent',
      parentTitle: 'Hooks',
      skillNodeId: 'skill-useEffect',
      userMessage: 'debug compare practice plan recap ask explain',
      assistantMessage: 'debug compare practice plan recap',
      siblingNodes: baseNodes,
      now: 60,
    });
    expect(suggestions.length).toBeLessThanOrEqual(3);
  });
});
