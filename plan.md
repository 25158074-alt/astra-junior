# ASTRA Junior — Implementation Plan

## Product and gameplay

Deliver **ASTRA Junior — Become Mission-Ready**, an original, responsive, English-language, browser-based educational game for students roughly ages 9–16, with parents, teachers, mentors, and judges as secondary audiences. Preserve the core lesson: **Every space-mission decision solves one problem while possibly creating another.** It is a mission trainer, not a generic dashboard or resource-survival clone. Its recurring learning loop is Briefing → Learn → Prepare → Act → Consequence → Explain → Review → Advance. Decisions expose benefits, costs, delayed risks, and understandable cause-and-effect; mistakes allow recovery and retry rather than immediate punishment.

Build the ten data-driven levels from the supplied UI brief and project guide, retaining each named level, learning objective, mission context, available choices, and badge. Level 1 teaches six outpost systems (oxygen, water, food, power, temperature, communication) with match feedback and retry; Levels 2–3 use equipment/loadout and supply constraints; Levels 4–10 use focused choice-and-consequence scenarios, with Level 10 combining earlier systems. Show six resource readouts: Oxygen, Water, Power, Food, Crew Health, and Materials. Communication, mission time, and science may be secondary status indicators.

Implement plain, bounded, learner-friendly resource rules, prevent unexplained negative values, and expose Stable / Warning / Critical with readable text. Each important action shows at least one benefit, one immediate cost, and a delayed-risk label. After selection, update resources, append an in-order mission-log record, show a cause-and-effect chain and an event/consequence, request a written or multiple-choice explanation, update skill scores, and provide feedback. Reward reasoning (priorities, risk, and trade-offs), not just survival or raw science. Show a personalized Mission Memory/readiness report with outcome, mission duration, six requested score categories, best and riskiest decision, systems protected/neglected, strongest skill, suggested next mission, unique astronaut title, and retry/continue controls. Expose the full skill profile (safety awareness, resource management, planning, science/scientific thinking, emergency response, teamwork, sustainability, decision explanation) and explain that readiness also reflects reasoning, planning, and safe teamwork.

## Design

**Design movement:** Original premium mission-control glass cockpit: deep midnight/black-blue space, clean spacecraft instrumentation, and atmospheric lunar/Martian depth without borrowing any existing franchise, game, NASA screenshot, or brand identity.

**Core principles:** (1) Fast-to-read hierarchy for young learners. (2) Every choice makes its trade-off legible. (3) Safety and recovery before punishment. (4) Scene, telemetry, story, and learning feedback share one coherent cockpit.

**Color philosophy:** Midnight navy grounds the experience; electric cyan guides attention and interaction; oxygen green signals stable life-support systems; amber signals caution and delayed risk; soft violet distinguishes science/crew information. Status always includes a text label and/or icon, never color alone.

**Layout paradigm:** Spacious three-zone mission station—progression rail, responsive mission workspace with a living outpost scene, and objective/mission brief—followed by decisions and a two-column log/readiness area. On smaller screens, collapse the progression rail into an accessible drawer, stack mission content, and retain clear action order.

**Signature elements:** (1) Original isometric Three.js lunar outpost with domes, array, tower, rover, route, horizon, stars, and telemetry pins. (2) A compact cause→effect→delayed-risk ribbon after decisions. (3) A constellation/radar readiness identity carried through the mission report.

**Interaction philosophy:** Semantic, keyboard-first controls with visible focus; choices are previewable before confirmation; feedback explains why, lets the learner recover, and records mission memory. Sound is optional and the entire experience works muted.

**Animation:** Slow star drift, gentle beacon/orbit pulse, restrained panel transitions, progress interpolation, and small card lift; warning motion is clear but not flashing. Honor `prefers-reduced-motion` and an in-game low-motion setting.

**Typography:** Preserve bundled CC0 ManusCC0 display/body faces and Noto Sans SC fallback already in the starter. Use display weight for titles, regular body copy for learning text, and monospaced/system-monospace telemetry. Do not fetch catalog fonts or replace the bundled primary face.

**Brand essence:** A mission-thinking trainer for curious junior astronauts; *precise, encouraging, resourceful*. **Brand voice:** calm Mission Control, short and transparent. Examples: “Power is limited. Protect the systems that keep your crew safe.” “Your choice saved battery now; greenhouse growth may slow later.” **Wordmark & logo:** ASTRA JUNIOR lettermark paired with an original orbit/ring-and-star CSS/SVG insignia. **Signature brand color:** electric cyan, `#63e9f2`.

## Technical approach

Continue the initialized Three.js + TypeScript + Vite project; do not replace or reinitialize the starter. Preserve its renderer, versioned settings save, keyboard/input foundation, audio toggles, source Tweak manager and Vite bridge, dependency lock, and build/test scripts. Replace the inherited sky-island game presentation with a performant, original procedural lunar/Martian outpost scene built from Three.js primitives and CSS/SVG UI; this follows the supplied scene direction and does not authorize generated or imported gameplay assets. Do not request online play, login, server, database, or multiplayer. Use ordinary static Web build (`pnpm build` → `dist`) and the ASTRA-specific HTTP smoke check.

Keep mission definitions and decision effects data-driven and separate from view rendering. Keep state transitions and bounded resource math in pure, testable functions. Persist game progress under `astraJuniorProgress` in local storage, preserving settings under the starter's existing save key; validate and recover malformed data safely. Use a single pinned English player-facing locale; no inherited locale selector or OS/browser auto-switching. Preserve the project's dictionary parity checks and bundled fonts. Include the educational purpose, setup/run steps, credits/licensing, original-art note, and development/AI assistance disclosure guidance in README/credits.

## Project structure

- `src/astra-main.ts`: initialize the existing renderer/settings/audio, mount the trainer UI, and drive the outpost scene lifecycle while preserving the existing preview bridge.
- `src/game/mission-data.ts`: reusable definitions for all ten levels, objectives, resources, events, decisions, badges, and explanation prompts.
- `src/game/mission-state.ts`: validated save model, pure resource/decision/progression/scoring functions, and local-storage persistence.
- `src/game/outpost-scene.ts`: original procedural Three.js terrain/habitat/tower/arrays/rover/route/markers, camera controls, and resource/event-reactive scene effects.
- `src/ui/mission-ui.ts`: semantic DOM layout and interactions for nav, level progression, telemetry, mission briefing, choices, explanation, log, readiness, report, reset, and help.
- `src/styles/mission.css`: responsive mission-control styling, reduced-motion rules, and focus/contrast behavior.
- `index.html` and `public/astra-favicon.svg`: ASTRA-specific title, theme metadata, game favicon, and loading/title identity.
- `tests/mission-state.test.ts` and existing project tests: verify pure resource, decision, save, and level-progression rules; retain starter checks that remain relevant.
- `README.md`, `CREDITS.md`, `plan.md`, `TODO.md`: learner-facing setup, educational framing, attribution, implementation plan, and explicit outstanding outcomes.

## Constraints and delivery

No external brand assets, heavy 3D library, or paid/generated visual/audio asset is needed for this specified original CSS/Three.js scene. Keep all buttons functional; no misleading disabled states except genuinely locked missions, with clear unlock reasons. Preserve local browser saves, responsive desktop/tablet/mobile use, keyboard and screen-reader access, contrast, reduced motion, and visible focus. Before the first complete checkpoint, create a game-specific favicon, prepare sharing/build metadata, run build and relevant tests, then save through the canonical Game/Three.js flow. Final public publishing is part of the requested delivery but remains gated on a final confirmation for the exact release.


## Four-stage implementation sequence

1. **Stage 1 — Foundation and astronaut onboarding:** establish the ASTRA Junior shell, responsive cockpit, profile/progression, accessibility settings, local-storage save/reset, original procedural outpost, telemetry, and the playable Level 1 system-matching, Level 2 spacesuit, and Level 3 mission-kit activities.
2. **Stage 2 — Core outpost operations:** implement Level 4 Lunar Power Challenge, Level 5 Radiation and EVA Mission, and Level 6 Greenhouse and Water Mission using shared decision, delayed-effect, explanation, log, and feedback components.
3. **Stage 3 — Autonomous emergencies and crew systems:** implement Level 7 Mars Communication Delay, Level 8 Dust Storm Emergency, and Level 9 Crew Health and Teamwork, including event timing, recovery opportunities, teamwork, and their badges.
4. **Stage 4 — Command capstone, memory, and release:** implement Level 10 Mission Commander Challenge; complete readiness/profile scoring, Mission Memory and report, progression/retry/continue behavior, credits and README; then run diagnostics/build/tests/smoke, fix observed defects, prepare the first complete game checkpoint, and request final confirmation before making it publicly available.

Each stage reuses shared mission/resource/decision/skill/badge/event data structures rather than duplicating level layouts. A stage is not presented as complete until its outcomes are implemented and verified. Publishing is kept separate from a verified checkpoint; the public URL and release are shown for explicit final confirmation first.
