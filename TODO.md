# TODO

## Planning (Completed)
- [x] Finalize experience schema contract (Zod + Strip)
- [x] Define CLI I/O contract (File Input + Hybrid Output)
- [x] Confirm markdown summary format (Full Context + Text Status)
- [x] Set session state and navigation rules (Preserve State, Validate on Next)
- [x] Define UI flow details (Minimalist, Stepper)
- [x] Plan extensibility (Static Registry)
- [x] Decide packaging targets (Host Only / Bun)
- [x] Testing strategy (UI First)

## Implementation Phases (Completed)

### Phase 1: Core Engine & Contracts
- [x] Initialize project structure (bun init)
- [x] Implement Zod schemas for `Experience` and `Section`
- [x] Create `SectionRegistry` structure
- [x] Implement `validate()` logic

### Phase 2: Interactive UI
- [x] Scaffold `WizardShell` layout
- [x] Implement Session State Management
- [x] Build core and complex section components (12+ types)
- [x] Implement UI Registry Pattern for decoupling

### Phase 3: CLI Runtime & Integration
- [x] Create CLI entry point (`cli/index.ts`)
- [x] Implement `Bun.serve` with HMR
- [x] Create API routes: `GET /api/experience` and `POST /api/submit`
- [x] Implement "Browser Open" logic

### Phase 4: Output & Delivery
- [x] Implement `SummaryCompiler` (Markdown generation)
- [x] Wire up final submission to print Summary
- [x] Configure build process

## Phase 5: Hardening & Maintenance (In Progress)
- [ ] Complete strict typing for `NumericInputs` and `CardDeck`
- [x] Refactor UI to use Registry Pattern
- [x] Extract complex component logic into custom hooks
- [x] Standardize props interfaces across all sections
- [x] Update documentation to reflect modern architecture
- [ ] Add unit tests for `SummaryCompiler` edge cases
- [ ] Optimize build size and transition performance
