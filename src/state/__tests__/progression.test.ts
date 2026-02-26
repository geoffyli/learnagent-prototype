import { describe, expect, it } from 'vitest';
import {
  completeSkillAndUnlock,
  initializeSkillNodes,
  setSkillInProgress,
  type SkillNodeSeed,
} from '../progression';

const seedNodes: SkillNodeSeed[] = [
  {
    id: 'a',
    title: 'A',
    description: 'A',
    status: 'available',
    dependsOn: [],
    col: 0,
    estimatedMinutes: 10,
  },
  {
    id: 'b',
    title: 'B',
    description: 'B',
    status: 'locked',
    dependsOn: ['a'],
    col: 1,
    estimatedMinutes: 10,
  },
  {
    id: 'c',
    title: 'C',
    description: 'C',
    status: 'locked',
    dependsOn: ['a', 'b'],
    col: 2,
    estimatedMinutes: 10,
  },
];

describe('progression', () => {
  it('initializes dependency-aware statuses', () => {
    const nodes = initializeSkillNodes(seedNodes);
    expect(nodes[0]?.status).toBe('available');
    expect(nodes[1]?.status).toBe('locked');
    expect(nodes[2]?.status).toBe('locked');
    expect(nodes.every((node) => node.sessionId === null)).toBe(true);
  });

  it('completes in-progress skill and unlocks direct dependent', () => {
    const initialized = initializeSkillNodes(seedNodes);
    const inProgress = setSkillInProgress(initialized, 'a');
    const completed = completeSkillAndUnlock(inProgress, 'a');

    expect(completed.find((n) => n.id === 'a')?.status).toBe('completed');
    expect(completed.find((n) => n.id === 'b')?.status).toBe('available');
  });

  it('does not unlock node with incomplete prerequisites', () => {
    const initialized = initializeSkillNodes(seedNodes);
    const inProgress = setSkillInProgress(initialized, 'a');
    const completed = completeSkillAndUnlock(inProgress, 'a');

    expect(completed.find((n) => n.id === 'c')?.status).toBe('locked');
  });

  it('is idempotent for already completed skill', () => {
    const initialized = initializeSkillNodes(seedNodes);
    const inProgress = setSkillInProgress(initialized, 'a');
    const completed = completeSkillAndUnlock(inProgress, 'a');
    const repeated = completeSkillAndUnlock(completed, 'a');

    expect(repeated).toEqual(completed);
  });
});
