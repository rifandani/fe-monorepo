import type { MiddlewareConfig, NextRequest } from 'next/server'
import { createMiddleware, defaults } from '@nosecone/next'

// const noseconeOptionsWithToolbar: NoseconeOptions = withVercelToolbar({
//   ...defaults,
//   // disabled because we depend on iconify, next-themes, etc...
//   contentSecurityPolicy: false,
// });
/**
 * Remove `export const config` to ensures the headers are applied to all requests
 * NOTE: should opt-out of static generation for this to work
 */
const securityMiddleware = createMiddleware({
  ...defaults,
  // disabled because we depend on iconify, next-themes, etc...
  contentSecurityPolicy: false,
})

/**
 * Middleware allows you to run code before a request is completed.
 * Then, based on the incoming request, you can modify the response by rewriting, redirecting, modifying the request or response headers, or responding directly.
 * Middleware runs before cached content and ANY routes are matched.
 *
 * Make sure middleware runs FAST, try to use it for:
 * - Security headers
 * - Basic redirects based on URL patterns
 * - Geolocation-based routing
 * - Simple request/response modifications
 *
 * Other than that, use RSC to make it SECURE:
 * - Authentication validation
 * - Database queries
 * - Complex business logic
 * - Third-party integrations
 */
export async function middleware(_: NextRequest) {
  return securityMiddleware()
}

export const config = {
  runtime: 'nodejs', // stable since v15.5
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico, sitemap.xml, robots.txt (metadata files)
   */
  matcher: [
    '/((?!api|_next/static|_next/image|ingest|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|sitemap.xml|robots.txt).*)',
  ] as MiddlewareConfig['matcher'],
}
