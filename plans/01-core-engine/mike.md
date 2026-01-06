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

### Layer 1: Skeleton & Mechanics
*Goal: Prove the system works with a minimal example.*

1.  **Project Setup**:
    -   Ensure `zod` is installed.
    -   Ensure `tsconfig.json` is configured for Bun.
2.  **Minimal Schema (`engine/schema.ts`)**:
    -   Define `SectionBaseSchema` (id, type, title).
    -   Define only **one** concrete section: `InfoSectionSchema` (type="info", content=string).
    -   Define `ExperienceSchema` allowing only `InfoSection`.
3.  **Core Validator (`engine/validator.ts`)**:
    -   Implement `validateExperience` using Zod's `safeParse`.
4.  **Validation**:
    -   Create `tests/engine.test.ts`.
    -   Test that a simple JSON with just an `InfoSection` passes validation.

### Layer 2: Interactive Types
*Goal: Add the interactive vocabulary.*

1.  **Expand Schema**:
    -   Add `ChoiceSectionSchema` (options: {id, label}[]).
    -   Add `RankSectionSchema` (items: {id, label}[]).
    -   Add `TextReviewSectionSchema` (content).
    -   Add `DecisionSectionSchema` (final gate).
2.  **Update Experience**:
    -   Update `ExperienceSchema` to allow all these section types in the `sections` array.
3.  **Validation**:
    -   Add a test case in `tests/engine.test.ts` with a "kitchen sink" experience containing all types.

### Layer 3: Business Logic Constraints
*Goal: Enforce the "Decision" rule.*

1.  **Refine Validation**:
    -   Update `ExperienceSchema` (or `validateExperience` logic) to enforce that **exactly one** `DecisionSection` exists.
2.  **Validation**:
    -   Add a negative test case: An experience *without* a decision section must fail validation.


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
