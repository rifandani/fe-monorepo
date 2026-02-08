import { faker } from '@faker-js/faker'
import type { AuthSessionSchema, AuthUserSchema } from '@workspace/core/apis/better-auth'
import type { FetchHandlerResult } from 'next/experimental/testmode/playwright.js'

export type FetchHandler = (
  request: Request,
) => FetchHandlerResult | Promise<FetchHandlerResult>

export const validUser = {
  username: 'vaandani',
  email: 'vaandani@gmail.com',
  password: 'vaandani',
}

export function mockUser(): AuthUserSchema {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    emailVerified: faker.datatype.boolean(),
    image: faker.image.avatar(),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
  }
}

export function mockSession(): AuthSessionSchema {
  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    expiresAt: faker.date.future().toISOString(),
    token: faker.string.uuid(),
    ipAddress: faker.internet.ip(),
    userAgent: faker.internet.userAgent(),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
  }
}

/**
 * Mock the get-session API call to return a successful session response
 * This prevents database access during testing
 */
export function mockAuthSession() {
  return {
    url: '**/api/auth/get-session' as const,
    method: 'GET' as const,
    response: new Response(JSON.stringify({
      session: mockSession(),
      user: mockUser(),
    }), {
      status: 200,
    }) satisfies FetchHandlerResult,
  }
}

/**
 * Mock the get-session API call to return null (no session)
 * This simulates an unauthenticated state without database access
 */
export function mockNoAuthSession() {
  return {
    url: '**/api/auth/get-session' as const,
    method: 'GET' as const,
    response: null satisfies FetchHandlerResult,
  }
}

export function mockSignInWithEmail() {
  return {
    url: '**/api/auth/sign-in/email' as const,
    method: 'POST' as const,
    response: new Response(JSON.stringify({
      redirect: true,
      token: faker.string.uuid(),
      url: null,
      user: mockUser(),
    }), {
      status: 200,
    }) satisfies FetchHandlerResult,
  }
}
