# LearnAgent — 3-Minute Demo Script

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
> LearnAgent fixes that. What you're looking at is a **runnable learning runtime** — not a course player, not a chatbot. Let me show you."

---

## Beat 2 — Package Selection & Intake (0:20–0:50)

**Action:** Click **"Data Analyst Job Sprint"** in the Course Packages section.

**Script:**
> "We start with a package. In this case, a Data Analyst Job Sprint — designed to get someone interview-ready in a few weeks."

**Action:** Point to the **Creator Guidance** section and the intake fields (Resume, GitHub URL, Target Role).

**Script:**
> "Notice that the package tells the learner exactly what to provide. This intake form is configured by the course creator — different packages require different inputs. That means onboarding is personalized from the first second."

**Action:** Click **"Fill Sample Inputs"**, then click **"Generate Learning Plan"**.

**Script:**
> "We'll fill in sample data and generate a personalized plan."

---

## Beat 3 — Planning Flow (0:50–1:15)

**Action:** Click **Continue** two to three times to advance the planning steps. The canvas panel shows planning steps progressing (Purpose → Baseline → Research → Milestones → Report).

**Script:**
> "The system runs a short planning conversation — clarifying the learner's goals, assessing their baseline, and drafting milestones. You can see the steps completing in the canvas on the right."

**Action:** Click **"Start Learning"** when the plan is complete.

**Script:**
> "Once the plan is ready, we enter the skill graph runtime."

---

## Beat 4 — Skill Graph & Topic Session (1:15–1:45)

**Action:** Point to the **skill progress bar** on the left (SQL Foundations = ready, others = locked). Click **"SQL Foundations"** to open its topic session.

**Script:**
> "This is the Graph. Every skill node has dependencies — you can't jump to Advanced Analytics until you've covered the foundations. The system tracks mastery, not watch-time.
>
> We'll open SQL Foundations."

**Action:** Point to the chat and the canvas artifact tab (skill map or checklist auto-loaded).

**Script:**
> "Each topic session is its own workspace — with a focused chat and a canvas that auto-populates relevant artifacts. No blank slate."

---

## Beat 5 — Branching (1:45–2:15)

**Action:** Ask a question in the chat, e.g.: *"How do I avoid SQL mistakes in interviews?"* Wait for the response. Then **select a portion of the assistant's reply text** with your mouse.

**Script:**
> "Now here's the key differentiator. I'll ask a follow-up question — and then select part of the answer I want to explore further."

**Action:** Click **"Ask"** in the popover that appears.

**Script:**
> "Instead of burying this in the same chat thread, LearnAgent creates a **branch session** — a separate workspace linked to this skill node. My main thread stays clean. I can go deep on a side topic and then navigate back.
>
> The canvas on the right shows the session tree — main session, topic, and branches all connected."

---

## Beat 6 — Canvas Artifact & Mastery (2:15–2:50)

**Action:** Click a **quick action** in the chat (e.g., "Skill Dependency Map" or "SQL vs BI Focus Matrix"). Switch to the **Content tab** in the canvas to show the generated artifact.

**Script:**
> "Let's trigger a richer artifact. LearnAgent doesn't just reply in text — it renders concept maps, comparison tables, timelines, and debug traces directly in the canvas. These are reusable — you can come back to them across sessions."

**Action:** Return to the SQL Foundations topic session. Click **"Mark Node Mastered"**.

**Script:**
> "When I'm ready to move on, I mark the node mastered — and watch what happens."

**Action:** Point to the skill list on the left — SQL Foundations now shows a checkmark, and the next node (Analytical SQL) changes from Locked to Ready.

**Script:**
> "The next node unlocks automatically. Progress is tied to demonstrated mastery, not just showing up."

---

## Beat 7 — Close (2:50–3:00)

**Action:** Stay on the skill graph view.

**Script:**
> "That's LearnAgent — a structured, multi-threaded, artifact-first learning runtime. Not a chatbot. Not a course player. Something new.
>
> We're building for learners who want to actually get somewhere."

---

## Fallback Prompts (If Chat Stalls)

Paste these directly into chat to guarantee rich artifact output:

| Prompt | Expected Artifact |
|---|---|
| `"Show me a skill dependency map for interview readiness"` | Concept map |
| `"Give me a SQL vs dashboard tradeoff comparison"` | Comparison table |
| `"Run a funnel diagnosis walkthrough"` | Debug trace |
| `"Give me interview anti-patterns"` | Callout wall |
| `@content:anti-patterns-callout-wall` | Callout wall (guaranteed) |
| `@content:architecture-learning-roadmap` | Roadmap artifact (guaranteed) |

---

## Key One-Liners (Memorize These)

- *"This is not a static course player. It is a runnable learning runtime."*
- *"Learning is non-linear — branch sessions mean you never lose your main thread."*
- *"Progress is tracked on node mastery, not passive watch-time."*
- *"Each package defines its own intake, so onboarding is creator-configurable."*
- *"The canvas stores reusable artifacts — maps, timelines, checklists — not just chat history."*
