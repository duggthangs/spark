# Plan: Core Engine & Contracts (Phase 1)

**Status**: Approved
**Author**: Roman
**Target Agent**: Mike
**Date**: 2026-01-04

---

## Context and Background

We are building the **Interactive Agent Experience Engine (IAEE)**, a system to replace static markdown plans with interactive wizard-like experiences. The system consists of an Agent emitting JSON, a local Engine rendering it, and a human interacting with it.

This plan focuses on **Phase 1: Core Engine & Contracts**. We need to establish the foundational data structures, validation logic, and extensibility mechanisms before building the UI or CLI.

## Clear Goals

1.  **Define Zod Schemas**: Implement the `Experience` and `Section` schemas as the source of truth for the contract between Agent and Engine.
2.  **Create Section Registry**: Build a static registry to map section types (e.g., `info`, `choice`) to their definitions.
3.  **Implement Validation**: Ensure that JSON input can be rigorously validated against the schema.
4.  **Project Structure**: Ensure the directory structure supports the separation of `engine` (logic) and `ui` (presentation).

## Non-Goals

-   Building the React UI (Phase 2).
-   Building the CLI runtime (Phase 3).
-   Generating Markdown summaries (Phase 4).
-   Implementing complex conditional logic (v0).

## Explicit Instructions for Mike

You are responsible for the `engine/` directory.

1.  **Verify Project Structure**:
    -   Ensure `package.json` has `zod` installed.
    -   Ensure `tsconfig.json` is set up for Bun/TypeScript.

2.  **Implement Zod Schemas (`engine/schema.ts`)**:
    -   Define `SectionBaseSchema` with `id`, `type`, `title`, `description`.
    -   Define specific schemas:
        -   `InfoSectionSchema`: `content` (string).
        -   `TextReviewSectionSchema`: `content` (string), output `comment` (string).
        -   `ChoiceSectionSchema`: `options` (array of `{id, label}`), multi-select support if needed (v0 just single select per spec?), output `selected` (string). *Correction from spec: Spec says `choice` type. Check `init_plan.md` for exact shape.*
        -   `RankSectionSchema`: `items` (array of `{id, label}`), output `order` (array of ids).
        -   `DecisionSectionSchema`: output `decision` (approve/reject), `rationale` (string).
    -   Define `ExperienceSchema`: `title`, `intro` (optional), `sections` (array of Section).
    -   Export inferred TypeScript types.

3.  **Create Section Registry (`engine/registry.ts`)**:
    -   Create a mechanism to register these schemas.
    -   Allow looking up a schema by `type` string.

4.  **Implement Validation Logic (`engine/validator.ts`)**:
    -   Export a function `validateExperience(json: unknown): ValidationResult`.
    -   Use Zod's `safeParse`.

## Constraints and Assumptions

-   **Runtime**: Bun.
-   **Language**: TypeScript.
-   **Validation**: Zod (Standard, best DX).
-   **Strategy**: Strip unknown fields (Robust forward compatibility).
-   **Files**: All core logic goes into `engine/`.

## Completion Checklist

-   [ ] `engine/schema.ts` exists and exports `ExperienceSchema` and all Section schemas.
-   [ ] `engine/types.ts` (or within schema.ts) exports TypeScript interfaces.
-   [ ] `engine/registry.ts` maps string types to schemas.
-   [ ] `engine/validator.ts` implements `validateExperience` and returns typed errors/success.
-   [ ] `test/engine.test.ts` (or similar) validates a sample `experience.json` correctly.
