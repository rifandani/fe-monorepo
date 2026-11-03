import type { AuthLoginRequestSchema } from "@workspace/core/auth/schemas";

export const authKeys = {
  all: ["auth"] as const,
  login: (params?: AuthLoginRequestSchema) =>
    [...authKeys.all, "login", ...(params ? [params] : [])] as const,
};
