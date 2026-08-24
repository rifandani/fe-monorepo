# Deploying `@workspace/web`

The app builds for **two targets from one codebase**. The only difference is the
`BUILD_STANDALONE` env var, read in [`next.config.ts`](../next.config.ts).

| Target | Command | Output |
| --- | --- | --- |
| Vercel | `next build` (Vercel runs this itself) | default — Vercel does its own output tracing |
| Self-hosted | `BUILD_STANDALONE=1 next build` | `.next/standalone/apps/web/server.js` |

> **Never set `output: "standalone"` unconditionally.** Vercel builds Next
> natively and traces output itself; standalone is for `next start` / containers.
> Keep the flag explicit rather than sniffing `process.env.VERCEL`, so a Docker
> build opts in loudly instead of production silently taking another branch.

## Vercel

Nothing to configure — `bun web build` semantics apply and no standalone
artifacts are produced. Vercel supplies its own deployment id and build id, so
the `DEPLOYMENT_ID` / `BUILD_ID` blocks in `next.config.ts` stay inactive.

## Self-hosting with Docker

Build from the **repo root** (the monorepo is the build context):

```bash
docker build -f docker/web.Dockerfile -t fe-monorepo-web \
  --build-arg NEXT_PUBLIC_APP_TITLE="@workspace/web" \
  --build-arg NEXT_PUBLIC_APP_URL="https://my-app.com" \
  --build-arg NEXT_PUBLIC_API_BASE_URL="https://api.my-app.com/api" \
  --build-arg NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT="https://otel.my-app.com" \
  --build-arg NEXT_PUBLIC_OTEL_LOG_LEVEL="INFO" \
  --build-arg BUILD_ID="$(git rev-parse HEAD)" \
  .

docker run --rm -p 3000:3000 \
  -e DATABASE_URL="postgres://…" \
  -e BETTER_AUTH_SECRET="…" \
  fe-monorepo-web
```

Or without Docker, from `apps/web`:

```bash
bun run build:standalone && bun run start:standalone
```

### Build-time vs runtime env

This split is not cosmetic — getting it wrong bakes secrets into an image:

- **`NEXT_PUBLIC_*` are inlined into the client bundle at build time.** They are
  Docker **build args**. Changing one requires a rebuild, not a restart.
- **Server-only vars (`DATABASE_URL`, `BETTER_AUTH_SECRET`) are runtime.** They
  are injected with `-e` / secrets at container start and never copied into the
  image (`.dockerignore` excludes every `.env*`).
- The image therefore builds with `SKIP_ENV_VALIDATION=1`
  (see [`env.ts`](../src/core/constants/env.ts)) because the server schema
  cannot be satisfied at build time. Validation still runs at server boot.

Reading a server env var at **runtime** (rather than having it inlined at build)
requires dynamic rendering — `await connection()`, `cookies()`, or `headers()`
first. Otherwise the value is frozen into the prerendered output.

## Running more than one instance

Single container on persistent disk needs nothing extra. Beyond that:

| Concern | What breaks | Setting |
| --- | --- | --- |
| Version skew on rolling deploys | missing chunks, "Failed to find Server Action" | `DEPLOYMENT_ID` (wired up in `next.config.ts`) |
| Differing build ids across pods | same as above | `BUILD_ID` (e.g. the git SHA) |
| Server Action decryption across pods | "Failed to find Server Action" | `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` — one base64 32-byte key, set **at build time**, shared by every instance |
| ISR / `revalidateTag` per-pod cache | stale pages on some pods | custom `cacheHandler` + `cacheMaxMemorySize: 0`, with `refreshTags()` for cross-instance tag coordination |

The cache handler is deliberately **not** configured here — it needs a real
backing store (Redis/S3) and that is an infra decision.

## Reverse proxy

- Put nginx (or equivalent) in front rather than exposing Next directly.
- Streaming/Suspense needs buffering off. The standalone build already sends
  `X-Accel-Buffering: no` on every route (see `next.config.ts`); also confirm no
  load balancer in the chain buffers chunked responses.
- Graceful shutdown: the container uses `STOPSIGNAL SIGTERM` so in-flight
  requests and `after()` callbacks drain. Allow a 10–30s termination grace period.

## Image optimization

`next/image` optimizes at runtime with no config under `next start`. It needs
`sharp`, which Next declares as an optional dependency — the Linux binary is
installed by `bun install` inside the image and picked up by output tracing.
It is *not* installed on every dev machine (notably arm64 macOS), so a missing
`sharp` locally is not a signal about the container. If optimization fails in the
container, add `sharp` as an explicit dependency of `@workspace/web`.

## Reference

<https://nextjs.org/docs/app/guides/self-hosting>
