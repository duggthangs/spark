# Plan: Output Generation (Phase 4.8)

**Status**: Approved
**Author**: Roman
**Target Agent**: Mike
**Date**: 2026-01-05

---

## Context and Background

Currently, the IAEE CLI dumps raw JSON to stdout upon completion. This is not useful for agents, which consume Markdown. We need to implement the "Markdown Summary Compiler" originally envisioned.

This component will take the **original Experience definition** and the **User's captured results**, and synthesize them into a human-and-machine-readable Markdown report.

## Clear Goals

1.  **Summary Compiler**: Create `engine/compiler.ts`.
2.  **Section Formatters**: Implement logic to format each section type into Markdown.
3.  **CLI Integration**: Update `cli/server.ts` to use the compiler and print Markdown on exit.

## Explicit Instructions for Mike

You are responsible for `engine/` and wiring it into `cli/`.

1.  **Create `engine/compiler.ts`**:
    -   Export `function compileSummary(experience: Experience, results: Record<string, any>): string`.
    -   Header: Title + Description.
    -   Body: Iterate through `experience.sections`.
    -   Look up the result for that section ID.
    -   Delegate to specific formatters.

2.  **Implement Formatters**:
    -   `Info`: Print title + content as context (blockquote or subheader).
    -   `Choice`: Bullet list of selected labels. (Handle multi-select).
    -   `Kanban`: Group items by column (e.g., "## Must Have\n- Item 1").
    -   `ImageChoice`: "Selected: [Label] (ID)".
    -   `ApiBuilder`: Code block `METHOD /path`.
    -   `DataMapper`: Table or list "Source -> Target".
    -   `Decision`: Emoji status (✅/❌) + Rationale block.

3.  **Update `cli/server.ts`**:
    -   In the `POST /api/submit` handler:
        -   Instead of just logging `body`, call `compileSummary(experienceData, body)`.
        -   `console.log(markdown)`.
    -   *Note*: The UI sends `result` (the raw state). Ensure the format matches what `compileSummary` expects.

4.  **Test**:
    -   Add `tests/compiler.test.ts` with a mock experience + mock results to verify Markdown output.

## Constraints

-   **Output**: Pure Markdown.
-   **Style**: Concise.

## Completion Checklist

-   [ ] `engine/compiler.ts` implemented with all section types handled.
-   [ ] `tests/compiler.test.ts` passing.
-   [ ] `cli/server.ts` outputs Markdown instead of JSON.
