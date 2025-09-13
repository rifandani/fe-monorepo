import type { NextRequest } from 'next/server'
import { rateLimit } from '@/core/middlewares/rate-limit/rate-limit'

export async function GET(req: NextRequest): Promise<Response> {
  await rateLimit(req)

  return new Response('Not implemented', { status: 501 })
}
