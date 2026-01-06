# Plan: UI Exploration & Prototyping

**Status**: Approved
**Author**: Roman
**Target Agent**: Chad
**Date**: 2026-01-04

---

## Context and Background

We are building the **Interactive Agent Experience Engine (IAEE)**. Mike is handling the backend schema (engine), but we need a delightful UI to render these experiences.

We have identified **13+ interactive section types** (e.g., Kanban, Live Component, API Builder) that need to be prototyped. We need a "Kitchen Sink" or "Playground" application to build and verify these components in isolation.

## Clear Goals

1.  **Setup UI Architecture**: Initialize the `ui/` directory with Bun, React, and Tailwind CSS (no Vite, use Bun serve).
2.  **Create Kitchen Sink**: Build a simple shell to toggle between different section prototypes.
3.  **Prototype "Hard" Sections**: Prioritize the complex technical ones:
    -   `LiveComponent` (JSX rendering + Tailwind controls)
    -   `ApiEndpointBuilder` (Interactive form)
    -   `DataMapper` (Visual connections)
4.  **Prototype "Visual" Sections**: Build the key visual ones:
    -   `ImageChoice` (Grid/Lightbox)
    -   `KanbanBoard` (Drag & Drop)
    -   `ChoiceWithCustomAdd` (Pills)

## Non-Goals

-   Connecting to the real engine/backend (mock data is fine).
-   Perfect visual polish (wireframe/functional is okay, but "delightful" is the goal).
-   Full implementation of all 13 types (focus on the top 6 listed above).

## Explicit Instructions for Chad

You are responsible for the `ui/` directory.

### Phase 1: Environment Setup
*Goal: Get a "Hello World" React + Tailwind app running with Bun.*

1.  **Initialize**:
    -   Create `ui/index.ts` (server), `ui/index.html`, `ui/main.tsx`.
    -   **Important**: Use "Doc" to help set up Tailwind with Bun if you are unsure. We need utility classes working.
    -   Ensure TypeScript is configured correctly.
2.  **Shell**:
    -   Create a simple sidebar navigation to switch between components.

### Phase 2: The "Live Component" (Priority High)
*Goal: A component that renders JSX strings and allows class editing.*

1.  **Component**: `ui/sections/LiveComponent.tsx`
2.  **Features**:
    -   Accept a JSX string prop (mocked).
    -   Render it (safely, or using a parser/compiler like `html-react-parser` or just standard React composition if simpler).
    -   **Tailwind Controls**: Add a panel to toggle common classes (e.g., `p-4`, `bg-blue-500`) and see the update live.

### Phase 3: The "Kitchen Sink" (Priority High)
*Goal: Build the specialized inputs.*

1.  **API Builder**:
    -   Inputs for Method (GET/POST) and Path.
    -   Visual feedback for path params (highlight `:id`).
2.  **Data Mapper**:
    -   Two lists (Source vs Target).
    -   Draw SVG lines between them (click-click or drag).

### Phase 4: Visual Delight
*Goal: prove we can do "Brilliant-style" interactions.*

1.  **Kanban**: Simple drag-and-drop (use `dnd-kit` or native HTML5 DnD).
2.  **Image Choice**: Grid of placeholders. Click to select.
3.  **Transitions**: Ensure switching between sections feels smooth.

## Constraints and Assumptions

-   **Runtime**: Bun (use `Bun.serve`).
-   **Bundling**: Native Bun (import `file.tsx` from HTML).
-   **Styling**: Tailwind CSS (via file import or Bun plugin).
-   **Libraries**: Allowed to use standard React ecosystem (dnd-kit, framer-motion) if compatible with Bun bundling.

## Completion Checklist

-   [ ] `ui/` directory is set up and `bun ui/index.ts` serves the app.
-   [ ] Tailwind styles are working.
-   [ ] "Kitchen Sink" shell exists with navigation.
-   [ ] `LiveComponent` prototype is working (rendering JSX + styling).
-   [ ] `ApiEndpointBuilder` prototype is working.
-   [ ] `DataMapper` prototype is working (visual lines).
-   [ ] `Kanban` and `ImageChoice` prototypes are working.
-   [ ] All prototypes look "decent" (not broken, basic styling).
