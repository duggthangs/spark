# Plan: Schema Expansion (Phase 1.5)

**Status**: Approved
**Author**: Roman
**Target Agent**: Mike
**Date**: 2026-01-04

---

## Context and Background

We have successfully prototyped the UI for several new interactive experiences (Phase 2). Now we need to update the **Core Engine** (Phase 1) to support the data structures required by these new UI components.

The "Interactive Experiences Reference" (`docs/interactive-experiences-reference.md`) defines the data requirements for 13+ experience types. We need to translate these into Zod schemas.

## Clear Goals

1.  **Update Existing Schemas**:
    -   Refine `ChoiceSection` to support multi-select and custom additions.
2.  **Add New Section Schemas**: Implement Zod definitions for the newly prototyped experiences:
    -   `KanbanSection`
    -   `ImageChoiceSection`
    -   `ApiBuilderSection`
    -   `DataMapperSection`
    -   `LiveComponentSection`
    -   `NumericInputsSection` (Budget)
    -   `CardDeckSection` (Persona)
3.  **Validation**: Ensure all new types are properly exported and testable.

## Explicit Instructions for Mike

You are responsible for `engine/schema.ts` and `tests/engine.test.ts`.

1.  **Read the Source of Truth**:
    -   Read `docs/interactive-experiences-reference.md` to understand the JSON structure for each experience.

2.  **Update `engine/schema.ts`**:
    -   **Update `ChoiceSectionSchema`**:
        -   Add `multiSelect` (boolean, optional).
        -   Add `allowCustom` (boolean, optional).
    -   **Add `KanbanSectionSchema`**:
        -   `type`: `kanban`
        -   `columns`: Array of `{ id, label }`.
        -   `items`: Array of `{ id, label, columnId }`.
    -   **Add `ImageChoiceSectionSchema`**:
        -   `type`: `image-choice`
        -   `images`: Array of `{ id, src, label? }`.
    -   **Add `ApiBuilderSectionSchema`**:
        -   `type`: `api-builder`
        -   `basePath`: Optional string.
        -   `allowedMethods`: Optional array of strings (GET, POST, etc).
    -   **Add `DataMapperSectionSchema`**:
        -   `type`: `data-mapper`
        -   `sources`: Array of `{ id, label }`.
        -   `targets`: Array of `{ id, label }`.
    -   **Add `LiveComponentSectionSchema`**:
        -   `type`: `live-component`
        -   `defaultCode`: String.
    -   **Add `NumericInputsSectionSchema`**:
        -   `type`: `numeric-inputs`
        -   `items`: Array of `{ id, label, max? }`.
    -   **Add `CardDeckSectionSchema`**:
        -   `type`: `card-deck`
        -   `template`: Object defining the fields (e.g., `painPoints`, `goals`).
        -   `initialCards`: Array of partial card data.

3.  **Update `SectionSchema` Union**:
    -   Add all new schemas to the discriminated union.

4.  **Update Tests**:
    -   Add a test case in `tests/engine.test.ts` for **each** new section type to ensure it validates correctly.
    -   Use the JSON examples from `docs/interactive-experiences-reference.md` as test data.

## Constraints

-   Keep using `zod`.
-   Ensure forward compatibility (strip unknowns).
-   Do not break existing tests.

## Completion Checklist

-   [ ] `engine/schema.ts` updated with all new section types.
-   [ ] `SectionSchema` union includes new types.
-   [ ] `tests/engine.test.ts` passes with new test cases.
