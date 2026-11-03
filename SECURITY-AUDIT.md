# ASTRA Junior — Security Audit and Remediation Report

## Executive summary

The uploaded project is a static Vite + TypeScript browser application. It has no backend, authentication, database, payment flow, privileged API, file upload, webhook, container, mobile package, or cloud credential configuration.

After remediation, the repository security audit, typecheck, unit tests, production build, smoke test, Chromium acceptance suite, mission-flow suite, and classroom-print check passed.

- Security score: **93/100 — Strong**
- Audit confidence: **91%**
- Critical findings: 0
- High findings: 0
- Medium findings: 0
- Low findings: 1 residual maintainability risk
- Informational findings: 2

The score is not a claim that the application is impossible to hack. It reflects the limited static-client attack surface and the controls verified in this repository.

## Architecture and trust boundaries

`Browser UI → localStorage (untrusted client persistence) → bundled mission rules/content → same-origin static assets`

No server-side trust boundary exists. Local progress, settings, call-signs, and written explanations are client-controlled and must never be treated as trusted authorization or identity data.

## Remediation completed

### SEC-001 — static browser security baseline

**Before:** `index.html` had no CSP or referrer policy.

**Fix:** Added a restrictive meta CSP with same-origin scripts, styles, images, media, fonts, and connections; disabled objects; restricted base URLs and form actions; added `strict-origin-when-cross-origin` referrer policy. Converted favicon and module paths to relative URLs for subpath hosting.

The remaining `frame-ancestors` / `X-Frame-Options` control requires an HTTP response header from the hosting platform and cannot be reliably delivered by GitHub Pages through this static source alone.

### SEC-002 — repeatable security audit

**Before:** no security audit command existed.

**Fix:** Added `scripts/security-audit.mjs` and `pnpm security:audit`. It scans source/configuration for common embedded secret patterns, privileged integration markers, and the required CSP/referrer baseline while excluding itself to avoid false positives.

Result: `security-audit: OK — scanned 25 source/config files; no embedded secret patterns or privileged integrations found; CSP/referrer baseline present.`

### SEC-003 — verification workflow

**Before:** acceptance, flow, and print scripts required a manually started preview server.

**Fix:** Added `pnpm verify` / `scripts/verify.mjs`, which starts a random local production-preview port, runs all three browser verification suites, and shuts the server down.

Result: acceptance, mission-flow, and print checks all passed with no browser errors.

### SEC-004 — real NASA data grounding

**Before:** DONKI-style notices were simulation-only.

**Fix:** Added an archived snapshot of 10 real CME records from NASA CCMC DONKI at `public/data/donki-cme-snapshot.json`, with retrieval date, source URL, and information URL. Added a typed loader and clearly labeled educational risk index in `src/game/donki-data.ts` and the weather panel.

The index is explicitly labeled as educational context, not a radiation dose, forecast, medical measure, or operational guidance. Simulated notices remain as the kid-friendly teaching layer.

### SEC-005 — DOM XSS boundary

**Status:** Low residual risk / hardening guidance.

The UI uses `innerHTML` for authored templates and escapes dynamic strings through `escapeHtml()` at the current render boundaries. No unescaped user-controlled sink was confirmed in this audit. Because future additions could regress this discipline, contributors must keep dynamic content escaped; a DOM-construction refactor is not necessary for the current static release.

### SEC-006 — dependency scan

Dependencies are lockfile-pinned and clean installation passed. A current online vulnerability database scan was not available in this audit environment; no CVE claims are made. Run the organization’s approved dependency scanner before a formal production release.

## Findings and applicability

No evidence was found for SQL/NoSQL injection, command injection, SSRF, CSRF-bearing cookie sessions, JWT misuse, broken object authorization, admin privilege escalation, unsafe deserialization, file upload abuse, webhook replay, payment manipulation, or exposed credentials. These are not applicable to the observed static architecture.

## Verification evidence

- `pnpm install --frozen-lockfile`: passed
- `pnpm typecheck`: passed
- `pnpm test`: 24/24 tests passed
- `pnpm build`: passed
- `pnpm smoke`: passed
- `pnpm security:audit`: passed
- `pnpm verify`: passed
  - 37/37 Chromium acceptance checks
  - 9/9 mission-flow checks
  - classroom print/PDF validation passed
  - zero browser console/page errors

## Remaining production boundaries

The application remains a static educational simulation. The archived DONKI data is not a live feed. Hosting must provide HTTPS and should provide response-level clickjacking protection (`Content-Security-Policy: frame-ancestors 'none'` or `X-Frame-Options: DENY`) because meta tags cannot enforce those controls reliably.
