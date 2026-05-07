import type { NextRequest } from 'next/server'
import { SERVICE_NAME } from 'src/core/constants/global'
import { createError } from 'src/core/utils/evlog'

const VALID_LEVELS = ['info', 'error', 'warn', 'debug'] as const

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')
  if (origin) {
    const originHost = new URL(origin).host
    if (originHost !== host) {
      throw createError({
        status: 403,
        message: 'Invalid origin',
        why: `Origin ${originHost} does not match host ${host}`,
        fix: 'Please use the correct origin',
      })
    }
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
