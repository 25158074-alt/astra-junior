# ASTRA Junior — Become Mission-Ready

ASTRA Junior is a browser-based astronaut mission trainer designed for ages 7–12, with Full Mode and classroom tools for older siblings, parents, and educators. Learners match outpost system clues, prepare for surface trips, pack limited cargo, and—through all ten progressive mission stages—make mission decisions, explain their thinking, and review consequences. The guiding idea is: **Every space-mission decision solves one problem while possibly creating another.** The simulation is for education, not a real spacecraft control system.

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

`pnpm typecheck` runs TypeScript checks; `pnpm test` runs the project's Vitest suite; `pnpm smoke` checks the built app's HTTP entry, JavaScript, CSS, and favicon after building. `pnpm security:audit` scans source/configuration for embedded secret patterns, privileged integrations, and missing CSP/referrer baseline. `pnpm verify` starts its own production preview and runs the browser acceptance, mission-flow, and classroom-print checks. The release intentionally uses a system UI font stack, so it has no external or missing font asset dependency. Progress is saved in this browser using local storage under `astraJuniorProgress`; display and Junior Mode preferences use the starter setting key `game3d.save`. Use **Reset training** in the app to clear only ASTRA training progress. Audio is optional; use the sound toggle to mute it.

## What is in the release

### Ten-mission training sequence
Levels 1–10 are playable and follow one learning loop: briefing → learn → prepare → act → consequence → explain → review → advance. Completing a mission unlocks the next one; later missions stay visibly locked with **COMPLETE PREVIOUS LEVEL** until the earlier training is passed. Each mission has its own location, objective, risk, event, checklist, badge, and outpost scene context.

| Level | Mission | Badge |
| --- | --- | --- |
| 01 | Welcome to Astronaut Training | Systems Spotter |
| 02 | Choose Your Spacesuit | Mission Preparer |
| 03 | Build Your Mission Kit | Resource Planner |
| 04 | Lunar Power Challenge | Power Guardian |
| 05 | Radiation and EVA Mission | Safety Specialist |
| 06 | Greenhouse and Water Mission | Life-Support Farmer |
| 07 | Mars Communication Delay | Independent Decision-Maker |
| 08 | Dust Storm Emergency | Storm Commander |
| 09 | Crew Health and Teamwork | Crew Leader |
| 10 | Mission Commander Challenge | Junior Mission Commander |

### Consequences, readiness, and mission memory
Every command choice lists a benefit, a cost, and a delayed risk, then applies bounded changes to oxygen, water, power, food, materials, and crew health. The app explains the cause-and-effect chain after the choice and stores it in Mission Memory. Readiness is a transparent 0–100 composite of eight skills. The implementation weights are safety 20%, resource management 18%, planning 14%, science 10%, emergency response 13%, teamwork 11%, sustainability 8%, and decision explanation 6%. safety awareness, resource management, planning, science, emergency response, teamwork, sustainability, and decision explanation. The Mission Report adds a personalised title, best and riskiest decision, protected and neglected systems, strongest skill, and recommended next training, plus retry and continue controls.

### Learning and reporting tools
- **Mission Report** — accessible dialog with readiness profile, mission memory, and next steps.
- **Classroom Report** — teacher view with readiness breakdown, mission-by-mission status, decision evidence, badges, and three discussion prompts. It can be copied as plain text or printed / saved as PDF from the browser.
- **Space Glossary** — 24 searchable terms with a simple definition for younger readers, a fuller explanation, topic filters, and the mission levels where each term appears.
- **Junior Mode** — a persistent toggle that adds a plain-language mission summary, larger text and touch targets on activity controls, and sentence starters that help learners begin a written explanation.
- **NASA DONKI space-weather training context** — each mission carries a simulated classroom notice for teaching, supplemented by an archived snapshot of 10 real CME records from the NASA CCMC DONKI dataset. The app shows the retrieval date, source links, latest cataloged CME speed, and an explicitly educational risk index; it does not present the index as a radiation dose or forecast. Level 8 deliberately contrasts a local dust storm with solar-driven hazards.

### Crew and progress
Crew status shows the three-person Team Aurora roster, and the badge card plus sidebar rank ring summarise progress and earned badges. The training rail lists all ten missions, marks the current and completed missions, and locks the rest behind the previous level.

### Save, restore, and reset
Mission progress, decisions, explanations, resources, skills, badges, current/unlocked/completed level, and report data persist automatically and are restored on reload. Malformed or missing saves fall back safely. **Reset training** asks for confirmation before clearing only ASTRA progress.

### Accessibility and responsive behaviour
Semantic header/nav/main/section/dialog elements, visible keyboard focus, labelled controls, and non-colour status text are used throughout. `prefers-reduced-motion` is respected and a reduced-motion preference persists. The layout adapts to desktop, tablet, and 390px mobile widths, with an off-canvas training menu on small screens.

## Educational purpose

The game practises systems thinking, safety awareness, planning, resource trade-offs, simple mission preparation, and reflective reasoning. Feedback is designed to explain why a system is affected and how a choice can have both immediate and later consequences. Classroom discussion prompts are written for a teacher or parent to use after play. The missions use simplified rules and are not a source of real-world operational guidance.

## Development structure

- `src/game/mission-data.ts` — mission, system, equipment, supply, resource, and skill definitions.
- `src/game/mission-state.ts` — bounded mission rules, progress, readiness score, and safe local-storage parsing.
- `src/game/glossary.ts` — glossary terms, categories, search, and per-level mapping.
- `src/game/space-weather.ts` — DONKI-vocabulary simulated training notices for all ten levels.
- `src/game/donki-data.ts` and `public/data/donki-cme-snapshot.json` — typed loader and archived real NASA CCMC DONKI CME snapshot.
- `src/game/junior.ts` — Junior Mode summaries and reasoning sentence starters.
- `src/game/classroom.ts` — teacher report builder and plain-text summary.
- `src/game/outpost-scene.ts` — original procedural Three.js outpost scene.
- `src/ui/mission-ui.ts` — semantic mission-control UI, dialogs, and the ten-level mission interactions.
- `src/styles/mission.css` — responsive cockpit styling, learning-tool styles, focus states, print layout, and reduced-motion behaviour.
- `tests/` — mission rules plus glossary, space weather, Junior Mode, classroom, and settings coverage.
- `scripts/acceptance.mjs` — Chromium acceptance pass for progression, reports, glossary, weather, Junior Mode, persistence, mobile layout, and reset.
- `scripts/flow-check.mjs` — exercises the spacesuit, mission-kit, and command-decision mission paths end to end.
- `scripts/print-check.mjs` — verifies the classroom report print sheet and generated PDF.
- `docs/verification/` — screenshots and a sample classroom-report PDF from the final verification run.
- `plan.md` and `TODO.md` — implementation plan, delivery stages, and explicit criteria.

Verification commands (the unified command starts its own preview server):

```bash
pnpm security:audit
pnpm verify
```

The project continues the initialized Three.js + TypeScript + Vite starter. It keeps the existing engine, renderer, settings store, audio facilities, preview-tuning bridge, package manager, and test/build scripts. Mission content is pinned to English.

## Credits and attribution

- ASTRA Junior mission names, structure, educational purpose, and project brief: supplied by the project author. Challenge reference: “Build a Junior Astronaut Mission Trainer,” based on the 2026 NASA Space Apps Challenge problem description supplied by the project author. **ASTRA Junior is not produced, sponsored, or endorsed by NASA.**
- Space-weather training notices are written for this activity in the vocabulary used by NASA's DONKI (Database Of Notifications, Knowledge, Information) service. The game also includes an archived snapshot of real NASA CCMC DONKI CME records at `public/data/donki-cme-snapshot.json`, retrieved 2 November 2026. The snapshot is educational context, not a live forecast, radiation-dose measurement, or operational feed. See <https://ccmc.gsfc.nasa.gov/tools/DONKI/> for the catalog information page.
- Outpost scene and UI: original procedural shapes and authored interface copy in this project; no NASA mission-control screenshots, branded assets, or external game artwork are used.
- Typography: system UI font stack with platform fallbacks; no font download is required.
- Three.js: MIT License. Rapier 3D: Apache License 2.0 (included in the supplied starter dependency; the ASTRA trainer does not rely on its platformer scene).
- AI assistance: AI tools assisted with implementation and draft educational interface copy. The project owner should review the content, adapt it as needed, and follow the event's rules for disclosure.
