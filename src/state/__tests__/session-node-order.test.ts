import { describe, expect, it } from 'vitest';
import type { SessionNode } from '../../types/session-graph';
import { sortBranchNodesForLayout } from '../session-node-order';

describe('session-node-order', () => {
  it('sorts by depth then rank then createdAt', () => {
    const nodes: SessionNode[] = [
      {
        id: 'n3',
        title: 'N3',
        kind: 'branch',
        intent: 'ask',
        status: 'idle',
        parentId: 'p',
        depth: 2,
        createdAt: 30,
        rank: 2,
      },
      {
        id: 'n1',
        title: 'N1',
        kind: 'branch',
        intent: 'ask',
        status: 'idle',
        parentId: 'p',
        depth: 1,
        createdAt: 20,
        rank: 1,
      },
      {
        id: 'n2',
        title: 'N2',
        kind: 'branch',
        intent: 'ask',
        status: 'idle',
        parentId: 'p',
        depth: 1,
        createdAt: 10,
        rank: 0,
      },
    ];

    expect(sortBranchNodesForLayout(nodes).map((n) => n.id)).toEqual(['n2', 'n1', 'n3']);
  });

  it('falls back deterministically when rank is missing', () => {
    const nodes: SessionNode[] = [
      {
        id: 'b',
        title: 'B',
        kind: 'branch',
        intent: 'ask',
        status: 'idle',
        parentId: 'p',
        depth: 1,
        createdAt: 20,
      },
      {
        id: 'a',
        title: 'A',
        kind: 'branch',
        intent: 'ask',
        status: 'idle',
        parentId: 'p',
        depth: 1,
        createdAt: 10,
      },
    ];

    expect(sortBranchNodesForLayout(nodes).map((n) => n.id)).toEqual(['a', 'b']);
  });
});
