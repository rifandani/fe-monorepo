# Development

- **Env**: Source of truth is local env files. When changing them, update deployment/CI project env too.
- **Port**: `3002`

```bash
# From repo root: spin up services
bun compose:up

# From apps/web
bun dev          # development env
bun dev:prod     # production env
```
