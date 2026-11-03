# ASTRA Junior — Pre-Remediation Security Audit

## Scope and confidence

Audit target: the uploaded `ASTRA-Junior-fixed.zip`, inspected as a static Vite + TypeScript browser application. No backend, API server, database, authentication, payments, cloud credentials, containers, mobile package, or CI workflow was found in the repository. Runtime acceptance was partially exercised; the unit/build/smoke suite passed, while the acceptance scripts require a separately running preview server.

Audit confidence: 86%. Repository and client code coverage is high; production hosting headers, deployment configuration, and current dependency vulnerability databases were not independently verified.

## Architecture and trust boundaries

The application is a static browser client. The trust boundary is:

`Browser UI → localStorage (untrusted client persistence) → bundled mission rules/content → optional static assets`

There is no server-side authorization boundary or privileged service. Local progress, settings, explanations, and call-sign data are user-controlled and must not be treated as trusted security data.

## Findings before remediation

| ID | Severity | Confidence | Finding | Status |
|---|---|---|---|---|
| SEC-001 | MEDIUM | CONFIRMED | The uploaded `index.html` has no Content Security Policy, referrer policy, or other browser security baseline. | Open |
| SEC-002 | LOW | CONFIRMED | No repeatable repository security audit command is included in `package.json`. | Open |
| SEC-003 | INFO | CONFIRMED | Acceptance and print/flow checks require a manually running preview server; invoking them directly fails with connection refused. | Open |
| SEC-004 | INFO | CONFIRMED | The release uses simulated DONKI-style notices rather than a real archived NASA DONKI dataset. This is an educational-data integrity gap, not a direct security vulnerability. | Open |
| SEC-005 | LOW | POTENTIAL | The UI uses many `innerHTML` sinks. Current dynamic values are generally escaped, but future unescaped additions could create DOM XSS. | Open; regression guard recommended |
| SEC-006 | INFO | NOT VERIFIED AGAINST CURRENT VULNERABILITY DATABASE | Dependencies are lockfile-pinned, but no online dependency vulnerability scan was run. | Open |

## Not applicable / not observed

No credentials, private keys, JWTs, passwords, database URLs, payment code, authentication routes, admin APIs, file uploads, server-side URL fetches, webhooks, GraphQL, WebSockets, shell execution, or privileged cloud integrations were found in the inspected source/configuration.

No evidence of SQL/NoSQL injection, CSRF-bearing cookie sessions, broken object authorization, SSRF, command injection, unsafe deserialization, or client-side authorization being used as a server security boundary was found. These are not applicable to the static architecture as shipped.

## Approved remediation plan

1. Add a restrictive static-app CSP and referrer policy; use relative asset paths for subpath hosting.
2. Add a repeatable security audit script and `security:audit` package command.
3. Add a unified verification command that starts a preview server and runs smoke, acceptance, flow, and print checks.
4. Add an archived real NASA CCMC DONKI CME snapshot with explicit provenance and limitations while retaining simulated notices for teaching.
5. Add a focused regression test/scan guard for escaped user-controlled values and document the remaining `innerHTML` boundary.
6. Re-run typecheck, tests, build, smoke, security audit, browser acceptance, flow, and print checks.

## Remediation approval

The project owner explicitly requested remediation after this audit. Fixes may proceed under that approval.
