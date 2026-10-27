# ASTRA Junior — Become Mission-Ready

ASTRA Junior is a browser-based astronaut mission trainer for students roughly ages 9–16. Learners match outpost system clues, prepare for surface trips, pack limited cargo, and—through all ten progressive mission stages—make mission decisions, explain their thinking, and review consequences. The guiding idea is: **Every space-mission decision solves one problem while possibly creating another.** The simulation is for education, not a real spacecraft control system.

## Run locally

Requirements: Node.js and pnpm. From this project directory:

```bash
pnpm install
pnpm dev
```

Open the local URL printed by Vite. For a production build:

```bash
pnpm build
pnpm preview
```

`pnpm typecheck` runs TypeScript checks; `pnpm test` runs the project's Vitest suite; `pnpm smoke` checks the built app's HTTP entry, JavaScript, CSS, and favicon after building. The release intentionally uses a system UI font stack, so it has no external or missing font asset dependency. Progress is saved in this browser using local storage under `astraJuniorProgress`. Use **Reset training** in the app to clear only ASTRA training progress. Audio is optional; use the sound toggle to mute it.

## Educational purpose

The game practices systems thinking, safety awareness, planning, resource trade-offs, simple mission preparation, and reflective reasoning. Feedback is designed to explain why a system is affected and how a choice can have both immediate and later consequences. The missions use simplified rules and are not a source of real-world operational guidance.

## Development structure

- `src/game/mission-data.ts` — reusable mission, system, equipment, supply, resource, and skill definitions.
- `src/game/mission-state.ts` — bounded mission rules, progress, accessibility-friendly statuses, readiness score, and safe local-storage parsing.
- `src/game/outpost-scene.ts` — original procedural Three.js outpost scene.
- `src/ui/mission-ui.ts` — semantic mission-control UI and complete ten-level mission interactions.
- `src/styles/mission.css` — responsive cockpit styling, focus states, and reduced-motion behavior.
- `plan.md` and `TODO.md` — implementation plan, four stages, and explicit delivery criteria.

The project continues the initialized Three.js + TypeScript + Vite starter. It keeps the existing engine, renderer, settings store, audio facilities, preview-tuning bridge, package manager, and test/build scripts. Mission content is pinned to English.

## Credits and attribution

- ASTRA Junior mission names, structure, educational purpose, and project brief: supplied by the project author. Challenge reference: “Build a Junior Astronaut Mission Trainer,” based on the 2026 NASA Space Apps Challenge problem description supplied by the project author. **ASTRA Junior is not produced, sponsored, or endorsed by NASA.**
- Outpost scene and UI: original procedural shapes and authored interface copy in this project; no NASA mission-control screenshots, branded assets, or external game artwork are used.
- Typography: system UI font stack with platform fallbacks; no font download is required.
- Three.js: MIT License. Rapier 3D: Apache License 2.0 (included in the supplied starter dependency; the ASTRA trainer does not rely on its platformer scene).
- AI assistance: AI tools assisted with implementation and draft educational interface copy. The project owner should review the content, adapt it as needed, and follow the event's rules for disclosure.
