import type { NextRequest } from 'next/server'
import { SERVICE_NAME } from 'src/core/constants/global'
import { createError } from 'src/core/utils/evlog'
import { ENV } from '@/core/constants/env'

const VALID_LEVELS = ['info', 'error', 'warn', 'debug'] as const

function getAllowedHosts(request: NextRequest): Set<string> {
  const hosts = new Set<string>()

  for (const header of ['host', 'x-forwarded-host'] as const) {
    const value = request.headers.get(header)
    if (!value)
      continue
    for (const part of value.split(','))
      hosts.add(part.trim())
  }

  hosts.add(new URL(ENV.NEXT_PUBLIC_APP_URL).host)

  return hosts
}

function isAllowedOrigin(request: NextRequest, origin: string): boolean {
  const originHost = new URL(origin).host
  if (getAllowedHosts(request).has(originHost))
    return true

  // portless (and similar proxies) serve https://<name>.localhost while Next sees localhost:<port>
  if (process.env.NODE_ENV === 'development' && originHost.endsWith('.localhost'))
    return true

  return false
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  if (origin && !isAllowedOrigin(request, origin)) {
    const originHost = new URL(origin).host
    throw createError({
      status: 403,
      message: 'Invalid origin',
      why: `Origin ${originHost} is not allowed (allowed: ${[...getAllowedHosts(request)].join(', ')})`,
      fix: 'Set NEXT_PUBLIC_APP_URL to your dev URL (e.g. https://web.localhost with portless)',
    })
  }

  const body = await request.json()

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw createError({
      status: 400,
      message: 'Invalid request body',
      why: 'Request body is not a valid object',
      fix: 'Please provide a valid request body',
    })
  }

  if (!body.timestamp) {
    throw createError({
      status: 400,
      message: 'Missing timestamp',
      why: 'Timestamp is required',
      fix: 'Please provide a timestamp',
    })
  }

  if (!body.level || !VALID_LEVELS.includes(body.level)) {
    throw createError({
      status: 400,
      message: 'Invalid level',
      why: `Level is required and must be one of the following: ${VALID_LEVELS.join(', ')}`,
      fix: `Please provide a valid level: ${VALID_LEVELS.join(', ')}`,
    })
  }

  const { service: _clientService, ...sanitizedPayload } = body

  const wideEvent = {
    ...sanitizedPayload,
    service: SERVICE_NAME,
    environment: process.env.NODE_ENV || 'development',
    source: 'client',
  }

  // eslint-disable-next-line no-console
  console.log('[CLIENT_LOG]', wideEvent)

  return new Response(null, { status: 204 })
}
