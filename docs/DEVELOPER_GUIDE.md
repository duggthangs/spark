# IAEE Developer & Debugging Guide

This guide explains the internal architecture of IAEE and provides diagnostic steps for debugging data flow issues.

## 1. High-Level Architecture

IAEE is split into three core layers:
- **Engine** (`/engine`): The source of truth for schemas ([schema.ts](../engine/schema.ts)) and the logic for generating markdown reports ([compiler.ts](../engine/compiler.ts)).
- **UI** (`/ui`): A React application built with Bun. It features:
    - [registry.tsx](../ui/registry.tsx): A central mapping of section types to React components.
    - [WizardLayout.tsx](../ui/WizardLayout.tsx): Sequential journey layout.
    - [PlaygroundLayout.tsx](../ui/PlaygroundLayout.tsx): Component testing environment.
- **CLI** (`/cli`): A local server ([server.ts](../cli/server.ts)) that serves the built UI and provides the API bridge.

## 2. The Data Flow (Crucial for Debugging)

If you see "No Selection" or "Rejected" in the output, the flow is likely broken at one of these stages:

1. **Mount**: Components should report their **initial/default state** to the parent on mount via `useEffect` (optional but recommended for consistency).
2. **Interact**: User changes state -> Component calls `onChange` -> `App.tsx` updates `answers` state for that section ID.
3. **Registry Dispatch**: `App.tsx` uses `getSectionComponent(type)` to render the appropriate component dynamically.
4. **Submit**: When the final "Submit" is clicked, `App.tsx` gathers all `answers` and `comments`.
5. **API**: The data is POSTed to `/api/submit`.
6. **Compile**: The CLI server receives the JSON and passes it to `compileSummary` in `engine/compiler.ts`.

### State Transformation Mapping
| UI Section | Internal UI State (Rich) | Transformed Schema State (Flat) |
| :--- | :--- | :--- |
| `live-component` | `string` (JSX/TSX code) | Same (captured as string) |
| `kanban` | `{ columns: { id, tasks: [] }[] }` | `Record<string, string[]>` (ID Map) |
| `api-builder` | `{ endpoints: Endpoint[] }` | Array of endpoint objects |
| `numeric-inputs` | `Record<string, number>` | Same |

## 3. Debugging Super-Powers

### Playground Mode
Append `?mode=playground` to your URL or click the **🛠️ Dev Tools** button in the footer.
- **Why?**: It isolates whether a bug is in the component's internal logic or the Wizard's navigation.
- **Check**: If a component works in Playground but not in the Wizard, the issue is usually in the `answers` state hoisting in `App.tsx` or the props mapping in `registry.tsx`.

### Server Logs
The CLI prints every incoming request body to the terminal with a `=== INCOMING SUBMISSION ===` header.
- **Why?**: This is the fastest way to see if the UI correctly captured state. If the JSON here is empty or malformed, the bug is in the component's `onChange` calls or `App.tsx:handleSubmit`.

### Mode Injection
The server injects `<script>window.IAEE_MODE = 'runtime';</script>` into the HTML. 
- **Check**: Inspect the page source. If this is missing, the app will fall back to "Mock/Playground" mode and won't fetch real data.

## 4. How to Add a New Section
1. **Schema**: Define the section input and output in [engine/schema.ts](../engine/schema.ts).
2. **Component**: Create the UI in `ui/sections/`. Ensure it accepts `data`, `value`, and `onChange`.
3. **Registry**: Add your component to the `SectionComponentRegistry` in [ui/registry.tsx](../ui/registry.tsx).
4. **Compiler**: Add a formatter in [engine/compiler.ts](../engine/compiler.ts) to handle the markdown generation for the new type.
