import { ChangeEvent, useMemo, useState } from 'react';
import { ArrowLeft, Plus, Sparkles, Trash2 } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { MOTION_DURATION, springFor } from '../motion/tokens';
import { fadeSlideY, staggerContainer } from '../motion/variants';
import type {
  CoursePackageConfig,
  CreatorCommand,
  CreatorSkillPack,
  IntakeField,
} from '../types/course-package';

interface CreatorBuilderPageProps {
  onBack: () => void;
  onPublish: (coursePackage: Omit<CoursePackageConfig, 'id'>) => void;
}

interface OrchestrationStepDraft {
  id: string;
  title: string;
  description: string;
}

function makeIntakeField(index: number): IntakeField {
  return {
    id: `field-${index}`,
    label: `Input ${index}`,
    description: 'Describe why the learner should provide this input.',
    type: 'text',
    required: true,
    placeholder: 'Enter value',
  };
}

function makeSkillPack(index: number): CreatorSkillPack {
  return {
    id: `skillpack-${index}`,
    name: `Skill Pack ${index}`,
    intent: 'Teaching objective',
    instructions: 'Write specific instructions this skill should follow.',
    exampleInput: '',
    exampleOutput: '',
  };
}

function makeCommand(index: number, skillPackId: string): CreatorCommand {
  return {
    id: `command-${index}`,
    name: `Command ${index}`,
    trigger: `/command-${index}`,
    description: 'Describe what this command does for learners.',
    skillPackId,
    defaultPrompt: 'Write the default command prompt.',
    outputHint: 'Expected output format.',
    inputFields: [
      {
        id: `arg-${index}-1`,
        label: 'Command input',
        placeholder: 'What should this command focus on?',
        required: true,
        type: 'text',
      },
    ],
  };
}

function makeOrchestrationStep(index: number): OrchestrationStepDraft {
  return {
    id: `step-${index}`,
    title: `Orchestration Step ${index}`,
    description: 'Define the purpose of this learning step.',
  };
}

export default function CreatorBuilderPage({ onBack, onPublish }: CreatorBuilderPageProps) {
  const reducedMotion = useReducedMotion() ?? false;

  const [sourceMaterialName, setSourceMaterialName] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [intakeTitle, setIntakeTitle] = useState('Prepare your personalized learning session');
  const [intakeDescription, setIntakeDescription] = useState('Provide required materials so this package can tailor your path.');
  const [creatorPrompt, setCreatorPrompt] = useState('Upload the requested materials before planning.');
  const [systemPrompt, setSystemPrompt] = useState('You are a specialist tutor that follows creator-defined skills and commands.');
  const [guardrails, setGuardrails] = useState('Do not fabricate facts. Ask clarifying questions when inputs are missing.');

  const [intakeFields, setIntakeFields] = useState<IntakeField[]>([makeIntakeField(1)]);
  const [skillPacks, setSkillPacks] = useState<CreatorSkillPack[]>([makeSkillPack(1)]);
  const [commands, setCommands] = useState<CreatorCommand[]>([makeCommand(1, 'skillpack-1')]);
  const [orchestrationSteps, setOrchestrationSteps] = useState<OrchestrationStepDraft[]>([
    makeOrchestrationStep(1),
    makeOrchestrationStep(2),
  ]);
  const [validationNotice, setValidationNotice] = useState<string | null>(null);

  const normalizedCommandTriggers = commands.map((command) => command.trigger.trim().toLowerCase()).filter(Boolean);
  const hasDuplicateCommandTrigger = new Set(normalizedCommandTriggers).size !== normalizedCommandTriggers.length;
  const invalidCommandBinding = commands.some((command) => !skillPacks.some((skill) => skill.id === command.skillPackId));
  const invalidCommandPrefix = commands.some((command) => !command.trigger.trim().startsWith('/'));

  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    if (!title.trim()) errors.push('Package title is required.');
    if (intakeFields.length === 0) errors.push('At least one intake field is required.');
    if (skillPacks.length === 0) errors.push('At least one skill pack is required.');
    if (commands.length === 0) errors.push('At least one command is required.');
    if (orchestrationSteps.length === 0) errors.push('At least one orchestration step is required.');
    if (hasDuplicateCommandTrigger) errors.push('Command triggers must be unique.');
    if (invalidCommandPrefix) errors.push('Each command trigger must start with /.');
    if (invalidCommandBinding) errors.push('Every command must be bound to an existing skill pack.');
    return errors;
  }, [
    commands.length,
    hasDuplicateCommandTrigger,
    invalidCommandPrefix,
    intakeFields.length,
    invalidCommandBinding,
    orchestrationSteps.length,
    skillPacks.length,
    title,
  ]);

  const canPublish = useMemo(() => {
    return validationErrors.length === 0;
  }, [validationErrors]);

  const handleSourceUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSourceMaterialName(file.name);
    event.target.value = '';
  };

  const publish = () => {
    if (!canPublish) return;
    setValidationNotice(null);

    const normalizedSkillNodes = orchestrationSteps.map((step, index) => ({
      id: `skill-${index + 1}`,
      title: step.title,
      description: step.description,
      status: index === 0 ? ('available' as const) : ('locked' as const),
      dependsOn: index === 0 ? [] : [`skill-${index}`],
      col: index,
      estimatedMinutes: 35,
    }));

    onPublish({
      title: title.trim(),
      subtitle: subtitle.trim() || 'Creator-built skill orchestration package',
      defaultSessionTitle: `${title.trim()} Session`,
      discoverable: true,
      intakeTitle: intakeTitle.trim() || 'Prepare your personalized learning session',
      intakeDescription: intakeDescription.trim() || 'Provide required materials to personalize learning.',
      creatorPrompt: creatorPrompt.trim() || 'Follow creator instructions before starting planning.',
      intakeFields,
      skillNodes: normalizedSkillNodes,
      skillPacks,
      commands,
      runtimePolicy: {
        systemPrompt,
        guardrails,
      },
      source: 'creator',
    });
  };

  const removeSkillPack = (index: number) => {
    const target = skillPacks[index];
    if (!target) {
      return;
    }

    const referencedBy = commands.find((command) => command.skillPackId === target.id);
    if (referencedBy) {
      setValidationNotice(
        `Cannot remove "${target.name}" because command "${referencedBy.name}" is still bound to it.`,
      );
      return;
    }

    setValidationNotice(null);
    setSkillPacks((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <motion.div
      className="min-h-screen px-4 py-6 text-[#0f172a]"
      variants={staggerContainer(reducedMotion, 0.09, 0.03)}
      initial="hidden"
      animate="visible"
    >
      <motion.main className="mx-auto w-full max-w-6xl" variants={fadeSlideY(reducedMotion, 10, MOTION_DURATION.slow)}>
        <header className="hero-shell rounded-[22px] px-4 py-3 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-2 font-heading text-lg font-semibold text-[#0f172a]">
                <Sparkles className="h-4 w-4 text-[#0f172a]" />
                Creator Studio
              </p>
              <p className="mt-1 text-sm text-[#1e293b]">Build and sell agent skills, commands, and orchestration.</p>
            </div>
            <motion.button
              type="button"
              onClick={onBack}
              whileHover={reducedMotion ? undefined : { y: -1 }}
              whileTap={reducedMotion ? undefined : { scale: 0.98 }}
              transition={springFor(reducedMotion, 'snappy')}
              className="btn-ghost inline-flex min-h-9 items-center gap-1 rounded-comfortable px-2.5 py-1.5 text-xs transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </motion.button>
          </div>
        </header>

        <section className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            {validationNotice ? (
              <div className="rounded-xl border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-[#dc2626]">
                {validationNotice}
              </div>
            ) : null}

            {validationErrors.length > 0 ? (
              <div className="rounded-xl border border-[#e2e8f0] bg-white px-3 py-2">
                <p className="text-sm font-semibold text-[#dc2626]">Fix before publish:</p>
                <ul className="mt-1 list-disc pl-5 text-xs text-[#dc2626]">
                  {validationErrors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="rounded-[22px] border border-[#e2e8f0] bg-white p-4">
              <p className="label-code">Package Basics</p>
              <div className="mt-3 space-y-2">
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Package title" className="h-10 w-full rounded-comfortable border border-[#e2e8f0] px-3 text-sm focus:border-[#7c3aed] focus:ring-0 focus:outline-none" />
                <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Package subtitle" className="h-10 w-full rounded-comfortable border border-[#e2e8f0] px-3 text-sm focus:border-[#7c3aed] focus:ring-0 focus:outline-none" />
              </div>
            </div>

            <div className="rounded-[22px] border border-[#e2e8f0] bg-white p-4">
              <p className="label-code">Source Material</p>
              <label className="mt-3 inline-flex cursor-pointer items-center rounded-comfortable border border-[#e2e8f0] bg-white px-3 py-2 text-sm font-medium text-[#0f172a] transition hover:border-[#2563eb] hover:text-[#2563eb]">
                Upload source file
                <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md" onChange={handleSourceUpload} className="hidden" />
              </label>
              <p className="mt-2 text-[13px] text-[#1e293b]">{sourceMaterialName ? `Loaded: ${sourceMaterialName}` : 'No file uploaded yet.'}</p>
            </div>

            <div className="rounded-[22px] border border-[#e2e8f0] bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="label-code">Learner Intake Schema</p>
                <button
                  type="button"
                  onClick={() => setIntakeFields((prev) => [...prev, makeIntakeField(prev.length + 1)])}
                  className="inline-flex items-center gap-1 bg-transparent px-2.5 py-1 text-xs text-[#0f172a] hover:text-[#2563eb]"
                >
                  <Plus className="h-3 w-3" /> Add field
                </button>
              </div>
              <input value={intakeTitle} onChange={(e) => setIntakeTitle(e.target.value)} placeholder="Intake title" className="mt-3 h-10 w-full rounded-comfortable border border-[#e2e8f0] px-3 text-sm focus:border-[#7c3aed] focus:ring-0 focus:outline-none" />
              <textarea value={intakeDescription} onChange={(e) => setIntakeDescription(e.target.value)} placeholder="Intake description" className="mt-2 min-h-[70px] w-full rounded-comfortable border border-[#e2e8f0] px-3 py-2 text-sm focus:border-[#7c3aed] focus:ring-0 focus:outline-none" />
              <textarea value={creatorPrompt} onChange={(e) => setCreatorPrompt(e.target.value)} placeholder="Creator guidance shown to learner" className="mt-2 min-h-[70px] w-full rounded-comfortable border border-[#e2e8f0] px-3 py-2 text-sm focus:border-[#7c3aed] focus:ring-0 focus:outline-none" />

              <div className="mt-3 space-y-2">
                {intakeFields.map((field, index) => (
                  <div key={field.id} className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input value={field.label} onChange={(e) => setIntakeFields((prev) => prev.map((item, i) => (i === index ? { ...item, label: e.target.value } : item)))} placeholder="Field label" className="h-9 rounded-comfortable border border-[#e2e8f0] px-2 text-sm focus:border-[#7c3aed] focus:ring-0 focus:outline-none" />
                      <select value={field.type} onChange={(e) => setIntakeFields((prev) => prev.map((item, i) => (i === index ? { ...item, type: e.target.value as IntakeField['type'] } : item)))} className="h-9 rounded-comfortable border border-[#e2e8f0] px-2 text-sm focus:border-[#7c3aed] focus:ring-0 focus:outline-none">
                        <option value="file">File</option>
                        <option value="url">URL</option>
                        <option value="text">Text</option>
                      </select>
                    </div>
                    <textarea value={field.description} onChange={(e) => setIntakeFields((prev) => prev.map((item, i) => (i === index ? { ...item, description: e.target.value } : item)))} placeholder="Why this field is needed" className="mt-2 min-h-[58px] w-full rounded-comfortable border border-[#e2e8f0] px-2 py-1.5 text-sm focus:border-[#7c3aed] focus:ring-0 focus:outline-none" />
                    <div className="mt-2 flex items-center justify-between">
                      <label className="inline-flex items-center gap-2 text-sm text-[#0f172a]">
                        <input type="checkbox" checked={field.required} onChange={(e) => setIntakeFields((prev) => prev.map((item, i) => (i === index ? { ...item, required: e.target.checked } : item)))} />
                        Required
                      </label>
                      <button type="button" onClick={() => setIntakeFields((prev) => prev.filter((_, i) => i !== index))} className="inline-flex items-center gap-1 px-2 py-1 text-xs text-[#64748b] hover:text-[#dc2626]">
                        <Trash2 className="h-3 w-3" /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[22px] border border-[#e2e8f0] bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="label-code">Agent Skill Packs</p>
                <button type="button" onClick={() => setSkillPacks((prev) => [...prev, makeSkillPack(prev.length + 1)])} className="inline-flex items-center gap-1 bg-transparent px-2.5 py-1 text-xs text-[#0f172a] hover:text-[#2563eb]">
                  <Plus className="h-3 w-3" /> Add skill
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {skillPacks.map((skill, index) => (
                  <div key={skill.id} className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3">
                    <input value={skill.name} onChange={(e) => setSkillPacks((prev) => prev.map((item, i) => (i === index ? { ...item, name: e.target.value } : item)))} placeholder="Skill name" className="h-9 w-full rounded-comfortable border border-[#e2e8f0] px-2 text-sm focus:border-[#7c3aed] focus:ring-0 focus:outline-none" />
                    <input value={skill.intent} onChange={(e) => setSkillPacks((prev) => prev.map((item, i) => (i === index ? { ...item, intent: e.target.value } : item)))} placeholder="Skill intent" className="mt-2 h-9 w-full rounded-comfortable border border-[#e2e8f0] px-2 text-sm focus:border-[#7c3aed] focus:ring-0 focus:outline-none" />
                    <textarea value={skill.instructions} onChange={(e) => setSkillPacks((prev) => prev.map((item, i) => (i === index ? { ...item, instructions: e.target.value } : item)))} placeholder="Instructions this skill should follow" className="mt-2 min-h-[70px] w-full rounded-comfortable border border-[#e2e8f0] px-2 py-1.5 text-sm focus:border-[#7c3aed] focus:ring-0 focus:outline-none" />
                    <div className="mt-2 flex justify-end">
                      <button type="button" onClick={() => removeSkillPack(index)} className="inline-flex items-center gap-1 px-2 py-1 text-xs text-[#64748b] hover:text-[#dc2626]">
                        <Trash2 className="h-3 w-3" /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[22px] border border-[#e2e8f0] bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="label-code">Commands</p>
                <button
                  type="button"
                  onClick={() => setCommands((prev) => [...prev, makeCommand(prev.length + 1, skillPacks[0]?.id ?? '')])}
                  className="inline-flex items-center gap-1 bg-transparent px-2.5 py-1 text-xs text-[#0f172a] hover:text-[#2563eb]"
                >
                  <Plus className="h-3 w-3" /> Add command
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {commands.map((command, index) => (
                  <div key={command.id} className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input value={command.name} onChange={(e) => setCommands((prev) => prev.map((item, i) => (i === index ? { ...item, name: e.target.value } : item)))} placeholder="Command name" className="h-9 rounded-comfortable border border-[#e2e8f0] px-2 text-sm focus:border-[#7c3aed] focus:ring-0 focus:outline-none" />
                      <input value={command.trigger} onChange={(e) => setCommands((prev) => prev.map((item, i) => (i === index ? { ...item, trigger: e.target.value } : item)))} placeholder="/command-trigger" className="h-9 rounded-comfortable border border-[#e2e8f0] px-2 text-sm focus:border-[#7c3aed] focus:ring-0 focus:outline-none" />
                    </div>
                    <select value={command.skillPackId} onChange={(e) => setCommands((prev) => prev.map((item, i) => (i === index ? { ...item, skillPackId: e.target.value } : item)))} className="mt-2 h-9 w-full rounded-comfortable border border-[#e2e8f0] px-2 text-sm focus:border-[#7c3aed] focus:ring-0 focus:outline-none">
                      {skillPacks.map((skill) => (
                        <option key={skill.id} value={skill.id}>{skill.name}</option>
                      ))}
                    </select>
                    <textarea value={command.defaultPrompt} onChange={(e) => setCommands((prev) => prev.map((item, i) => (i === index ? { ...item, defaultPrompt: e.target.value } : item)))} placeholder="Default prompt executed by this command" className="mt-2 min-h-[62px] w-full rounded-comfortable border border-[#e2e8f0] px-2 py-1.5 text-sm focus:border-[#7c3aed] focus:ring-0 focus:outline-none" />
                    <div className="mt-2 flex justify-end">
                      <button type="button" onClick={() => setCommands((prev) => prev.filter((_, i) => i !== index))} className="inline-flex items-center gap-1 px-2 py-1 text-xs text-[#64748b] hover:text-[#dc2626]">
                        <Trash2 className="h-3 w-3" /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[22px] border border-[#e2e8f0] bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="label-code">Learning Orchestration Steps</p>
                <button type="button" onClick={() => setOrchestrationSteps((prev) => [...prev, makeOrchestrationStep(prev.length + 1)])} className="inline-flex items-center gap-1 bg-transparent px-2.5 py-1 text-xs text-[#0f172a] hover:text-[#2563eb]">
                  <Plus className="h-3 w-3" /> Add step
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {orchestrationSteps.map((step, index) => (
                  <div key={step.id} className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3">
                    <input value={step.title} onChange={(e) => setOrchestrationSteps((prev) => prev.map((item, i) => (i === index ? { ...item, title: e.target.value } : item)))} placeholder="Step title" className="h-9 w-full rounded-comfortable border border-[#e2e8f0] px-2 text-sm focus:border-[#7c3aed] focus:ring-0 focus:outline-none" />
                    <textarea value={step.description} onChange={(e) => setOrchestrationSteps((prev) => prev.map((item, i) => (i === index ? { ...item, description: e.target.value } : item)))} placeholder="Step description" className="mt-2 min-h-[62px] w-full rounded-comfortable border border-[#e2e8f0] px-2 py-1.5 text-sm focus:border-[#7c3aed] focus:ring-0 focus:outline-none" />
                    <div className="mt-2 flex justify-end">
                      <button type="button" onClick={() => setOrchestrationSteps((prev) => prev.filter((_, i) => i !== index))} className="inline-flex items-center gap-1 px-2 py-1 text-xs text-[#64748b] hover:text-[#dc2626]">
                        <Trash2 className="h-3 w-3" /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[22px] border border-[#e2e8f0] bg-white p-4">
              <p className="label-code">Runtime Policy</p>
              <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} placeholder="System prompt for learner-facing agent" className="mt-3 min-h-[84px] w-full rounded-comfortable border border-[#e2e8f0] px-3 py-2 text-sm focus:border-[#7c3aed] focus:ring-0 focus:outline-none" />
              <textarea value={guardrails} onChange={(e) => setGuardrails(e.target.value)} placeholder="Special guardrails and constraints" className="mt-2 min-h-[70px] w-full rounded-comfortable border border-[#e2e8f0] px-3 py-2 text-sm focus:border-[#7c3aed] focus:ring-0 focus:outline-none" />
              <button
                type="button"
                onClick={publish}
                disabled={!canPublish}
                className="btn-cta mt-3 inline-flex min-h-11 items-center justify-center px-4 text-sm font-semibold"
              >
                Publish Runnable Skill Package
              </button>
            </div>
          </div>
        </section>
      </motion.main>
    </motion.div>
  );
}
