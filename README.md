# Knovia Prototype (Data Analyst Job Sprint)

Interactive prototype for Knovia's commercialization direction.

Core demo statement: Knovia sells a runnable learning process, not static content.

## What This Prototype Demonstrates

1. Personalized planning from user context
- Session creation supports package selection.
- Setup page is package-driven: creators define required learner materials.
- Learner can upload/input those materials before planning.
- Planning flow adapts the generated path to a Data Analyst job target.

2. Graph + Plan + State runtime
- Skill graph with dependency unlocks.
- Node progression states: locked, ready, in-progress, mastered.
- Session graph supports topic sessions and branch sessions.

3. Multi-session learning flow
- Branch from selected text into Ask or Explain sessions.
- Agent suggestions create additional branch opportunities.

4. User-friendly command execution
- Typing `/` opens command popover with prefix filtering.
- Clicking a command opens an argument dialog (cancel/run) before execution.
- Chat shows explicit command execution feedback without exposing creator internals.

5. AI as canvas
- Rich content panel renders structured artifacts:
  - skill maps
  - timelines
  - comparison tables
  - checklists
  - flashcards
  - debug traces

6. Data Analyst case narrative
- End-to-end scenario is "Data Analyst Job Sprint".
- Topics include SQL, metrics/funnels, dashboard storytelling, A/B testing, and interview case simulation.

7. Creator package builder (Sprint 1)
- Creator Studio supports source upload, schema editing, and package publishing.
- Creator edits agent skill packs, command triggers, intake schema, and runtime policy.
- Published packages appear on Welcome page and can be launched immediately.

## Run Locally

```bash
npm install
npm run dev
```

## Quality Checks

```bash
npm run lint
npm run test
npm run build
```

## Key Files

- `src/App.tsx`
- `src/components/SessionCanvas.tsx`
- `src/components/SessionChat.tsx`
- `src/components/RichContentPanel.tsx`
- `src/components/CreatorBuilderPage.tsx`
- `src/data/richReplies.ts`
- `src/state/content-resolver.ts`
- `src/types/course-package.ts`

## Demo Walkthrough

After implementation, use:

- `Prototype_Demo_Operation_Guide.md`

for step-by-step operation instructions during professor/investor demos.
