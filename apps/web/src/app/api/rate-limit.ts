import { rateLimit } from '@/core/middlewares/rate-limit/rate-limit'
import type { NextRequest } from 'next/server'

export async function GET(req: NextRequest): Promise<Response> {
  await rateLimit(req)

  return new Response(JSON.stringify({ message: 'OK' }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  })
}
