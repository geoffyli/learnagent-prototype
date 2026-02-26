# LearnAgent Prototype

Interactive prototype demonstrating LearnAgent's core value: guided multi-session learning with dynamic rich content.

## What This Prototype Shows

1. **Planning-to-Learning Flow**
- Main session starts in a 5-step planning phase.
- User advances plan steps, then transitions into learning mode.

2. **Skill Tree + Session Graph**
- Skills unlock through dependencies.
- Each skill can spawn a topic session.
- Topic sessions support branching into Ask/Explain sub-sessions.

3. **Rich Content Panel**
- AI responses can render structured content blocks:
  - code blocks
  - comparison tables
  - flashcard decks

4. **Animated Demo UX**
- Coordinated layout, tab, graph, chat, and rich-content transitions.
- Reduced-motion preference is respected.

## Current Runtime Architecture

Active app flow is implemented by:
- `src/App.tsx`
- `src/components/SessionCanvas.tsx`
- `src/components/SessionChat.tsx`
- `src/components/RichContentPanel.tsx`

State utilities:
- `src/state/progression.ts`
- `src/state/session-status.ts`

Motion utilities:
- `src/motion/tokens.ts`
- `src/motion/variants.ts`

## Skill Progression Rules

- Skills with no dependencies start as `available`.
- Selecting an available skill sets it to `in-progress`.
- Clicking **Mark Skill Complete** (inside topic chat) sets it to `completed`.
- Locked dependents automatically unlock (`available`) when prerequisites are completed.

## Rich Content Triggers (Topic Sessions)

- **Code**: message includes `example` or `show`
- **Comparison table**: message includes `vs`, `comparison`, or `reducer`
- **Flashcards**: message includes `quiz`, `test`, or `practice`

## Development

### Prerequisites
- Node.js 18+
- npm

### Install

```bash
cd Prototype
npm install
```

### Run

```bash
npm run dev
```

### Quality Gates

```bash
npm run lint
npm run test
npm run build
```

## Project Structure

```text
Prototype/
├── src/
│   ├── components/
│   │   ├── SessionCanvas.tsx
│   │   ├── SessionChat.tsx
│   │   └── RichContentPanel.tsx
│   ├── state/
│   │   ├── progression.ts
│   │   ├── session-status.ts
│   │   └── __tests__/
│   ├── motion/
│   │   ├── tokens.ts
│   │   └── variants.ts
│   ├── data/
│   ├── types/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── eslint.config.js
├── vitest.config.ts
└── package.json
```

## Purpose

Presentation prototype for validating LearnAgent UX direction and interaction model.

Internal use only - Georgia Tech IP.
