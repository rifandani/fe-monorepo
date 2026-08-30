# syntax=docker/dockerfile:1
#
# Self-hosted image for @workspace/web (Next.js standalone output).
# Vercel does not use this file — it builds the app with its own pipeline and
# the default (non-standalone) output. See apps/web/docs/self-hosting.md.
#
# Build from the REPO ROOT (the monorepo is the build context):
#   docker build -f docker/web.Dockerfile -t fe-monorepo-web .

# ---------- deps: install the workspace with bun ----------
FROM oven/bun:1.3.14 AS deps
WORKDIR /repo
# Workspace manifests only, so this layer caches until a package.json changes.
COPY package.json bun.lock ./
COPY apps/web/package.json apps/web/
COPY apps/spa/package.json apps/spa/
COPY apps/expo/package.json apps/expo/
COPY packages/core/package.json packages/core/
COPY packages/typescript-config/package.json packages/typescript-config/
RUN bun install --frozen-lockfile

# ---------- builder: produce .next/standalone ----------
FROM oven/bun:1.3.14 AS builder
WORKDIR /repo
COPY --from=deps /repo/node_modules node_modules
COPY . .

# NEXT_PUBLIC_* values are inlined into the client bundle at build time, so they
# are build args, not runtime env. Server-only secrets are NOT baked in.
ARG NEXT_PUBLIC_APP_TITLE
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT
ARG NEXT_PUBLIC_OTEL_LOG_LEVEL
# Stable across every container of one release (version-skew protection).
ARG BUILD_ID
ARG DEPLOYMENT_ID

ENV BUILD_STANDALONE=1 \
    SKIP_ENV_VALIDATION=1 \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

RUN cd apps/web && bun run --bun next build

# ---------- runner ----------
FROM node:26.8.1-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs

# `outputFileTracingRoot` is the repo root, so the standalone tree mirrors it.
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/.next/standalone ./
# Static assets and public/ are deliberately excluded from the trace.
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3000
# `after()` callbacks and in-flight requests drain on SIGTERM; give the
# orchestrator a 10-30s termination grace period.
STOPSIGNAL SIGTERM
CMD ["node", "apps/web/server.js"]
