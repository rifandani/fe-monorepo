# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Frontend and full-stack engineers who need a production-ready React SPA baseline. Situation: starting or re-scaffolding a client-side app and wanting battle-tested patterns instead of a blank Vite shell. Job: fork/clone this template and ship a real SPA faster with fewer foundational mistakes.

## Product Purpose

`@workspace/spa` is a bulletproof React.js 19 SPA template. It exists so engineers can bootstrap an accessible, observable, i18n- and theme-aware PWA with auth scaffolding and a reusable UI kit already in place. Success means a developer can adopt the app as a starting point and trust the foundations (routing, forms, a11y components, tests, ops hooks) without rebuilding them.

## Positioning

Not a blank CRA/Vite starter and not an end-user product. The differentiator is the co-equal bar of **accessibility (React Aria / Intent UI)** and **production scaffolding** (PWA, en/id i18n, theme, observability, Playwright/unit tests, feature flags, component catalog). Neighboring templates can copy a stack list; they cannot truthfully claim this combination as the product’s reason to exist without shipping the same teaching surfaces.

## Operating Context

- Monorepo app under `apps/spa`, shared logic via `@workspace/core`.
- Local dev via Vite (`bun dev` / portless); Playwright e2e and Vitest unit tests.
- Sample product surface: login → authenticated home; gated `/master-design` component catalog (feature flag `componentCatalog`).
- Engineers evaluate and learn by reading the catalog, auth flow, SEO/observability docs, and ops wiring—not by completing an end-user business workflow.

## Capabilities and Constraints

Confirmed:

- Client-only SPA (Vite + React 19 + TanStack Router/Query/Form).
- Auth sample (login + client session check); not a full product domain.
- UI built on React Aria Components / Intent UI patterns; master-design catalog proves variants.
- PWA (vite-plugin-pwa), theme toggle, i18n (`en-US`, `id-ID`), OpenTelemetry/web-vitals hooks, feature flags.
- MIT license; package identity `@workspace/spa` / description “Bulletproof React.js 19 Template”; publisher credited in SEO as Rizeki Rifandani.

Undecided / open:

- No named commercial product, pricing, or customer segment beyond “engineers adopting the template.”
- No formal WCAG level (A/AA/AAA) committed; a11y is a hard practice constraint via React Aria, not a certified claim.
- Whether the template will stay demo-thin or grow a real domain product remains open; until then treat end-user copy and workflows as sample scaffolding.

## Brand Commitments

- Name/identity: `@workspace/spa`, “Bulletproof React.js 19 Template.”
- Author/publisher: Tri Rizeki Rifandani / Rizeki Rifandani (as used in package and SEO).
- No separate marketing brand system, logo lockup, or voice guide beyond this template framing.

## Evidence on Hand

- Runnable app: auth, home, master-design catalog, theme/language toggles.
- Docs: `docs/observability.md`, `docs/seo.md`, app `CLAUDE.md` / `README.md`.
- Tests and CI-oriented scripts (Playwright, Vitest).
- No real customer testimonials, case studies, benchmarks, or press—future work must not fabricate them.

## Product Principles

1. **Bootstrap, don’t pretend** — demo screens stay thin; foundations teach and transfer.
2. **Accessible by default** — React Aria patterns are non-regressible product truth.
3. **Ship-ready scaffolding** — PWA, i18n, theme, observability, and tests stay first-class and visible.
4. **Catalog as proof** — the component catalog is a teaching/proof surface, not optional chrome.
5. **Honest claims** — no invented customers, metrics, or WCAG certification.

## Accessibility & Inclusion

Accessibility is a hard product constraint: UI must remain keyboard- and screen-reader-usable via React Aria Components. Locales in use: English and Indonesian. No formal WCAG conformance level is claimed yet.
