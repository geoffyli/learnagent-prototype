import { describe, expect, it } from 'vitest';
import { applyActiveSession } from '../session-status';

describe('applyActiveSession', () => {
  const nodes = [
    {
      id: 'main',
      title: 'Main',
      kind: 'main' as const,
      status: 'active' as const,
      parentId: null,
      depth: 0,
      createdAt: 0,
    },
    {
      id: 'topic',
      title: 'Topic',
      kind: 'topic' as const,
      status: 'idle' as const,
      parentId: 'main',
      depth: 1,
      createdAt: 1,
    },
    {
      id: 'done',
      title: 'Done',
      kind: 'branch' as const,
      intent: 'ask' as const,
      status: 'completed' as const,
      parentId: 'topic',
      depth: 2,
      createdAt: 2,
    },
  ];

  it('sets exactly one active node for target session', () => {
    const result = applyActiveSession(nodes, 'topic');
    expect(result.filter((node) => node.status === 'active')).toHaveLength(1);
    expect(result.find((node) => node.id === 'topic')?.status).toBe('active');
  });

  it('moves previous active nodes to idle', () => {
    const result = applyActiveSession(nodes, 'topic');
    expect(result.find((node) => node.id === 'main')?.status).toBe('idle');
  });

  it('preserves completed nodes', () => {
    const result = applyActiveSession(nodes, 'topic');
    expect(result.find((node) => node.id === 'done')?.status).toBe('completed');
  });
});
