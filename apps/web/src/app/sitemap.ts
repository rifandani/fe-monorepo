import type { MetadataRoute } from 'next'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const APP_DIR = path.dirname(fileURLToPath(import.meta.url))
const url = new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://web.localhost')

const SKIP_DIRS = new Set(['api'])

function collectPageRoutes(dir: string, segment = ''): string[] {
  const routes: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('_') || entry.name.startsWith('('))
      continue
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name))
        continue
      routes.push(
        ...collectPageRoutes(fullPath, `${segment}/${entry.name}`),
      )
      continue
    }
    if (entry.name === 'page.tsx' || entry.name === 'page.ts') {
      routes.push(segment || '/')
    }
  }
  return routes
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = collectPageRoutes(APP_DIR)
  return routes.map(route => ({
    url: new URL(route, url).href,
    lastModified: new Date(),
  }))
}
