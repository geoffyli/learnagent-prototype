import type { SkillNode } from './session-graph';

export type IntakeFieldType = 'file' | 'url' | 'text';

export interface IntakeField {
  id: string;
  label: string;
  description: string;
  type: IntakeFieldType;
  required: boolean;
  accept?: string;
  placeholder?: string;
  sampleValue?: string;
}

export interface CoursePackageConfig {
  id: string;
  title: string;
  subtitle: string;
  defaultSessionTitle: string;
  discoverable?: boolean;
  intakeTitle: string;
  intakeDescription: string;
  creatorPrompt: string;
  intakeFields: IntakeField[];
  skillNodes: Omit<SkillNode, 'sessionId'>[];
  skillPacks: CreatorSkillPack[];
  commands: CreatorCommand[];
  runtimePolicy: RuntimePolicy;
  suggestedActions?: SuggestedAction[];
  planningHints?: {
    purposeActions?: Array<{ label: string; prompt: string }>;
    targetActions?: Array<{ label: string; prompt: string }>;
  };
  source?: 'seed' | 'creator';
}

export interface SuggestedAction {
  label: string;
  prompt: string;
}

export interface CreatorSkillPack {
  id: string;
  name: string;
  intent: string;
  instructions: string;
  exampleInput?: string;
  exampleOutput?: string;
}

export interface CreatorCommand {
  id: string;
  name: string;
  trigger: string;
  description: string;
  skillPackId: string;
  defaultPrompt: string;
  outputHint?: string;
  defaultContentPackId?: string;
  inputFields?: CommandInputField[];
}

export interface CommandInputField {
  id: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: 'text' | 'url';
}

export interface RuntimePolicy {
  systemPrompt: string;
  guardrails: string;
}
