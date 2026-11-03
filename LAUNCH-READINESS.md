# ASTRA Junior — Launch Readiness Update

## Release candidate

Version 1.0.0 packages the complete ten-mission trainer together with the learning and reporting tools. The artifact is a static Vite build: no backend, login, database, or runtime network dependency is required.

## Feature status

| Area | Status | Where it lives |
| --- | --- | --- |
| Ten-level mission sequence with **COMPLETE PREVIOUS LEVEL** locks | Complete | `src/game/mission-data.ts`, `src/ui/mission-ui.ts` |
| Mission Commander capstone with retry and continuation | Complete | Level 10 data, outcome actions |
| Resource consequences and cause-and-effect explanations | Complete | `src/game/mission-state.ts` |
| Eight-skill readiness scoring | Complete | `readinessScore`, readiness panel, Mission Report |
| Mission Memory log and protected/neglected systems | Complete | Mission log panel, Mission Report |
| Badges and progress summaries | Complete | Sidebar rank, badge card, outcome cards |
| Save, restore, and confirmed reset | Complete | `astraJuniorProgress`, settings store, reset dialog |
| Classroom Report with print / save-as-PDF | Complete | `src/game/classroom.ts`, classroom dialog, print stylesheet |
| Space Glossary with search and topic filters | Complete | `src/game/glossary.ts`, glossary dialog |
| Junior Mode with simpler copy and sentence starters | Complete | `src/game/junior.ts`, settings `juniorMode`, junior styles |
| NASA DONKI-style space-weather training context | Complete | `src/game/space-weather.ts`, weather panel and dialog |
| Accessibility and responsive layout | Complete | Semantic markup, focus styles, reduced motion, mobile menu |
| Deferred loading and clean source tree | Complete | Dynamic renderer/UI imports; duplicate files removed |

The space-weather notices are simulated classroom scenarios written in DONKI vocabulary. They are labelled in-product as **not live NASA data** and must not be presented as an operational feed.

## Verification

A clean checkout was prepared with `corepack pnpm install --frozen-lockfile` on Node.js 22, followed by:

- TypeScript typecheck: passed.
- Vitest: 23/23 tests passed across mission rules, preview tuning, glossary, space weather, Junior Mode, classroom reporting, and settings parsing.
- Production build: passed with the bundle size check. Initial JavaScript remains approximately 5.6 KB gzip; Three.js and the mission UI stay in deferred, cacheable chunks.
- HTTP smoke test: passed for the entry, JavaScript chunks, CSS, favicon, and mission content.
- Chromium acceptance (`pnpm acceptance` against the production preview): 37/37 checks passed, covering:
  - welcome state and Junior Mode entry point;
  - ten missions with nine locked and **COMPLETE PREVIOUS LEVEL** labels;
  - completing Level 1, badge award, and completed-state marking;
  - Mission Report and Classroom Report contents;
  - glossary search, ranking, empty state, topic filter, and Escape to close;
  - DONKI-style space-weather panel and notice disclaimer;
  - Junior Mode shell, hints, saved preference, starters, and starter insertion;
  - persistence across reload, including Junior Mode and completed missions;
  - level-specific space-weather content;
  - 390px mobile layout with zero horizontal overflow, mobile menu, and dialog fit;
  - reset returning to the welcome screen with fresh saved progress;
  - zero browser console or page errors.
- Mission flow check (`pnpm acceptance:flow`): 9/9 checks passed for Level 4 command decisions with reasoning starters, Level 2 suit loadout completion, Level 3 kit capacity and confirmation, and consequence feedback, with no browser errors.
- Print verification (`pnpm acceptance:print`): the classroom print sheet is generated and the resulting single-page PDF contains the header, readiness profile, mission sequence, evidence, and discussion prompts.

Screenshots and a sample PDF from this run are stored in `docs/verification/`.

## Known boundaries

- The release is a local static artifact. A public production deployment is not claimed; publish through the target hosting pipeline and test the resulting URL before announcing launch.
- Mission content is English-only. The starter i18n record remains available but mission copy is intentionally pinned.
- Space-weather content is educational and simplified; it does not consume the DONKI API and has no live-data mode.
- Audio is optional and never required to complete a mission.
