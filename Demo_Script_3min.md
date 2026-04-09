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
> "Most people learn with AI by having a long, messy chat. You ask a question, follow a tangent, follow another one — and ten minutes later you've lost track of what you were trying to learn. There's no structure, no progress, and nothing reusable.
>
> Knovia fixes that. Let me show you with SAT prep."

---

## Beat 2 — Package Selection & Intake (0:15–0:50)

**Action:** Click **"SAT Exam Prep Sprint"** in the Course Packages section. The **Course Detail Page** appears.

**Script:**
> "We start with a course package. This is an SAT Exam Prep Sprint — 7 skills, learner reviews, all built by a creator using Knovia's publishing tools."

**Action:** Click **"Start Course"** on the Course Detail Page. The **Setup / Intake Page** appears.

**Script:**
> "The intake form is configured by the creator — different packages ask for different inputs. This one needs a practice test score, a target score, and weak areas. Personalized from the first second."

**Action:** Click **"Fill Sample Inputs"**, then click **"Start Learning"**.

**Script:**
> "We'll fill in sample data and start."

---

## Beat 3 — Planning Flow (0:50–1:10)

**Action:** Click **"Improve my SAT score"** to advance the first planning step. Click through **all five quick actions** to complete planning — the system auto-transitions to the skill tree after the last step.

**Script:**
> "The system runs a short planning conversation — goals, baseline, milestones. Each step completes in the panel on the right. Once the plan is done, we enter the skill tree."

---

## Beat 4 — Skill Tree & Topic (1:10–1:40)

**Action:** Point to the **skill progress bar** at the top. Highlight that **two skills** are available simultaneously: Reading Comprehension and Math: No Calculator. Click **"Reading Comprehension"** to open it.

**Script:**
> "This is the skill tree. Notice there are two starting points — Reading and Math. They're independent, just like on the real SAT. The system tracks completion, not watch-time.
>
> Let's open Reading Comprehension."

**Action:** Point to the **Skill Tree** tab in the side panel showing the learning tree structure.

**Script:**
> "Each skill has its own workspace — chat on the left, and a side panel showing the learning tree and any content the system generates."

---

## Beat 5 — Branching (1:40–2:10)

**Action:** Type in the chat: *"How should I approach SAT reading passages about scientific topics?"* Wait for the multi-sentence response. Then **select a portion of the assistant's reply text** with your mouse.

**Script:**
> "Now here's the key differentiator. I'll ask a question — and then select part of the answer I want to explore further."

**Action:** Click **"Explore This"** in the popover that appears.

**Script:**
> "Instead of burying this in the same thread, Knovia creates a **side exploration** — a separate workspace linked to this skill. My main thread stays clean. I can go deep on a side topic and navigate back.
>
> The panel shows the learning tree — my main thread, the topic, and explorations all connected."

---

## Beat 6 — Content & Completion (2:10–2:50)

**Action:** Click **"Reading Comprehension"** in the skill bar at the top to return to the skill workspace. Then type *"Show me SAT vocabulary flashcards"*. The **Content tab** updates with a flashcard deck.

**Script:**
> "Back in the skill workspace, I'll ask for vocabulary flashcards. Knovia renders these directly in the side panel — not just text. Cards with real SAT-style sentences so definitions actually stick."

**Action:** Click on the flashcard to flip it. Click **Next** to show a second card.

**Action:** Click **"✓ Complete"** next to Reading Comprehension in the skill bar.

**Script:**
> "When I'm ready, I click Complete — and watch what happens."

**Action:** Point to the skill bar — Reading Comprehension shows a checkmark, **Writing & Language** changes from Locked to Ready. **Math: No Calculator** was already available.

**Script:**
> "Writing & Language unlocks because it depends on Reading. But Math was already available from the start — that's the non-linear skill tree in action."

---

## Beat 7 — Close (2:50–3:00)

**Action:** Stay on the skill tree view.

**Script:**
> "That's Knovia — a structured, interactive learning system. Not a chatbot. Not a course player. Something new.
>
> We're building for learners who want to actually get somewhere."

---

## Fallback Prompts (If Chat Stalls)

Paste these directly into chat to guarantee rich content output:

| Prompt | Expected Content |
|---|---|
| `"Show me the SAT skill dependency map"` | Concept map |
| `"Compare reading vs writing strategies"` | Comparison table + metrics |
| `"What are common SAT traps?"` | Callout stack |
| `"Run an error analysis on my practice"` | Error analysis trace |
| `"Show me my section score progress"` | Metric strip |
| `@content:sat-vocab-flashcards` | Flashcard deck (guaranteed) |
| `@content:sat-study-plan-timeline` | Study plan timeline (guaranteed) |
| `@content:sat-test-day-checklist` | Test-day checklist (guaranteed) |

---

## Key One-Liners (Memorize These)

- *"This is not a static course player. It is an interactive learning system."*
- *"The skill tree is non-linear — Reading and Math start in parallel, just like the real SAT."*
- *"Side explorations mean you never lose your main thread."*
- *"Progress is tracked on skill completion, not passive watch-time."*
- *"The side panel shows reusable content — flashcards, comparison tables, error traces — not just chat history."*
