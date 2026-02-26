export type SessionKind = 'main' | 'ask' | 'explain' | 'topic';

export type SessionStatus = 'active' | 'idle' | 'completed';

export type EdgeKind = 'branch';

export type MessageRole = 'assistant' | 'user' | 'system';

import type { ContentBlock } from './content-blocks';

export type MainSessionPhase = 'planning' | 'learning';

export type SkillNodeStatus = 'locked' | 'available' | 'in-progress' | 'completed';

export interface SkillNode {
  id: string;
  title: string;
  description: string;
  status: SkillNodeStatus;
  /** IDs of skill nodes that must be completed before this one unlocks. Empty = available immediately. */
  dependsOn: string[];
  sessionId: string | null;
  /** display column hint derived from topological sort (0 = first column) */
  col: number;
  estimatedMinutes: number;
}

export interface SessionNode {
  id: string;
  title: string;
  kind: SessionKind;
  status: SessionStatus;
  parentId: string | null;
  depth: number;
  createdAt: number;
  originText?: string;
  skillNodeId?: string;
}

export interface SessionEdge {
  id: string;
  from: string;
  to: string;
  kind: EdgeKind;
  label: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  richContent?: ContentBlock[];
  timestamp: string;
}

export type PlanStepState = 'pending' | 'active' | 'done';

export interface PlanStep {
  id: string;
  title: string;
  details: string;
  state: PlanStepState;
}

export interface LearningPlanReport {
  goal: string;
  currentLevel: string;
  milestones: string[];
  weeklyCadence: string;
  outcomeSignal: string;
}

export interface PlanningState {
  steps: PlanStep[];
  report: LearningPlanReport | null;
}

export interface SessionRecord {
  id: string;
  promptProfile: string;
  contextNote: string;
  messages: ChatMessage[];
  planning: PlanningState | null;
}

export interface MainSessionRecord extends SessionRecord {
  kind: 'main';
  phase: MainSessionPhase;
  skillNodes: SkillNode[];
  planning: PlanningState | null;
}

export interface AskSessionRecord extends SessionRecord {
  kind: 'ask';
  planning: null;
}

export interface ExplainSessionRecord extends SessionRecord {
  kind: 'explain';
  planning: null;
}

export interface TopicSessionRecord extends SessionRecord {
  kind: 'topic';
  planning: null;
}

export type AnySessionRecord =
  | MainSessionRecord
  | AskSessionRecord
  | ExplainSessionRecord
  | TopicSessionRecord;
