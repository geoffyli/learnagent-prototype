export type SessionKind = 'main' | 'topic' | 'branch';
export type BranchIntent = 'ask' | 'explain' | 'debug' | 'compare' | 'practice' | 'plan' | 'recap';
export type BranchSource = 'manual-selection' | 'agent-suggestion' | 'quick-action';
export type SuggestionAction = 'create' | 'retitle' | 'reprioritize';

export type SessionStatus = 'active' | 'idle' | 'completed';

export type EdgeKind = 'branch';

export type MessageRole = 'assistant' | 'user' | 'system';

import type { ContentBlock } from './content-blocks';

export type MainSessionPhase = 'setup' | 'planning' | 'learning';

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
  intent?: BranchIntent;
  source?: BranchSource;
  status: SessionStatus;
  parentId: string | null;
  depth: number;
  createdAt: number;
  rank?: number;
  originText?: string;
  skillNodeId?: string;
}

interface AgentNodeSuggestionBase {
  id: string;
  parentSessionId: string;
  skillNodeId?: string;
  action: SuggestionAction;
  intent?: BranchIntent;
  rationale: string;
  createdAt: number;
}

export interface CreateNodeSuggestion extends AgentNodeSuggestionBase {
  action: 'create';
  title: string;
  originText?: string;
  promptProfile: string;
  contextNote: string;
  seedIntro: string;
}

export interface RetitleNodeSuggestion extends AgentNodeSuggestionBase {
  action: 'retitle';
  targetSessionId: string;
  nextTitle: string;
}

export interface ReprioritizeNodeSuggestion extends AgentNodeSuggestionBase {
  action: 'reprioritize';
  targetSessionId: string;
  nextRank: number;
}

export type AgentNodeSuggestion =
  | CreateNodeSuggestion
  | RetitleNodeSuggestion
  | ReprioritizeNodeSuggestion;

/* ---------- Global Agent Inbox ---------- */

export type GlobalInboxAction =
  | 'start-skill'
  | 'practice'
  | 'review'
  | 'explore-topic'
  | 'branch'
  | 'set-goal'
  | 'export-progress';

export interface GlobalInboxItem {
  id: string;
  action: GlobalInboxAction;
  title: string;
  description: string;
  icon: string;
  priority: number;
  createdAt: number;
  skillNodeId?: string;
  sessionId?: string;
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

export interface TopicSessionRecord extends SessionRecord {
  kind: 'topic';
  planning: null;
}

export interface BranchSessionRecord extends SessionRecord {
  kind: 'branch';
  intent: BranchIntent;
  source: BranchSource;
  planning: null;
}

export type AnySessionRecord =
  | MainSessionRecord
  | TopicSessionRecord
  | BranchSessionRecord;
