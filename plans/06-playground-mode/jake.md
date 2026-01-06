# Plan: Restore Playground Mode (Phase 4.5)

**Status**: Approved
**Author**: Roman
**Target Agent**: Jake
**Date**: 2026-01-04

---

## Context and Background

We converted the UI into a Wizard, but we lost the ability to quickly test individual components in isolation. The user wants to "look at them again" without clicking through a wizard.

We need to re-introduce a **Playground Mode** that renders all components in a grid or list when a specific URL parameter is present.

## Clear Goals

1.  **Playground Trigger**: Detect `?mode=playground` in the URL query parameters.
2.  **Playground UI**:
    -   Render a simple "component gallery" layout.
    -   Show every interactive section type (LiveComponent, ApiBuilder, DataMapper, Kanban, ImageChoice) on one screen.
3.  **Access**: Add a small "🛠️ Dev Tools" button in the Wizard footer (dev mode only) to toggle this mode.

## Explicit Instructions for Jake

You are responsible for `ui/App.tsx`.

1.  **Modify `ui/App.tsx`**:
    -   Add state: `const [isPlayground, setIsPlayground] = useState(false)`.
    -   On mount, check `new URLSearchParams(window.location.search).get('mode') === 'playground'`.
    -   **Render Logic**:
        -   If `isPlayground`: Render a `<PlaygroundLayout sections={MOCK_SECTIONS} />`.
        -   Else: Render `<WizardLayout ... />`.

2.  **Create `ui/PlaygroundLayout.tsx`**:
    -   A simple scrollable container.
    -   Iterate through `MOCK_SECTIONS` and render each component with a header.
    -   Add a "Back to Wizard" button.

3.  **Update `ui/WizardLayout.tsx`**:
    -   Add a small icon button in the footer: `onClick={() => window.location.search = '?mode=playground'}`.

4.  **Verification**:
    -   Visit `http://localhost:3002/?mode=playground` manually (or via button) and verify all components appear.

## Constraints

-   **Runtime**: Bun + React.
-   **Style**: Quick and dirty grid is fine.

## Completion Checklist

-   [ ] `?mode=playground` triggers the gallery view.
-   [ ] All 5 key components are visible at once.
-   [ ] Button to toggle between Wizard and Playground works.
