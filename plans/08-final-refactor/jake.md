# IAEE Final Refactor Pass - Technical Implementation Plan

**Owner:** Jake (Senior Staff Engineer)
**Status:** Draft
**Last Updated:** 2026-01-05

## 1. Executive Summary
This pass transitions the IAEE codebase from "iteration mode" to a production-quality state. We are formalizing the boundary between UI components and the engine, ensuring strict type safety in the compiler, and centralizing mock data for easier development.

---

## 2. Implementation Details

### 2.1 Engine Registry Sync
We will ensure `engine/registry.ts` is perfectly synced with `engine/schema.ts`. This registry serves as the runtime lookup for validation.

**File:** `engine/registry.ts`
```typescript
import {
  InfoSectionSchema,
  ChoiceSectionSchema,
  RankSectionSchema,
  TextReviewSectionSchema,
  DecisionSectionSchema,
  KanbanSectionSchema,
  ImageChoiceSectionSchema,
  ApiBuilderSectionSchema,
  DataMapperSectionSchema,
  LiveComponentSectionSchema,
  NumericInputsSectionSchema,
  CardDeckSectionSchema,
} from "./schema";

export const SectionRegistry = {
  info: InfoSectionSchema,
  choice: ChoiceSectionSchema,
  rank: RankSectionSchema,
  "text-review": TextReviewSectionSchema,
  decision: DecisionSectionSchema,
  kanban: KanbanSectionSchema,
  "image-choice": ImageChoiceSectionSchema,
  "api-builder": ApiBuilderSectionSchema,
  "data-mapper": DataMapperSectionSchema,
  "live-component": LiveComponentSectionSchema,
  "numeric-inputs": NumericInputsSectionSchema,
  "card-deck": CardDeckSectionSchema,
} as const;

export type SectionType = keyof typeof SectionRegistry;
```

### 2.2 Mock Data Centralization
Currently, mock data is scattered or inlined in `App.tsx`. We will centralize this into `ui/mocks.ts` to allow for "unplugging" mocks easily when the real API is ready.

**New File:** `ui/mocks.ts`
```typescript
import { Experience } from "../engine/schema";

export const MOCK_EXPERIENCE: Experience = {
  id: "demo-experience",
  title: "IAEE Prototype",
  description: "Production-ready integration test",
  sections: [
    { 
      id: "intro", 
      type: "info", 
      title: "Welcome", 
      content: "This is a centralized mock experience." 
    },
    {
      id: "theme-setup",
      type: "live-component",
      title: "Branding",
      defaultCode: "export default () => <div className='p-4 bg-blue-500 text-white'>Hello</div>"
    },
    // ... all other 10 types
    { 
      id: "conclusion", 
      type: "decision", 
      title: "Finalize", 
      message: "Ready to deploy?" 
    }
  ]
};
```

**Refactor:** `ui/App.tsx`
```typescript
import { MOCK_EXPERIENCE } from './mocks';

// ... inside useEffect
if (window.IAEE_MODE !== 'runtime') {
  setExperience(MOCK_EXPERIENCE);
}
```

### 2.3 Compiler Type Safety
We will remove all `as any` assertions in `engine/compiler.ts` by using discriminated union type guards.

**File:** `engine/compiler.ts`
```typescript
import { Section, InfoSection, ChoiceSection } from "./schema";

// Type Guards
const isInfoSection = (s: Section): s is InfoSection => s.type === "info";
const isChoiceSection = (s: Section): s is ChoiceSection => s.type === "choice";

function formatSection(section: Section, result: any): string {
  if (isInfoSection(section)) {
    // section is now typed as InfoSection, section.content is safe
    return formatInfoSection(section, result);
  }
  if (isChoiceSection(section)) {
    return formatChoiceSection(section, result);
  }
  // ... continue for all types
}
```

### 2.4 Data Mapping Standardization
Components are currently returning "UI-state" which `App.tsx` has to transform. We will refactor components to return "Schema-ready" data in their `onChange` handlers.

**Example Component Refactor (`LiveComponent.tsx`):**
```typescript
// OLD: onChange({ activeClasses: [...], customCode: "..." })
// NEW:
const handleCodeChange = (newCode: string) => {
  const schemaReadyValue = `<div className="${activeClasses.join(' ')}">\n  ${newCode}\n</div>`;
  onChange(schemaReadyValue);
};
```

**Resulting `App.tsx:handleSubmit` simplification:**
```typescript
const handleSubmit = async (result: any) => {
  // No more complex switch-case transformations!
  const payload = {
    ...result,
    answers: answers // Already in schema-ready format
  };
  
  if (window.IAEE_MODE === 'runtime') {
    await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
  }
};
```

### 2.5 Build Cleanup
Ensure clean builds by wiping the `dist` directory before bundling.

**File:** `package.json`
```json
{
  "scripts": {
    "dev": "bun --hot ui/index.ts",
    "build": "rm -rf ui/dist && bun build ui/index.html --outdir ui/dist",
    "clean": "rm -rf ui/dist"
  }
}
```

---

## 3. Definition of Done
- [ ] `engine/registry.ts` contains all 12 mappings.
- [ ] `ui/mocks.ts` is created and used by `App.tsx`.
- [ ] `engine/compiler.ts` has zero `as any` occurrences.
- [ ] `App.tsx:handleSubmit` logic is reduced by >70% line count.
- [ ] `npm run build` successfully clears `ui/dist` and rebuilds.

---
**Jake**
*Principal Staff Engineer*
