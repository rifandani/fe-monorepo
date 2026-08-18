# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Frontend and full-stack engineers who need a production-ready Next.js App Router baseline. Situation: starting or re-scaffolding a fullstack web app and wanting battle-tested auth, data, and ops patterns instead of a blank `create-next-app` shell. Job: fork/clone this template and ship a real Next.js app faster with fewer foundational mistakes.

## Product Purpose

`@workspace/web` is a bulletproof Next.js 16 template. It exists so engineers can bootstrap an accessible, observable, SEO-aware PWA with Better Auth, Drizzle persistence, and a reusable React Aria UI kit already wired. Success means a developer can adopt the app as a starting point and trust the foundations (RSC/App Router, auth, DB, SEO, a11y components, tests, observability) without rebuilding them.

## Positioning

Not a blank Next starter and not an end-user product. The differentiator is the co-equal bar of **accessibility (React Aria)** and **fullstack production scaffolding** (Better Auth, Drizzle, PWA, SEO, observability, Playwright/unit tests). Sibling `@workspace/spa` covers client-only React; this app owns the server-backed Next path. Neighboring templates can list a stack; they cannot truthfully claim this combination as the reason to exist without shipping the same teaching surfaces.

## Operating Context

- Monorepo app under `apps/web`, shared logic via `@workspace/core`.
- Local dev via Next (`bun web` / `bun dev` with portless); Drizzle migrate/seed; Playwright e2e (local DB; CI e2e limited by auth mocking) and Vitest unit tests.
- Sample product surface: register → login → authenticated home; demo user from seed (`vaandani@email.com`).
- Engineers evaluate and learn by reading auth/DB wiring, SEO/observability/database docs, and ops hooks—not by completing an end-user business workflow.
- Auth OpenAPI reference available at the app’s `/api/auth/reference` in local/dev.

## Capabilities and Constraints

Confirmed:

- Fullstack Next.js 16 App Router (RSC, route handlers, server-oriented auth).
- Better Auth + Drizzle schema/migrations/seed; sample login and register.
- UI built on React Aria Components / Intent UI patterns.
- PWA assets, SEO (metadata, OG, sitemap, robots), OpenTelemetry/observability hooks.
- MIT license; package identity `@workspace/web` / description “Bulletproof Next.js 16 Template”; author Tri Rizeki Rifandani.

Undecided / open:

- No named commercial product, pricing, or customer segment beyond “engineers adopting the template.”
- No formal WCAG level (A/AA/AAA) committed; a11y is a hard practice constraint via React Aria, not a certified claim.
- Whether the template will stay demo-thin or grow a real domain product remains open; until then treat end-user copy and workflows as sample scaffolding.
- Root README notes a possible future move of `web` into a separate fullstack monorepo—undecided; do not design as if that split already happened.

## Brand Commitments

- Name/identity: `@workspace/web`, “Bulletproof Next.js 16 Template.”
- Author: Tri Rizeki Rifandani.
- No separate marketing brand system, logo lockup, or voice guide beyond this template framing.

## Evidence on Hand

- Runnable app: register, login, home; seeded demo user documented in README.
- Docs: `docs/database.md`, `docs/observability.md`, `docs/seo.md`, app `CLAUDE.md` / `README.md`.
- Tests and scripts (Playwright, Vitest, drizzle, auth:gen).
- No real customer testimonials, case studies, benchmarks, or press—future work must not fabricate them.

## Product Principles

1. **Bootstrap, don’t pretend** — demo screens stay thin; foundations teach and transfer.
2. **Accessible by default** — React Aria patterns are non-regressible product truth.
3. **Ship-ready fullstack scaffolding** — auth, DB, PWA, SEO, observability, and tests stay first-class and visible.
4. **Server truth is part of the product** — App Router / Better Auth / Drizzle wiring is teaching surface, not incidental plumbing.
5. **Honest claims** — no invented customers, metrics, or WCAG certification.

## Accessibility & Inclusion

Accessibility is a hard product constraint: UI must remain keyboard- and screen-reader-usable via React Aria Components. No formal WCAG conformance level is claimed yet.
