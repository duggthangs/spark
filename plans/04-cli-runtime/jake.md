# Plan: CLI Runtime & Integration (Phase 3)

**Status**: Approved
**Author**: Roman
**Target Agent**: Jake
**Date**: 2026-01-04

---

## Context and Background

We have the **Core Engine** (schemas/validation) and the **UI** (prototypes). Now we need the "glue" to make this a runnable tool. The **IAEE CLI** will allow users to run `iaee run experience.json`, which will start a local server, open the browser, and capture the user's interactive session.

This phase transforms the project from a "library + playground" into a "runnable application".

## Clear Goals

1.  **CLI Entry Point**: Create `cli/index.ts` that can be run via `bun cli/index.ts run <file>`.
2.  **Local Server**: Implement a `Bun.serve` instance that:
    -   Serves the static UI assets (from `ui/dist` - *build step required*).
    -   Exposes `GET /api/experience` to serve the loaded JSON.
    -   Exposes `POST /api/submit` to receive the user's decisions.
3.  **UI Integration**: Update the UI (`ui/App.tsx`) to check for an explicit mode (e.g., global window variable) to determine if it should fetch data or use mock state.
4.  **Shutdown Mechanism**: When the user submits the experience, the server should validate the result, print the summary to stdout, and immediately `process.exit(0)`.

## Explicit Instructions for Jake

You are responsible for `cli/` and wiring it to `ui/`.

1.  **Create CLI Structure**:
    -   `cli/index.ts`: The main entry point using `util.parseArgs` (native, no extra deps).
    -   `cli/server.ts`: The logic to start `Bun.serve`.

2.  **Implement Server Logic**:
    -   **State**: Load the target `experience.json` into memory at startup.
    -   **Validation**: Use `validateExperience` (from `engine/validator.ts`) to ensure the file is valid before starting.
    -   **Assets**: Serve files from `ui/dist`. This implies you (or the user) must run `bun build` on the UI first. For this task, assume we run the build command manually or add a build script.
    -   **Routes**:
        -   `GET /`: Serve `ui/dist/index.html`.
        -   `GET /assets/*`: Serve built assets.
        -   `GET /api/experience`: Return the validated experience JSON.
        -   `POST /api/submit`: Validate the payload, print it to console (JSON), and **immediately exit**.

3.  **Update UI for Real Data (Explicit Mode)**:
    -   Modify `ui/index.html` (the one served by CLI) to inject a script tag: `<script>window.IAEE_MODE = 'runtime';</script>`.
    -   Modify `ui/App.tsx`:
        -   Check `if (window.IAEE_MODE === 'runtime')`.
        -   If true, `fetch('/api/experience')`.
        -   If false (undefined), use Mock/Playground mode.

4.  **End-to-End Test**:
    -   Create a sample `examples/demo.json` with a few sections.
    -   Run `bun run build` (ensure package.json has this script for `bun build ui/index.html --outdir ui/dist`).
    -   Run `bun cli/index.ts run examples/demo.json`.
    -   Verify interactions and successful exit.

## Constraints

-   **Runtime**: Bun.
-   **No Express**: Use `Bun.serve`.
-   **Port**: Default to 3000.
-   **Dependencies**: Keep it lean (native args parsing).

## Completion Checklist

-   [ ] `package.json` has a build script for the UI.
-   [ ] `cli/index.ts` uses `util.parseArgs` to handle `run <file>`.
-   [ ] `cli/server.ts` correctly serves `ui/dist` assets.
-   [ ] `ui/App.tsx` respects `window.IAEE_MODE` flag.
-   [ ] `POST /api/submit` triggers immediate process exit.
-   [ ] Manual verification: Running the flow end-to-end works.
