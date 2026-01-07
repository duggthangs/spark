# IAEE Developer & Debugging Guide

This guide explains the internal architecture of IAEE and provides diagnostic steps for debugging data flow issues.

## 1. High-Level Architecture

IAEE is split into three core layers:
- **Engine** (`/engine`): The source of truth for schemas ([schema.ts](../engine/schema.ts)) and the logic for generating markdown reports ([compiler.ts](../engine/compiler.ts)).
- **UI** (`/ui`): A React application built with Bun. It features a [WizardLayout.tsx](../ui/WizardLayout.tsx) for the sequential journey and a [PlaygroundLayout.tsx](../ui/PlaygroundLayout.tsx) for component testing.
- **CLI** (`/cli`): A local server ([server.ts](../cli/server.ts)) that serves the built UI and provides the API bridge.

## 2. The Data Flow (Crucial for Debugging)

If you see "No Selection" or "Rejected" in the output, the flow is likely broken at one of these stages:

1. **Mount**: Components must report their **initial/default state** to the parent on mount via `useEffect`.
2. **Interact**: User changes state -> Component calls `onChange` -> `App.tsx` updates `answers` state.
3. **Submit**: When the final "Submit" is clicked, `App.tsx` runs a **Transformation Pass** in `handleSubmit`.
4. **API**: The transformed `answers` object is POSTed to `/api/submit`.
5. **Compile**: The CLI server receives the JSON and passes it to `compileSummary`.

### State Transformation Mapping
| UI Section | Internal UI State (Rich) | Transformed Schema State (Flat) |
| :--- | :--- | :--- |
| `live-component` | `{ activeClasses, customCode }` | `<div class="...">...</div>` (String) |
| `kanban` | `{ columns: { id, tasks: [] }[] }` | `Record<string, string[]>` (ID Map) |
| `image-choice` | `{ selectedId: string }` | `string` (ID) |
| `code-selector` | `{ selectedId, code: Record<string, string> }` | Same (structured object) |

## 3. Debugging Super-Powers

### Playground Mode
Append `?mode=playground` to your URL or click the **🛠️ Dev Tools** button in the footer.
- **Why?**: It isolates whether a bug is in the component's internal logic or the Wizard's navigation.
- **Check**: If a component works in Playground but not in the Wizard, the issue is in the `answers` state hoisting in `App.tsx`.

### Server Logs
The CLI prints every incoming request body to the terminal with a `=== INCOMING SUBMISSION ===` header.
- **Why?**: This is the fastest way to see if the UI's "Transformation Pass" worked. If the JSON here is empty, the bug is in `App.tsx:handleSubmit`.

### Mode Injection
The server injects `<script>window.IAEE_MODE = 'runtime';</script>` into the HTML. 
- **Check**: Inspect the page source. If this is missing, the app will fall back to "Mock/Playground" mode and won't fetch real data.

## 4. How to Add a New Section
1. **Schema**: Define the section input and output in [engine/schema.ts](../engine/schema.ts).
2. **Component**: Create the UI in `ui/sections/`. Ensure it accepts `value` and `onChange`.
3. **Transformation**: Update the `handleSubmit` switch in `App.tsx` to handle the new type.
4. **Compiler**: Add a formatter in [engine/compiler.ts](../engine/compiler.ts).
