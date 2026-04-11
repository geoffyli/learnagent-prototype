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

## Beat 4 — Skill Tree & Content Showcase (1:10–1:45)

**Action:** Point to the **skill progress bar** at the top. Highlight that **two skills** are available simultaneously: Reading & Writing and Algebra & Functions. Click **"Reading & Writing"** to open it.

**Script:**
> "This is the skill tree — and it mirrors the actual Digital SAT structure. Reading & Writing and Math start in parallel, just like the real test. They converge into Adaptive Test Strategy — the skill that teaches students how Module 1 performance determines their score ceiling."

**Action:** Point to the **Content** tab in the side panel — it auto-loads a **comparison table** and **metric strip** showing the R&W domain breakdown.

**Script:**
> "Each skill auto-loads structured content in the side panel. Look at this — a comparison table breaking down domain accuracy, and metric cards showing exactly where the 220-point gap lives. This is not just text — it is interactive, structured content generated for this specific student."

---

## Beat 5 — Branching & Exploration (1:45–2:10)

**Action:** Type in the chat: *"Why do I keep picking wrong answers on purpose questions?"* Wait for the response. Then **select a portion of the assistant's reply text** with your mouse.

**Script:**
> "Now I'll ask a real question. Watch what happens when I select part of the answer."

**Action:** Click **"Explore This"** in the popover that appears.

**Script:**
> "Knovia creates a side exploration — a separate workspace linked to this skill. My main thread stays clean while I go deep on this concept. Look at the skill tree panel — you can see the main thread, the skill node, and the exploration branch all connected as a graph."

---

## Beat 6 — Flashcards & Skill Completion (2:10–2:50)

**Action:** Click **"Reading & Writing"** in the skill bar at the top to return to the skill workspace. Then type *"Show me SAT strategy flashcards"*. The **Content tab** updates with a flashcard deck.

**Script:**
> "Back in the skill workspace, I'll ask for strategy cards. These are not Quizlet-style definitions — look at this. Each card teaches a reasoning process. This one teaches the 'purpose versus topic' trap — the number one reason students miss Craft & Structure questions."

**Action:** Click on the flashcard to flip it. Click **Next** to show a second card.

**Script:**
> "Flip to see the strategy. Navigate to the next card — it teaches when to trust a graph versus the passage text."

**Action:** Click **"✓ Complete"** next to Reading & Writing in the skill bar.

**Script:**
> "When the student is ready, they mark the skill complete — and watch what unlocks."

**Action:** Point to the skill bar — Reading & Writing shows a checkmark, **English Conventions** changes from Locked to Ready. **Algebra & Functions** was already available.

**Script:**
> "English Conventions unlocks — their weakest domain, where 60 points are waiting. And look — it auto-loads a callout stack with color-coded reasoning traps. Each skill surfaces different content: comparison tables, flashcards, callout stacks, error traces, timelines. The system structures every piece of learning."

---

## Beat 7 — Close (2:50–3:00)

**Action:** Stay on the skill tree view.

**Script:**
> "That is Knovia — structured content, non-linear skill progression, adaptive strategy, and side explorations, all in one system. Not a chatbot. Not a course player. A structured learning system that shows you where your score is hiding."

---

## Fallback Prompts (If Chat Stalls)

Paste these directly into chat to guarantee rich content output:

| Prompt | Expected Content |
|---|---|
| `"Show me the Digital SAT adaptive structure"` | Concept map with Module 1 → adaptive gate → Module 2 |
| `"Where am I losing points in R&W?"` | Comparison table + score diagnosis metrics |
| `"Show me SAT strategy flashcards"` | Flashcard deck with reasoning traps |
| `"Diagnose my reasoning errors"` | Error trace with pattern detection + code block |
| `"Show me my score diagnosis"` | Domain accuracy metrics with point opportunities |
| `"What are common SAT reasoning traps?"` | Callout stack with 4 color-coded traps |
| `@content:sat-study-plan-timeline` | Personalized 8-week plan + formula flashcards |
| `@content:sat-test-day-checklist` | Digital SAT test-day execution checklist |

---

## Content Types Shown During Demo Flow

| Beat | Content Type | How It Appears |
|---|---|---|
| 4 | **Comparison Table + Metric Strip** | Auto-loaded on entering Reading & Writing |
| 5 | **Skill Tree Graph** | Visible in side panel during branching |
| 6a | **Flashcard Deck** | Triggered by chat message |
| 6b | **Callout Stack** | Auto-loaded when English Conventions unlocks |

Additional types available via fallback prompts: **Concept Map**, **Timeline**, **Debug Trace + Code Block**, **Checklist**.

---

## Key One-Liners (Memorize These)

- *"It shows you where your 220-point gap lives and front-loads the highest-ROI domain."*
- *"These are not definitions — they teach reasoning PROCESSES that a tutor would teach."*
- *"The skill tree mirrors the real Digital SAT: parallel sections, domain convergence, adaptive strategy."*
- *"Side explorations keep your main thread clean while you go deep on any concept."*
- *"Every skill surfaces different structured content — tables, flashcards, callouts, traces, timelines."*
- *"English Conventions unlocks next because that is where the hidden points are."*
