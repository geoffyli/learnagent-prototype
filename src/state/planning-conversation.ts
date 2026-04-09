import type { CoursePackageConfig } from '../types/course-package';

export interface PlanningQuickAction {
  label: string;
  prompt: string;
}

export interface PlanningTurn {
  stepId: string;
  agentMessage: string;
  quickActions: PlanningQuickAction[];
  buildReply: (userMessage: string) => string;
}

/**
 * Build a 5-turn planning conversation script personalized to the course
 * package and learner intake data.
 */
export function getPlanningScript(
  coursePackage: CoursePackageConfig,
  intake: Record<string, string>,
): PlanningTurn[] {
  const title = coursePackage.title;
  const firstSkill = coursePackage.skillNodes[0]?.title ?? 'the first topic';
  const skillCount = coursePackage.skillNodes.length;
  const intakeSummary = Object.entries(intake)
    .filter(([, v]) => v?.trim())
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ');

  return [
    // Step 1: Clarify Purpose
    {
      stepId: 'purpose',
      agentMessage:
        `Thanks for sharing your materials${intakeSummary ? ` (${intakeSummary})` : ''}. Before I build your **${title}** plan, I want to understand your primary goal.\n\nWhat's the most important outcome you're looking for?`,
      quickActions: coursePackage.planningHints?.purposeActions ?? [
        { label: 'Prepare for interviews', prompt: 'My main goal is to prepare for technical interviews.' },
        { label: 'Build portfolio projects', prompt: 'I want to build portfolio projects to showcase my skills.' },
        { label: 'Career transition', prompt: 'I am transitioning into a new role and need to build foundational skills.' },
      ],
      buildReply: (userMessage) => {
        const lower = userMessage.toLowerCase();
        if (lower.includes('interview')) {
          return `Great — interview preparation is a clear, focused objective. I'll prioritize skills and drills that mirror real interview scenarios and front-load the most commonly tested areas.`;
        }
        if (lower.includes('portfolio') || lower.includes('project')) {
          return `Building portfolio projects is a strong goal — it shows employers you can ship, not just study. I'll structure the plan around tangible outputs you can demonstrate.`;
        }
        if (lower.includes('transition') || lower.includes('new role')) {
          return `Career transitions benefit from a structured ramp-up. I'll make sure we cover foundational concepts first and build confidence before moving to advanced application.`;
        }
        return `Got it — that's a clear objective. I'll tailor the plan to prioritize what matters most for your goal.`;
      },
    },

    // Step 2: Assess Current Understanding
    {
      stepId: 'baseline',
      agentMessage:
        `Now let me calibrate the plan to your level. How confident do you feel with **${firstSkill}**? And have you had any hands-on experience with the topics in this sprint before?`,
      quickActions: [
        { label: 'Complete beginner', prompt: 'I am a complete beginner — no prior hands-on experience with these topics.' },
        { label: 'Some experience', prompt: 'I have some experience — I have studied or used some of these concepts before but not consistently.' },
        { label: 'Fairly confident', prompt: 'I am fairly confident — I have practical experience but want to fill gaps and sharpen skills.' },
      ],
      buildReply: (userMessage) => {
        const lower = userMessage.toLowerCase();
        if (lower.includes('beginner') || lower.includes('no prior')) {
          return `Understood — I'll start from the fundamentals and build up gradually. No time wasted on assumed knowledge.`;
        }
        if (lower.includes('some experience') || lower.includes('studied')) {
          return `Good baseline. I'll set the early modules at an intermediate pace and include quick reviews so you can skip what you already know.`;
        }
        if (lower.includes('confident') || lower.includes('practical experience')) {
          return `Strong foundation — I'll accelerate through basics and focus the plan on advanced application and edge cases.`;
        }
        return `Noted — I'll calibrate the difficulty to match your current level so every session feels productive.`;
      },
    },

    // Step 3: Gather References
    {
      stepId: 'research',
      agentMessage:
        `I'm now cross-referencing your background with current skill benchmarks for this domain. Are there specific targets or benchmarks you're aiming for? This helps me tailor the practice style.`,
      quickActions: coursePackage.planningHints?.targetActions ?? [
        { label: 'Big tech companies', prompt: 'I am targeting big tech companies like Google, Meta, or Amazon.' },
        { label: 'Growth-stage startups', prompt: 'I am targeting growth-stage startups where I would wear multiple hats.' },
        { label: 'No specific target', prompt: 'No specific target yet — I want a well-rounded general preparation.' },
      ],
      buildReply: (userMessage) => {
        const lower = userMessage.toLowerCase();
        if (lower.includes('big tech') || lower.includes('google') || lower.includes('meta') || lower.includes('amazon')) {
          return `Noted. I'll weight the practice toward structured interview formats and the depth of analysis that big tech panels expect.`;
        }
        if (lower.includes('startup')) {
          return `Startups value breadth and speed. I'll include more end-to-end scenarios where you handle ambiguity and wear multiple hats.`;
        }
        if (lower.includes('no specific') || lower.includes('well-rounded') || lower.includes('general')) {
          return `A well-rounded approach works great. I'll balance depth and breadth so you're prepared for a range of opportunities.`;
        }
        return `Got it — I'll tailor the practice scenarios and case studies to match your target.`;
      },
    },

    // Step 4: Draft Milestones
    {
      stepId: 'milestones',
      agentMessage:
        `Almost there. I need to know your time commitment to set realistic milestones. This sprint covers **${skillCount} skill areas**. How many hours per week can you dedicate?`,
      quickActions: [
        { label: '4-6 hours/week', prompt: 'I can commit about 4 to 6 hours per week.' },
        { label: '7-10 hours/week', prompt: 'I can do 7 to 10 hours per week.' },
        { label: '10+ hours/week', prompt: 'I can dedicate more than 10 hours per week for an intensive sprint.' },
      ],
      buildReply: (userMessage) => {
        const lower = userMessage.toLowerCase();
        if (lower.includes('4') || lower.includes('5') || lower.includes('6')) {
          return `With 4-6 hours/week, I'm structuring this as a steady 8-week sprint. Each week builds on the last with focused 45-60 minute sessions.`;
        }
        if (lower.includes('7') || lower.includes('8') || lower.includes('9') || lower.includes('10 hours')) {
          return `7-10 hours/week gives us a solid pace. I'll structure this as a 6-week sprint with room for extra practice and review cycles.`;
        }
        if (lower.includes('10+') || lower.includes('more than 10') || lower.includes('intensive')) {
          return `Intensive mode — I'll compress the timeline to 4-5 weeks with daily sessions and built-in checkpoints to keep momentum high.`;
        }
        return `Noted — I'll set milestones that match your available time so the pace feels sustainable.`;
      },
    },

    // Step 5: Finalize Report
    {
      stepId: 'report',
      agentMessage: buildPlanSummaryMessage(coursePackage),
      quickActions: [
        { label: "Looks great, let's go!", prompt: "This looks great — let's start learning!" },
        { label: 'Adjust the pace', prompt: 'Can you adjust the pace to be a bit more relaxed?' },
      ],
      buildReply: (userMessage) => {
        const lower = userMessage.toLowerCase();
        if (lower.includes('adjust') || lower.includes('relax') || lower.includes('change')) {
          return `Done — I've adjusted the pacing. The plan is flexible and we can always revisit milestones as you progress. Let's begin!`;
        }
        return `Excellent! Your personalized learning plan is locked in. Let's dive into the first skill.`;
      },
    },
  ];
}

function buildPlanSummaryMessage(coursePackage: CoursePackageConfig): string {
  const milestoneLines = coursePackage.skillNodes
    .map((node, i) => {
      const weekLabel = i < 2 ? `Weeks ${i + 1}-${i + 2}` : `Week ${i + 2}`;
      return `- **${weekLabel}**: ${node.title} — ${node.description}`;
    })
    .join('\n');

  return (
    `Here's your personalized learning plan:\n\n` +
    `**Course**: ${coursePackage.title}\n` +
    `**Milestones**:\n${milestoneLines}\n\n` +
    `**Cadence**: 4 focused sessions/week (45-60 min each)\n\n` +
    `Does this look right, or would you like me to adjust anything?`
  );
}
