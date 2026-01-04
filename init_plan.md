Interactive Agent Experience Engine (IAEE)

Vision: Replace static agent-generated markdown plans with deterministic, delightful, Brilliant-style interactive experiences that allow a human to actively reason, decide, and guide agents through structured interaction.

⸻

1. Problem Statement

Agentic workflows today often produce long markdown plans (PRDs, technical designs, architecture docs) that must be reviewed linearly. This creates several issues:
	•	Reviewing is passive and boring
	•	Feedback is low-signal and inconsistent
	•	Humans are forced to reason around the plan instead of inside it
	•	Agents receive unstructured, ambiguous feedback

IAEE introduces an interactive, schema-driven experience layer where:
	•	Agents emit structured JSON, not markdown
	•	Humans interact step-by-step through a guided experience
	•	Decisions, prioritization, and reasoning are captured explicitly
	•	Agents receive a high-signal markdown summary at the end

⸻

2. Core Design Principles
	1.	Deterministic Rendering
Agents never generate UI or code. They emit data only.
	2.	Human-in-the-Loop by Design
The system optimizes for human reasoning, not speed.
	3.	Linear, Focused Flow
One section at a time. No scrolling walls of content.
	4.	Stateful Session
Later sections may reference earlier decisions.
	5.	Markdown as the Final Truth
Agents consume a synthesized markdown summary, not raw UI state.
	6.	Offline, Local, Simple
Runs entirely on the local machine via a temporary server.

⸻

3. High-Level Architecture

Agent (JSON Experience)
        ↓
Experience Loader + Validator
        ↓
Interactive Wizard Runtime
        ↓
Human Interaction
        ↓
Session State Accumulation
        ↓
Markdown Summary Compiler
        ↓
Agent Continues


⸻

4. Experience Definition (Agent-Facing Contract)

4.1 Experience Shape

Experience {
  title: string
  intro?: string
  sections: Section[]
}

	•	title: Displayed prominently at the start
	•	intro: Optional framing context
	•	sections: Ordered, linear list of interactive sections

⸻

5. Section Model

5.1 Base Section Contract

All sections share the following fields:

SectionBase {
  id: string
  type: string
  title: string
  description?: string
}

	•	id: Stable identifier used for state + summary generation
	•	type: Determines renderer + compiler logic
	•	title: Section heading
	•	description: Optional helper text

⸻

6. v0 Supported Section Types

v0 prioritizes delightful usefulness, not completeness.

⸻

6.1 info — Context & Explanation

Purpose:
Provide read-only context, similar to Brilliant.org explanations.

{
  "id": "context",
  "type": "info",
  "title": "Problem Context",
  "content": "We are designing a feature that allows users to view historical changes..."
}

	•	No user input
	•	Included in final narrative summary

⸻

6.2 text-review — Review & Comment

Purpose:
Allow the human to read a proposal and optionally leave commentary.

{
  "id": "architecture",
  "type": "text-review",
  "title": "Architecture Proposal",
  "content": "The system will be composed of three services..."
}

Captured Output:

{
  "comment": "Make sure to include retries."
}


⸻

6.3 choice — Select Between Options

Purpose:
Force explicit decision-making between alternatives.

{
  "id": "database-choice",
  "type": "choice",
  "title": "Database Strategy",
  "options": [
    { "id": "postgres", "label": "Postgres" },
    { "id": "dynamo", "label": "DynamoDB" }
  ]
}

Captured Output:

{
  "selected": "postgres"
}


⸻

6.4 rank — Prioritization via Drag & Drop

Purpose:
Let humans express priority, not just preference.

{
  "id": "feature-priority",
  "type": "rank",
  "title": "Prioritize Features",
  "items": [
    { "id": "search", "label": "Search" },
    { "id": "history", "label": "History" },
    { "id": "export", "label": "Export" }
  ]
}

Captured Output:

{
  "order": ["history", "search", "export"]
}


⸻

6.5 decision — Final Gate

Purpose:
Conclude the experience with an explicit approve/reject outcome.

{
  "id": "final-decision",
  "type": "decision",
  "title": "Final Decision"
}

Captured Output:

{
  "decision": "approve",
  "rationale": "Looks good!"
}

Rule: Exactly one decision section is required.

⸻

7. Session State Model

State is accumulated per section:

SessionState = {
  [sectionId: string]: unknown
}

	•	Stored only in memory
	•	Accessible by later sections
	•	No persistence beyond submission

⸻

8. Interaction Flow
	1.	Intro screen (title + intro)
	2.	Section 1 rendered
	3.	User completes section
	4.	Next button enabled
	5.	Repeat until final section
	6.	Submit experience

Navigation:
	•	Forward / Back allowed
	•	Cannot submit without completing decision

⸻

9. Output Compilation

9.1 Structured Output (Internal)

{
  "database-choice": { "selected": "postgres" },
  "feature-priority": { "order": ["history", "search", "export"] },
  "final-decision": {
    "decision": "reject",
    "rationale": "Scope is too broad for initial release"
  }
}


⸻

9.2 Markdown Summary (Agent-Facing, Source of Truth)

# Interactive Experience Summary

## Database Strategy
Selected **Postgres**.

## Feature Prioritization
1. History
2. Search
3. Export

## Final Decision
❌ Rejected

**Rationale:**
Scope is too broad for an initial release.

This markdown is what the agent consumes.

⸻

10. Runtime Architecture (TypeScript)

/engine
  section-registry.ts
  experience-runner.ts
  state-store.ts
  summary-compiler.ts

/ui
  /sections
    InfoSection.tsx
    TextReviewSection.tsx
    ChoiceSection.tsx
    RankSection.tsx
    DecisionSection.tsx
  WizardShell.tsx

/cli
  run.ts


⸻

11. Execution Model
	1.	CLI receives experience.json
	2.	Validate against schema
	3.	Start Bun HTTP server
	4.	Open browser
	5.	Block process until submission
	6.	Generate markdown summary
	7.	Print or write output
	8.	Shutdown server

⸻

12. Agent Prompt Guardrails (Conceptual)

Agents must:
	•	Use only supported section types
	•	Provide required fields
	•	Avoid UI or implementation assumptions
	•	Include exactly one decision section
	•	Keep content concise and purposeful

⸻

13. Non-Goals (v0)
	•	Conditional branching
	•	Persistent sessions
	•	Multi-user collaboration
	•	Custom agent-defined UI components
	•	Remote hosting

⸻

14. Backlog / Future Ideas
	•	Conditional sections
	•	Kanban boards
	•	Feature toggles
	•	Inline state references
	•	Templated copy using prior answers
	•	Export to other formats

⸻

15. Success Definition

“Wow, reviewing plans is fun again. This elevates my entire agentic workflow.”

If IAEE achieves that, v0 is a success.

⸻

16. Finalized Specifications (v0)

Based on research and validation (Jan 2026):

16.1 Experience Schema Contract
	•	Validation: Zod (Standard, best DX)
	•	Strategy: Strip unknown fields (Robust forward compatibility)
	•	Required Metadata: id, type, title, description

16.2 CLI I/O Contract
	•	Input: File-based (e.g., iaee run experience.json)
	•	Output: Hybrid (Stdout by default, --output flag optional)
	•	Summary: Full Context (Includes original info + decisions) with Text Status

16.3 Interaction & UI
	•	Theme: Minimalist ("Brilliant-style", single column, focus)
	•	Navigation: Preserve State on Back; Validate on "Next"
	•	Progress: Stepper UI

16.4 Architecture & Delivery
	•	Extensibility: Static Registry (Simple compile-time imports)
	•	Packaging: Host Only (Builds for the current machine via bun build)
	•	Testing: UI First (Prioritize component rendering and interaction feel)
