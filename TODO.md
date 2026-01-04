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

## Implementation Phases

### Phase 1: Core Engine & Contracts
*Goal: Define the data structures and validation logic.*
- [ ] Initialize project structure (bun init)
- [ ] Implement Zod schemas for `Experience` and `Section` (Base, Info, Choice, Decision)
- [ ] Create `SectionRegistry` structure for static registration of section types
- [ ] Implement `validate()` logic for the schemas

### Phase 2: Interactive UI (The "Experience")
*Goal: Build the React frontend that users interact with.*
- [ ] Scaffold `WizardShell` layout (Title, Progress Stepper, Content Area)
- [ ] Implement Session State Management (React Context/Zustand) for tracking answers
- [ ] Build `InfoSection` component
- [ ] Build `ChoiceSection` component
- [ ] Build `DecisionSection` component (The final gate)
- [ ] Implement Navigation logic (Back/Next with validation blocks)

### Phase 3: CLI Runtime & Integration
*Goal: Connect the local machine to the web UI.*
- [ ] Create CLI entry point (`cli/run.ts`) with argument parsing
- [ ] Implement `Bun.serve` to serve the React SPA
- [ ] Create API routes: `GET /api/experience` (serve JSON) and `POST /api/submit` (receive results)
- [ ] Implement "Browser Open" logic to auto-launch the experience

### Phase 4: Output & Delivery
*Goal: Generate the artifacts and package the tool.*
- [ ] Implement `SummaryCompiler` (Transform result JSON -> Markdown)
- [ ] Wire up final submission to print Summary to Stdout/File
- [ ] Configure `bun build --compile` for single-binary output
- [ ] Manual End-to-End verification with a sample `experience.json`
