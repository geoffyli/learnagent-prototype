import type { SessionNode } from '../types/session-graph';

export function applyActiveSession(
  nodes: readonly SessionNode[],
  activeSessionId: string,
): SessionNode[] {
  return nodes.map((node) => {
    if (node.status === 'completed') {
      return node;
    }

    if (node.id === activeSessionId) {
      return { ...node, status: 'active' as const };
    }

    return { ...node, status: 'idle' as const };
  });
}
