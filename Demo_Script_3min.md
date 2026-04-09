# Knovia — 3-Minute Demo Script

> **Format:** Each section lists the **Action** (what to click/do on screen) and the **Script** (exact words to speak).
> **Total runtime:** ~3 minutes. Practice until smooth — each beat is timed.

---

## Setup (Before You Start)

- Run `npm run dev` and open the local Vite URL in browser.
- Navigate to the **Welcome Page** (home screen).
- Keep browser at full width so the canvas panel is visible.

---

## Beat 1 — Hook & Problem (0:00–0:20)

**Action:** Have the Welcome Page on screen. Do not click anything yet.

**Script:**
> "Most people learn with AI by having a long, messy chat. You ask a question, follow a tangent, follow another one — and ten minutes later you've completely lost track of what you were originally trying to learn. There's no structure, no progress, and nothing reusable.
>
> Knovia fixes that. What you're looking at is a **runnable learning runtime** — not a course player, not a chatbot. Let me show you with SAT prep."

---

## Beat 2 — Package Selection & Intake (0:20–0:50)

**Action:** Click **"SAT Exam Prep Sprint"** in the Course Packages section.

**Script:**
> "We start with a package. In this case, an SAT Exam Prep Sprint — designed to boost a student's score across all sections."

**Action:** Point to the **Creator Guidance** section and the intake fields (Practice Test Score Report, Target SAT Score, Weak Areas).

**Script:**
> "Notice the intake form is configured by the course creator — different packages require different inputs. This one asks for a practice test score, a target score, and weak areas. That means preparation is personalized from the first second."

**Action:** Click **"Fill Sample Inputs"**, then click **"Generate Learning Plan"**.

**Script:**
> "We'll fill in sample data and generate a personalized plan."

---

## Beat 3 — Planning Flow (0:50–1:15)

**Action:** Click **"Improve my SAT score"** (or another quick action) to advance the first planning step. Click through two to three more quick actions to advance the planning steps.

**Script:**
> "The system runs a short planning conversation — clarifying the student's goals, assessing their baseline, and setting milestones. You can see the steps completing in the canvas on the right."

**Action:** Click **"Start Learning"** when the plan is complete.

**Script:**
> "Once the plan is ready, we enter the skill graph runtime."

---

## Beat 4 — Skill Graph & Topic Session (1:15–1:45)

**Action:** Point to the **skill progress bar** on the left. Highlight that **two nodes** are available simultaneously: Reading Comprehension and Math: No Calculator. Click **"Reading Comprehension"** to open its topic session.

**Script:**
> "This is the Graph. Notice something important — there are two starting points: Reading and Math. The SAT tests both, and they're independent, so you can work on either one first. The system tracks mastery, not watch-time.
>
> We'll open Reading Comprehension."

**Action:** Point to the chat and the canvas artifact tab (Reading vs Writing strategy comparison auto-loaded).

**Script:**
> "Each topic session has its own workspace — with a focused chat and a canvas that auto-populates relevant artifacts. Here you can already see a Reading vs Writing strategy comparison."

---

## Beat 5 — Branching (1:45–2:15)

**Action:** Ask a question in the chat, e.g.: *"What are the most common traps in SAT reading passages?"* Wait for the response. Then **select a portion of the assistant's reply text** with your mouse.

**Script:**
> "Now here's the key differentiator. I'll ask about common traps — and then select part of the answer I want to explore further."

**Action:** Click **"Deep Dive"** in the popover that appears.

**Script:**
> "Instead of burying this in the same chat thread, Knovia creates a **branch session** — a separate workspace linked to this skill node. My main thread stays clean. I can go deep on a side topic and then navigate back.
>
> The canvas on the right shows the session tree — main session, topic, and branches all connected."

---

## Beat 6 — Canvas Artifact & Mastery (2:15–2:50)

**Action:** Click a **quick action** in the chat (e.g., "Review vocabulary") or type *"Show me SAT vocabulary flashcards"*. Switch to the **Content tab** in the canvas to show the generated artifact.

**Script:**
> "Let's trigger a richer artifact. Knovia doesn't just reply in text — it renders flashcard decks, comparison tables, timelines, and error analysis traces directly in the canvas. Here are vocabulary flashcards with words in real SAT sentence context."

**Action:** Flip one or two flashcards to show the interaction. Then return to the Reading Comprehension topic session. Click **"Mark Node Mastered"**.

**Script:**
> "When I'm ready to move on, I mark the node mastered — and watch what happens."

**Action:** Point to the skill list on the left — Reading Comprehension now shows a checkmark, and **Writing & Language** changes from Locked to Ready. Note that **Math: No Calculator** was already available.

**Script:**
> "Writing & Language unlocks because it depends on Reading. But Math was already available from the start — that's the non-linear skill graph in action."

---

## Beat 7 — Close (2:50–3:00)

**Action:** Stay on the skill graph view.

**Script:**
> "That's Knovia — a structured, multi-threaded, artifact-first learning runtime. Not a chatbot. Not a course player. Something new.
>
> We're building for learners who want to actually get somewhere."

---

## Fallback Prompts (If Chat Stalls)

Paste these directly into chat to guarantee rich artifact output:

| Prompt | Expected Artifact |
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

- *"This is not a static course player. It is a runnable learning runtime."*
- *"The skill graph is non-linear — Reading and Math start in parallel, just like the real SAT."*
- *"Learning is multi-threaded — branch sessions mean you never lose your main thread."*
- *"Progress is tracked on node mastery, not passive watch-time."*
- *"Each package defines its own intake, so onboarding is creator-configurable."*
- *"The canvas stores reusable artifacts — flashcards, comparison tables, error traces — not just chat history."*
