import { faker } from "@faker-js/faker";
import type {
  AuthSessionSchema,
  AuthUserSchema,
} from "@workspace/core/apis/better-auth";
import type { FetchHandlerResult } from "next/experimental/testmode/playwright.js";

export type FetchHandler = (
  request: Request
) => FetchHandlerResult | Promise<FetchHandlerResult>;
export const validUser = {
  email: "vaandani@email.com",
  password: "vaandani",
  username: "vaandani",
};
export const mockUser = (): AuthUserSchema => ({
  createdAt: faker.date.past().toISOString(),
  email: faker.internet.email(),
  emailVerified: faker.datatype.boolean(),
  id: faker.string.uuid(),
  image: faker.image.avatar(),
  name: faker.person.fullName(),
  updatedAt: faker.date.recent().toISOString(),
});
export const mockSession = (): AuthSessionSchema => ({
  createdAt: faker.date.past().toISOString(),
  expiresAt: faker.date.future().toISOString(),
  id: faker.string.uuid(),
  ipAddress: faker.internet.ip(),
  token: faker.string.uuid(),
  updatedAt: faker.date.recent().toISOString(),
  userAgent: faker.internet.userAgent(),
  userId: faker.string.uuid(),
});
export const mockAuthSession = () => ({
  method: "GET" as const,
  response: Response.json({
    session: mockSession(),
    user: mockUser(),
  }) satisfies FetchHandlerResult,
  url: "**/api/auth/get-session" as const,
});
export const mockNoAuthSession = () => ({
  method: "GET" as const,
  response: null satisfies FetchHandlerResult,
  url: "**/api/auth/get-session" as const,
});
export const mockSignInWithEmail = () => ({
  method: "POST" as const,
  response: Response.json({
    redirect: true,
    token: faker.string.uuid(),
    url: null,
    user: mockUser(),
  }) satisfies FetchHandlerResult,
  url: "**/api/auth/sign-in/email" as const,
});
