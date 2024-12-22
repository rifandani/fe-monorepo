import type { MiddlewareConfig, NextRequest } from 'next/server'

/**
 * Middleware allows you to run code before a request is completed.
 * Then, based on the incoming request, you can modify the response by rewriting, redirecting, modifying the request or response headers, or responding directly.
 * Middleware runs before cached content and ANY routes are matched.
 */
export async function middleware(_request: NextRequest) {
}

export const config: MiddlewareConfig = {
  // matcher: [
  //   /*
  //    * Match all request paths except for the ones starting with:
  //    * - api (API routes)
  //    * - _next/static (static files)
  //    * - _next/image (image optimization files)
  //    * - favicon.ico, sitemap.xml, robots.txt (metadata files)
  //    */
  //   '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  // ],
}
