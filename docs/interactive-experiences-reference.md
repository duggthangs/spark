# Interactive Experience Concepts

**Purpose**: A collection of interactive experience concepts for the Interactive Agent Experience Engine (IAEE). This document serves as inspiration and reference for UI exploration (Chad) and schema design (Mike).

**Status**: Draft
**Date**: 2026-01-04

---

## Overview

This document outlines interactive experiences that make reviewing plans delightful and engaging. Each experience is designed to be fun, educational, and productive—inspired by Brilliant.org's "learning by doing" philosophy.

---

## Experience Catalog

### 1. Stack Selector ✨

**Use case**: Planning technical stack for a new feature.

**Interactivity**:
- Pre-defined Pills: Render technology options as clickable "pills" (React, Vue, Svelte, etc.)
- Multi-select: User can select multiple pills
- Custom Add: "Add custom" button opens a simple text field for entering a tech name + URL
- Visual Feedback: Selected pills highlight/activate; new pills animate in

**Data Capture**:
```json
{
  "selected": ["react", "typescript", "tailwind"],
  "custom": [
    { "label": "My Library", "url": "https://github.com/user/lib" }
  ]
}
```

**Section Type Required**: `ChoiceWithCustomAdd`

---

### 2. Kanban Prioritization ✨

**Use case**: Organizing feature backlogs.

**Interactivity**:
- Column-based: Two or three columns (e.g., "Must Have", "Nice to Have", "Deferred")
- Drag & Drop: Cards move between columns
- Toggle State: Click to cross out (strikethrough) within a column
- Reorder: Drag to reorder within a column

**Data Capture**:
```json
{
  "items": [
    { "id": "search", "label": "Search", "column": "must-have", "crossed": false },
    { "id": "export", "label": "Export", "column": "nice-to-have", "crossed": true }
  ]
}
```

**Section Type Required**: `KanbanBoard`

---

### 3. Budget Allocator ✨

**Use case**: Distributing resources across initiatives.

**Interactivity**:
- Sliders or Input: Each item has a numeric input field
- Real-time Totals: Dynamic bar showing % allocated vs. remaining
- Validation: Block submission if total != 100% or over budget

**Data Capture**:
```json
{
  "allocations": [
    { "id": "feature-a", "label": "Feature A", "value": 40 },
    { "id": "feature-b", "label": "Feature B", "value": 35 },
    { "id": "feature-c", "label": "Feature C", "value": 25 }
  ]
}
```

**Section Type Required**: `NumericInputs`

---

### 4. Timeline Sequencing ✨

**Use case**: Planning phases/milestones.

**Interactivity**:
- Draggable Cards: Each phase represented as a card
- Dependencies: Show arrows or visual indicators if phase B depends on A
- Date Range: Each card has a date picker

**Data Capture**:
```json
{
  "phases": [
    { "id": "phase-1", "label": "Phase 1", "order": 0, "startDate": "2025-01-01" },
    { "id": "phase-2", "label": "Phase 2", "order": 1, "startDate": "2025-02-01" }
  ]
}
```

**Section Type Required**: Composite of existing `Rank` with date metadata

---

### 5. Persona Selector ✨

**Use case**: Defining target users.

**Interactivity**:
- Card Deck UI: Each persona shown as an expandable card
- Inline Editing: Click to expand and fill out details directly within the card:
  - Name
  - Avatar (emoji or upload)
  - Pain points (multi-line)
  - Goals (list)
  - Behavioral notes
- Delete/Add: Add new card from template; delete empty cards
- Multi-select: Click to activate/deactivate
- Priority Drag: Drag to order by importance

**Data Capture**:
```json
{
  "personas": [
    {
      "id": "admin",
      "name": "Admin",
      "avatar": "👮",
      "painPoints": "Too many clicks to perform simple tasks",
      "goals": ["Faster workflows", "Better visibility"]
    }
  ]
}
```

**Section Type Required**: `CardDeck`

---

### 6. Confidence Slider ✨

**Use case**: Gauging stakeholder confidence in a plan.

**Note**: Confidence should ideally come from LLM. If confidence is low, the LLM will iterate rather than approve. This experience may be more useful for capturing **human** confidence after reviewing LLM output.

**Interactivity**:
- Slider: Range input (0-100%) with emoji feedback at positions (😟 -> 😐 -> 😊)
- Justification: Required comment field if confidence < 50%

**Data Capture**:
```json
{
  "confidence": 75,
  "comment": "Most risks are mitigated, but timeline is tight."
}
```

**Section Type Required**: `Slider` + `TextReview`

---

### 7. Logic Tree / Scenario Navigator ✨

**Use case**: Working through complex decision flows.

**Interactivity**:
- Node-based UI: Each decision point is a node with a question
- Branching Paths: Click a choice to reveal next question
- Backtrack Navigation: Can jump back to any previous node
- Path Summary: Sidebar shows your path taken so far (A → B → D)

**Data Capture**:
```json
{
  "path": ["q1-a", "q2-b", "q3-d"],
  "decisions": {
    "q1-a": "Use Postgres",
    "q2-b": "Single region",
    "q3-d": "Read replica"
  }
}
```

**Section Type Required**: `DecisionTree`

---

### 8. Concept Matcher ✨

**Use case**: Linking related items together.

**Interactivity**:
- Drag-and-Drop: Drag concept cards to matching definition buckets
- Visual Cues: Correct matches snap with green glow; incorrect bounce back
- Multiple Associations: One concept can map to multiple definitions
- Undo: "Reset" button to start over

**Data Capture**:
```json
{
  "matches": [
    { "conceptId": "c1", "definitionId": "d1" },
    { "conceptId": "c2", "definitionId": "d2" },
    { "conceptId": "c3", "definitionId": "d1", "d2" } // multi-match
  ]
}
```

**Section Type Required**: `ConceptMatcher`

---

### 9. Constraint Builder ✨

**Use case**: Defining requirements incrementally.

**Interactivity**:
- Add Constraint Cards: Click "+" to add a constraint card
- Editable Fields: Each card has type dropdown + value input
- Visual Preview: As constraints build, show a live diagram or code snippet updating
- Conflict Detection: Highlight red if constraints are contradictory

**Data Capture**:
```json
{
  "constraints": [
    { "id": "c1", "type": "max-users", "value": 1000 },
    { "id": "c2", "type": "region", "value": "us-west" }
  ]
}
```

**Section Type Required**: `ConstraintBuilder`

---

### 10. Image Choice / Design Review ✨

**Use case**: Reviewing visual regression tests or design variants.

**Interactivity**:
- Grid/Carousel view of images
- Lightbox inspection (zoom/pan)
- Voting/Selection mechanism
- Annotation (optional)

**Data Capture**:
```json
{
  "selectedImageId": "variant-b",
  "annotations": [
    { "x": 100, "y": 200, "note": "Fix padding here" }
  ]
}
```

**Section Type Required**: `ImageChoice`

---

### 11. API Endpoint Builder ✨

**Use case**: Defining API contracts interactively.

**Interactivity**:
- HTTP Method selector
- Path input with param highlighting
- Request/Response schema builder

**Data Capture**:
```json
{
  "method": "POST",
  "path": "/api/v1/users",
  "bodySchema": { "type": "object", "properties": { "name": "string" } }
}
```

**Section Type Required**: `ApiEndpointBuilder`

---

### 12. Live Component Composer (JSX/Tailwind) ✨

**Use case**: Refining UI layouts with real code.

**Interactivity**:
- Live Preview of React components
- Tailwind class toggle/editor
- Component slotting (drag & drop sub-components)
- Viewport toggle (mobile/desktop)

**Data Capture**:
```json
{
  "jsx": "<Card className='p-4 bg-slate-50'><HeroImage /></Card>",
  "props": { "className": "p-4 bg-slate-50" }
}
```

**Section Type Required**: `LiveComponent`

---

### 13. Data Mapper ✨

**Use case**: Linking data sources to UI props.

**Interactivity**:
- Visual nodes for Source and Target
- Draggable connection lines
- Transformation functions (e.g. date formatting)

**Data Capture**:
```json
{
  "mapping": [
    { "source": "user.created_at", "target": "Profile.joinDate", "transform": "date" }
  ]
}
```

**Section Type Required**: `DataMapper`

---

### 14. Code Selector

**Use case**: Choosing between implementation approaches, algorithms, or code patterns.

**Interactivity**:
- Tab bar with radio buttons showing code options (2-5 options)
- Editable code area for customization
- Per-tab reset button to restore original code
- Visual indicator (amber dot) when code is modified
- Language badge showing configured language

**Data Capture**:
```json
{
  "selectedId": "recursive",
  "code": {
    "recursive": "function fib(n) { if (n <= 1) return n; return fib(n-1) + fib(n-2); }",
    "iterative": "function fib(n) { let [a, b] = [0, 1]; for (...) ... }",
    "memoized": "const memo = {}; function fib(n) { ... }"
  }
}
```

**Section Type Required**: `CodeSelector`

---

## Section Type Requirements (Consolidated)

| Experience | Section Type Required | Status |
|------------|----------------------|--------|
| Stack Selector | `ChoiceWithCustomAdd` | New |
| Kanban Prioritization | `KanbanBoard` | New |
| Budget Allocator | `NumericInputs` | New |
| Timeline Sequencing | `Rank` (with metadata) | Existing, extend |
| Persona Selector | `CardDeck` | New |
| Confidence Slider | `Slider` + `TextReview` | New |
| Logic Tree | `DecisionTree` | New |
| Concept Matcher | `ConceptMatcher` | New |
| Constraint Builder | `ConstraintBuilder` | New |
| Image Choice | `ImageChoice` | New |
| API Endpoint Builder | `ApiEndpointBuilder` | New |
| Live Component | `LiveComponent` | New |
| Data Mapper | `DataMapper` | New |
| Code Selector | `CodeSelector` | New |

---

## Composite Patterns

Some experiences can be built from combinations of simpler types:

- **Timeline Sequencing** = `Rank` + date metadata
- **Persona Selector** = `Choice` (multi) + `Rank` + inline card editing
- **Confidence Slider** = `Slider` + `TextReview`

---

## Design Principles

All experiences should follow these core principles:

1. **Delightful Interactions**: Animations, hover states, and visual feedback make the experience engaging.
2. **Progressive Disclosure**: Don't overwhelm users—reveal complexity as they interact.
3. **Instant Feedback**: Show results immediately; no page reloads or waiting states.
4. **Forgiving Navigation**: Allow backtracking, undo, and re-do without penalties.
5. **Accessible First**: Keyboard navigation, screen reader support, and high contrast options.

## Next Steps

1. **Chad (UX/UI)**: Explore and prototype the visual patterns for these experiences.
2. **Mike (Contracts)**: Define the schema contracts for the new section types.
3. **Validation**: Test the experiences with sample data to ensure they capture the right information.
