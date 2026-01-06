# Plan: Visual Polish & Experience Design (Phase 4)

**Status**: Approved
**Author**: Roman
**Target Agent**: Chad
**Date**: 2026-01-04

---

## Context and Background

We have a functional CLI that runs interactive experiences (Phase 3), but the UI currently looks like a generic admin dashboard (sidebar + content). This contradicts our vision of a "delightful, Brilliant-style" experience.

The goal of this phase is to transform the UI from a "functional tool" into an "engaging wizard" that guides the user through the review process step-by-step.

## Clear Goals

1.  **Layout Overhaul (Wizard Mode)**:
    -   Replace the sidebar navigation with a **linear stepper UI**.
    -   Implement a **Top Progress Bar** to indicate journey progress.
    -   Add **"Back" and "Next" buttons** with validation logic.
2.  **Transition Effects**:
    -   Implement **snappy (150ms)** slide/fade animations between sections.
3.  **Component Polish**:
    -   **Choice/Stack Selector**: Make them look like premium, selectable cards/pills.
    -   **Kanban**: Add polish to the drag-and-drop interactions (shadows, lifting states).
    -   **TextReview**: Make it readable and focused (like Medium/Notion).
4.  **The "End" Screen**:
    -   Create a celebratory or clear summary screen before the final submit.

## Explicit Instructions for Chad

You are responsible for `ui/`.

1.  **Refactor `ui/App.tsx` (or create `ui/WizardLayout.tsx`)**:
    -   **Remove**: The Sidebar.
    -   **Add**: A centered, focused container (max-w-3xl).
    -   **Add**: A **Top Progress Bar** (segmented or continuous line).
    -   **Add**: Navigation controls (Footer with Back/Next).

2.  **Enhance Visuals (Theme: Light/Airy)**:
    -   Use a "clean, airy" aesthetic (lots of whitespace, slate-50/white backgrounds).
    -   Use `framer-motion` (or CSS) for **snappy (150ms)** transitions.

3.  **Component Updates**:
    -   Update `ChoiceSection` to support the "Card" variant (large clickable areas with icons).
    -   Update `KanbanBoard` to look less "Trello" and more "Sorting Exercise".

4.  **Verification**:
    -   Verify the flow feels like a "Journey", not a "Form".

## Constraints

-   **Runtime**: Bun + React + Tailwind.
-   **CSS**: Tailwind 4.
-   **Animations**: Snappy (<150ms).
-   **Theme**: Light/Airy (avoid heavy dark modes for now).

## Completion Checklist

-   [ ] Sidebar is gone, replaced by Stepper.
-   [ ] Top Progress bar is working.
-   [ ] Navigation buttons (Back/Next) work.
-   [ ] Snappy transitions (150ms) between steps.
-   [ ] Components look polished and consistent (Light theme).
