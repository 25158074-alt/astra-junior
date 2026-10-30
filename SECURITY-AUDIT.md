# ASTRA Junior Security Audit

**Audit basis:** The supplied “Vibe-Coded App Security” prompts covering exposed secrets, Supabase/RLS, and broken authorization/IDOR.

**Scope:** Repository source, static build configuration, Git history filenames, browser storage, DOM rendering, and the deployed static-app architecture.

## Executive result

ASTRA Junior is a static, client-only browser game deployed to GitHub Pages. It does not contain a backend API, Supabase project, database schema, authentication flow, private user records, privileged service credentials, or server-side endpoints that can spend an account owner’s API quota.

The audit found **no embedded secret pattern and no privileged database integration** in the scanned source/configuration files. The app stores local training progress in the browser’s `localStorage`; this is gameplay state, not a private server-side record.

This report is not a security certification. GitHub Pages response headers, repository-owner settings, third-party dependency advisories, and any future backend or analytics additions still require manual review.

## Findings and actions

### 1. Exposed API keys and secrets — No confirmed finding

**Verified:**

- No OpenAI, Anthropic, Stripe, Supabase service-role, private-key, GitHub-token, or similar credential pattern was found in the source/configuration scan.
- No client-side environment-variable convention such as `VITE_*` or `NEXT_PUBLIC_*` is used by the application.
- No backend API route or privileged network call exists. The only application fetch is for local audio assets.
- Git history contains no secret-like filenames such as `.env`, `credentials`, `secret`, or `token`.

**Hardening added:**

- Added a repeatable `pnpm security:audit` command.
- Added a restrictive Content Security Policy to `index.html`.
- Added `strict-origin-when-cross-origin` referrer policy metadata.

The CSP is delivered through a meta tag because this deployment uses GitHub Pages. `frame-ancestors` was intentionally not included in the meta policy because browsers ignore that directive when delivered this way. If the app moves to a configurable host, add `Content-Security-Policy: frame-ancestors 'none'` as an HTTP response header.

**Manual verification still required:**

- Review GitHub repository settings and collaborators.
- If any credential was ever used outside this repository or pasted into an issue, log, or chat, revoke and rotate it independently; removing a value from code does not invalidate it.

### 2. Supabase database security and RLS — Not applicable to the current architecture

**Verified:**

- No Supabase SDK, URL, schema, SQL migration, storage policy, RPC function, database view, or database query exists in the repository.
- No service-role key or database credential is present.

**Manual verification still required:**

- If a database, user accounts, cloud saves, analytics, leaderboard, or admin console is added later, introduce server-side ownership checks and RLS policies before deployment. Do not expose a service-role key in the browser.

### 3. Broken authorization and IDOR — No server-side attack surface found

**Verified:**

- There are no URL-identified private records, API routes, file downloads, exports, background actions, or authenticated resources.
- Mission progression and resources are validated by pure client-side state transitions with bounded resource values.
- User-provided call signs and explanations are escaped before being inserted into HTML. Text fields have explicit length limits.
- The app uses `localStorage` only for the current browser’s training record; it is not presented as a secure account or private cloud store.

**Limitation:**

Client-side game state can be modified by a user or browser extension. That is acceptable for a single-player educational prototype, but it must not be trusted for prizes, rankings, certificates, payments, or other security-sensitive decisions.

## Verification performed

- `pnpm security:audit` — scans source/configuration files for common embedded-secret patterns, privileged integrations, and required CSP tokens.
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm smoke`
- Manual review of DOM rendering and persistence code for unsafe HTML insertion and sensitive storage.
- Review of package dependencies and static deployment structure.

## Before future launch changes

- Review the actual diff before accepting security-related changes.
- Re-run the audit after adding any API, database, authentication, analytics, or cloud-save feature.
- Test anonymous and separate-user access if a backend is introduced.
- Keep production data out of security tests.
- Treat this audit as an engineering review, not a guarantee that all vulnerabilities are absent.
