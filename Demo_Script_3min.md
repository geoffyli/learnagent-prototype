# Knovia — 3-Minute Demo Script

> **Format:** Each section lists the **Action** (what to click/do on screen) and the **Script** (exact words to speak).
> **Total runtime:** ~3 minutes. Practice until smooth — each beat is timed.

---

## Setup (Before You Start)

- Run `npm run dev` and open the local Vite URL in browser.
- Navigate to the **Welcome Page** (home screen).
- Keep browser at full width so the side panel is visible.

---

## Beat 1 — Hook & Problem (0:00–0:15)

**Action:** Have the Welcome Page on screen. Do not click anything yet.

**Script:**
> "Here is a real problem: you're a high school junior preparing for the SAT. You take a practice test and score 1180. You try Khan Academy. You watch YouTube. Three weeks later — you score 1190. Ten points after 40 hours of studying.
>
> Why? Because nobody showed you WHERE your points are hiding. Knovia does. Let me show you."

---

## Beat 2 — Package Selection & Intake (0:15–0:50)

**Action:** Click **"Digital SAT Prep Sprint"** in the Course Packages section. The **Course Detail Page** appears.

**Script:**
> "This is a Digital SAT Prep Sprint — built for the 2024 adaptive format. Two sections, four domains each, and an adaptive difficulty system. Look at these learner reviews — real feedback on score improvements and reasoning diagnosis."

**Action:** Click **"Start Course"** on the Course Detail Page. The **Setup / Intake Page** appears.

**Script:**
> "First, Knovia asks for your practice test score, your target, your test date, and your weakest areas. This is not a one-size-fits-all course — every plan is personalized from the first second."

**Action:** Click **"Fill Sample Inputs"**, then click **"Start Learning"**.

**Script:**
> "We'll fill in sample data — a student scoring 1180, targeting 1400, testing June 7th, with English Conventions as their weakest area."

---

## Beat 3 — Planning Flow (0:50–1:10)

**Action:** Click **"Break 1400"** to advance the first planning step. Click through the remaining quick actions to complete planning.

**Script:**
> "The planning flow asks targeted questions — not generic ones. 'Break 1400' — that's the student's real goal. The system builds an 8-week plan that front-loads their biggest scoring opportunity. Once planning is done, we enter the skill tree."

---

## Beat 4 — Skill Tree & Structured Content (1:10–1:45)

**Action:** Point to the **skill progress bar** at the top. Highlight that **two skills** are available simultaneously: Reading & Writing and Algebra & Functions. Click **"Reading & Writing"** to open it.

**Script:**
> "This is the skill tree — and it mirrors the actual Digital SAT. Reading & Writing and Math start in parallel, just like the real test. They converge into Adaptive Test Strategy — the skill that teaches how Module 1 performance determines your score ceiling."

**Action:** The **Content** panel auto-opens on the right with a **comparison table** and **metric strip**.

**Script:**
> "Look at what loaded automatically — a comparison table showing domain accuracy, and metric cards diagnosing exactly where the 220-point gap lives. Standard English Conventions at 52% accuracy — that's roughly 60 points on the table. This is structured, visual content — not just chat text."

**Action:** Click the **Skill Tree** tab to show the pre-seeded branch graph. Point to the 4 colored nodes and their connections.

**Script:**
> "Switch to the Skill Tree tab — each skill comes pre-populated with exploration branches: Explain, Ask, and Practice nodes, all connected to the topic. Every node is a separate workspace you can dive into."

---

## Beat 5 — Chat & Branching (1:45–2:10)

**Action:** Type in the chat: *"How do I tell the difference between an answer that is true and one that actually answers the question?"* Wait for the multi-paragraph response.

**Script:**
> "I'll ask a real question a struggling student would ask. Look at the response — it gives a structured reasoning process, not just a generic answer."

**Action:** **Select a portion of the assistant's reply text** with your mouse. Click **"Explore This"** in the popover.

**Script:**
> "Now watch — I select part of the answer and click 'Explore This.' Knovia creates a side exploration. My main thread stays clean while I go deep on this concept. The skill tree graph now shows a new branch connected to the topic."

---

## Beat 6 — More Content Types & Completion (2:10–2:50)

**Action:** Click **"Reading & Writing"** in the skill bar to return. Type *"Show me SAT strategy flashcards"*. The **Content** panel updates with a **flashcard deck**.

**Script:**
> "Back in the main workspace. I ask for strategy cards — and look what appears. Each card teaches a reasoning process, not a vocabulary definition. This one teaches the purpose-versus-topic trap. Flip it to see the strategy."

**Action:** Click the flashcard to flip it. Click **Next** to show the second card.

**Action:** Click **"✓ Complete"** next to Reading & Writing in the skill bar.

**Script:**
> "Mark it complete — and watch what unlocks."

**Action:** Point to the skill bar — Reading & Writing shows a checkmark, **English Conventions** changes from Locked to Ready. Click **"English Conventions"** to enter it.

**Script:**
> "English Conventions unlocks — their weakest domain, where 60 points are waiting. Click in — and look at the content that loaded: a callout stack with four color-coded reasoning traps. Anti-patterns in red, warnings in amber, tips in green, insights in blue. Every skill surfaces a different type of structured content."

---

## Beat 7 — Close (2:50–3:00)

**Action:** Stay on the content view showing the callout stack.

**Script:**
> "That is Knovia — structured content, non-linear skill progression, adaptive strategy, and side explorations, all in one system. Not a chatbot. Not a course player. A structured learning system that shows you where your score is hiding."

---

## Fallback Prompts (If Chat Stalls)

Paste these directly into chat to guarantee rich content output:

| Prompt | Expected Content |
|---|---|
| `"Show me the Digital SAT adaptive structure"` | **Concept map** — Module 1 → adaptive gate → Module 2 |
| `"Where am I losing points in R&W?"` | **Comparison table** + **metric strip** |
| `"Show me SAT strategy flashcards"` | **Flashcard deck** with reasoning traps |
| `"Diagnose my reasoning errors"` | **Debug trace** + **code block** with error table |
| `"Show me my score diagnosis"` | **Metric strip** — domain accuracy with point opportunities |
| `"What are common SAT mistake traps?"` | **Callout stack** — 4 color-coded traps |
| `@content:sat-study-plan-timeline` | **Timeline** + **flashcard deck** — personalized 8-week plan |
| `@content:sat-test-day-checklist` | **Checklist** — Digital SAT test-day execution plan |

---

## Content Types Shown During Demo Flow

| Beat | Content Type | How It Appears |
|---|---|---|
| 4 | **Comparison Table + Metric Strip** | Auto-loaded on entering Reading & Writing |
| 4 | **Skill Tree Graph** (4 colored nodes) | Visible when switching to Skill Tree tab |
| 5 | **New branch node in graph** | Created by Explore This |
| 6a | **Flashcard Deck** (interactive flip) | Triggered by chat message |
| 6b | **Callout Stack** (4 colors) | Auto-loaded on entering English Conventions |

**5 content block types + skill tree graph shown in main flow.** Additional types (concept map, timeline, debug trace + code, checklist) available via fallback prompts.

---

## Key One-Liners (Memorize These)

- *"Structured, visual content — not just chat text."*
- *"Every skill surfaces a different type of content — tables, flashcards, callouts, traces, timelines."*
- *"The skill tree mirrors the real Digital SAT: parallel sections, domain convergence, adaptive strategy."*
- *"Side explorations keep your main thread clean while you go deep on any concept."*
- *"English Conventions unlocks next because that is where 60 hidden points are."*
- *"Anti-patterns in red, warnings in amber, tips in green, insights in blue."*
