import type { SkillNode } from '../types/session-graph';

export type SkillNodeSeed = Omit<SkillNode, 'sessionId'>;

export function initializeSkillNodes(defs: readonly SkillNodeSeed[]): SkillNode[] {
  return defs.map((node) => ({
    ...node,
    status: node.dependsOn.length === 0 ? 'available' : 'locked',
    sessionId: null,
  }));
}

export function getSkillById(nodes: readonly SkillNode[], id: string): SkillNode | undefined {
  return nodes.find((node) => node.id === id);
}

export function setSkillInProgress(nodes: readonly SkillNode[], skillId: string): SkillNode[] {
  const target = getSkillById(nodes, skillId);
  if (!target || target.status === 'locked' || target.status === 'completed' || target.status === 'in-progress') {
    return [...nodes];
  }

  return nodes.map((node) =>
    node.id === skillId ? { ...node, status: 'in-progress' as const } : node,
  );
}

export function completeSkillAndUnlock(nodes: readonly SkillNode[], skillId: string): SkillNode[] {
  const target = getSkillById(nodes, skillId);
  if (!target) {
    return [...nodes];
  }

  if (target.status === 'completed') {
    return [...nodes];
  }

  if (target.status !== 'in-progress') {
    return [...nodes];
  }

  const withCompleted = nodes.map((node) =>
    node.id === skillId ? { ...node, status: 'completed' as const } : node,
  );

  const completedIds = new Set(
    withCompleted
      .filter((node) => node.status === 'completed')
      .map((node) => node.id),
  );

  return withCompleted.map((node) => {
    if (node.status !== 'locked') {
      return node;
    }

    const unlocked = node.dependsOn.every((dependency) => completedIds.has(dependency));
    if (!unlocked) {
      return node;
    }

    return { ...node, status: 'available' as const };
  });
}
