# DAST scans the deployed SPA, not a preview server

The OWASP ZAP baseline scan in `.github/workflows/dast.yml` points at a deployed
URL held in the `SPA_TARGET_URL` repository variable. It does not build
`apps/spa` and serve it in the runner, the way `e2e.yml` does. It fails on
**Medium** rather than High, and there is no active-scan plan in this repository
at all. Each of those three reads as a deviation from the obvious path, and each
follows from the same fact: `apps/spa` is a static bundle whose security surface
lives in its hosting configuration and in an API that belongs to another repo.

## Vocabulary

> **Baseline scan** — a passive ZAP run. It requests URLs and inspects the
> responses. It submits no forms and runs no attack payloads, so it is safe to
> point at a live environment.
>
> **Active scan** — an attacking ZAP run: injection, traversal, and XSS payloads
> against discovered inputs. Safe only against a target you own and intend to
> have attacked.
>
> **Plan** — a ZAP Automation Framework YAML file. It carries the target, the
> scope, the jobs, the reports, and the exit threshold, so one file is the whole
> scan and the same file runs locally and in CI.

## Why not build and serve in the runner

`vite preview` is a development static server. The headers it emits — or rather
does not emit — have nothing to do with what we ship. Production headers come
from the deployment's hosting configuration, which `vite preview` never reads.

For a static SPA, missing response headers are substantially the *entire*
baseline finding set. So a scan of `vite preview` would report missing CSP,
`Referrer-Policy`, and frame options; the fix for every one of them lands in
hosting configuration; and the scan would then report them again, forever,
because it still is not reading that layer. A gate that cannot go green gets
muted within two weeks, and meanwhile the artefact that actually serves those
headers goes unscanned.

The cost of scanning the deployment instead is that the signal lags the merge
rather than gating it. That is acceptable: this workflow gates nothing by
design, the same as `e2e.yml` ("a red run here is information, not a block").

## Why Medium and not High

`be-monorepo`'s equivalent plans fail on High, and copying that here was the
first instinct. But those are backend services with server-side logic, request
handling, and authentication — places a High can come from. A static bundle on a
CDN has none of that. Its real findings are Mediums.

A High threshold on this plan is arithmetically unable to fire. It would be
green forever, which is worse than having no gate, because a green check reads
as assurance.

## Why there is no active scan

`apps/spa` renders forms, including `/login`, but every one of them posts to an
API served from another repository behind the deployed origin's `/api` proxy.
Attacking it from here would be attacking a host this project does not own.

Which leaves an active scan with a static bundle and nothing to attack: no
injection surface, no traversal surface, no auth flow it can complete. The plan
would run for twenty minutes and find nothing. Active scanning for this system
belongs in the repository that owns the API, where it already exists.

## Consequences

- **The workflow is inert until `SPA_TARGET_URL` is set.** The job carries an
  empty-variable skip guard so it can land green. An unset variable means no
  scanning is happening, and nothing in CI will say so more loudly than a
  skipped job.
- **Local runs cannot verify a header fix.** `bun zap:spa:serve` uses
  `vite preview`, so it reproduces the app but not its hosting. Local runs are
  for exercising the plan; the deployed scan is for the answer.
- **Routes are enumerated by hand.** The app is client-rendered, so the spider
  discovers nothing and the plan carries explicit seed paths. A new route is
  invisible to the scan until someone adds it to
  `.github/security/zap/spa-baseline.yaml`.

## Considered Options

**Seed the crawl from `apps/spa/public/sitemap.xml`.** Rejected on inspection:
`scripts/gen-sitemap.ts` bakes the domain in at generation time and the
committed file contains `http://localhost:3001/`. Seeding from it puts every URL
outside the context, so the scan finds zero alerts and reports green — the exact
failure this ADR is trying to avoid elsewhere.

**Enable ZAP's `ajaxSpider`** to render the SPA and discover routes properly.
Rejected for a reason stronger than cost: executing the app's JavaScript is what
fires its XHRs at the proxied third-party backend. Not running JS is a
containment control, not a corner cut.

**A local shim that replays production response headers**, giving full local/CI
parity and making hosting config a tested artefact. Genuinely attractive, and
rejected as maintenance debt — it means owning a reimplementation of the
host's header matching semantics to buy parity that scanning the deployment
gives for free.

**`zaproxy/action-baseline` instead of `zaproxy/action-af`.** The baseline
action brings `.zap/rules.tsv` for suppression, which is simpler than the
in-plan `alertFilter`. It costs local/CI parity: the action's inputs are not a
file you can run on a laptop. One plan file that both paths execute was worth
more than a simpler suppression format.
