# Release notes

## v1.0.0 — Launch-ready learning release

This release packages the complete ASTRA Junior mission trainer with the cause-and-effect mission system, readiness scoring, Mission Memory, badges, the command capstone, browser persistence, and the learning and reporting tools.

### Missions and progression
- Ten playable missions with distinct objectives, risks, events, scenes, and badges.
- Level locking now reads **COMPLETE PREVIOUS LEVEL**; completing a mission unlocks the next through Level 10.
- Mission Commander capstone (Level 10) with retry and continuation flow, and a Junior Mission Commander badge.

### Decisions and consequences
- Every command choice shows a benefit, an immediate cost, and a delayed risk.
- Choices change oxygen, water, power, food, materials, and crew health, with bounded values and a recovery opportunity.
- Cause-and-effect chains explain what improved, what worsened, and what may happen later.
- Written explanations are required and saved with the decision.

### Readiness and reflection
- A transparent 0–100 readiness score across eight skills.
- Mission Report with personalised title, readiness profile, best and riskiest decision, protected and neglected systems, strongest skill, and recommended next training.
- Mission Memory log with chronological entries, View all / Recent, and Clear.

### Learning tools (new in this release)
- **Classroom Report**: teacher-facing summary with mission sequence, readiness breakdown, decision evidence, badges, discussion prompts, copy-to-clipboard, and print / save-as-PDF layout.
- **Space Glossary**: 24 searchable terms, topic filters, simple and detailed definitions, and level references. Results rank term matches first and current-mission terms higher.
- **Junior Mode**: persistent toggle, plain-language mission summaries, larger activity text and touch targets, and reasoning sentence starters.
- **NASA DONKI space-weather training context**: ten simulated DONKI-style notices, one per mission, covering flares, CMEs, geomagnetic storms, solar energetic particles, and radio blackouts. Includes a clear "not live NASA data" disclaimer and a local-hazard comparison for the dust-storm mission.

### Persistence and settings
- Mission progress, decisions, explanations, resources, skills, badges, and level state persist under `astraJuniorProgress` and restore on reload.
- Junior Mode, reduced motion, audio, and display preferences persist in the starter settings record.
- Reset training requires confirmation and clears only ASTRA progress.
- Malformed or missing stored data recovers to a safe state.

### Interface and accessibility
- Responsive desktop, tablet, and mobile layouts, including an off-canvas training menu.
- Keyboard focus states, semantic landmarks, labelled dialogs, and non-colour status text.
- Reduced-motion support, with the preference persisted.
- Removed duplicate source files and invalid font references; the release uses a system font stack.

### Verification
- TypeScript typecheck: passed.
- Vitest: 23/23 tests passed (mission rules, tuning, glossary, space weather, Junior Mode, classroom report, settings parsing).
- Production build: passed (`dist` emitted, bundle size check passed).
- Chromium acceptance: 37/37 checks passed across progression, lock labels, reports, glossary search and filters, space-weather notices, Junior Mode persistence and starters, save/restore, mobile layout, Escape handling, and reset.
- Classroom report print sheet and generated PDF verified (single page, complete content).

### Compatibility notes
- Static Vite application; no backend, login, database, or network service is required at runtime.
- External links are attribution only; the game itself loads no remote assets.
- The space-weather notices are classroom simulations and must not be presented as live NASA data.
