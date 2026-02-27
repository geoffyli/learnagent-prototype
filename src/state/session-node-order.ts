import type { SessionNode } from '../types/session-graph';

export function sortBranchNodesForLayout(nodes: readonly SessionNode[]): SessionNode[] {
  return [...nodes].sort((a, b) => {
    if (a.depth !== b.depth) {
      return a.depth - b.depth;
    }

    const aRank = a.rank ?? Number.MAX_SAFE_INTEGER;
    const bRank = b.rank ?? Number.MAX_SAFE_INTEGER;
    if (aRank !== bRank) {
      return aRank - bRank;
    }

    if (a.createdAt !== b.createdAt) {
      return a.createdAt - b.createdAt;
    }

    return a.id.localeCompare(b.id);
  });
}
