import type { Http } from "@workspace/core/services/http";
import type { Options } from "ky";
import { z } from "zod";
// #region API SCHEMAS
// Stryker disable all: Zod constraint/message mutants — ADR-0001 puts plain
// Zod shapes out of test scope; this file stays allowlisted for authKeys /
// authRepositories only (ADR-0003 accepted noise).
export const authLoginRequestSchema = z.object({
  expiresInMins: z.number().optional(),
  password: z.string().min(6, "password must contain at least 6 characters"),
  username: z.string().min(3, "username must contain at least 3 characters"),
});
export const authLoginResponseSchema = z.object({
  accessToken: z.string(),
  email: z.email(),
  firstName: z.string(),
  gender: z.union([z.literal("male"), z.literal("female")]),
  id: z.number().positive(),
  image: z.url(),
  lastName: z.string(),
  refreshToken: z.string(),
  username: z.string(),
});
// #endregion API SCHEMAS
// #region SCHEMAS TYPES
// Stryker restore all
export type AuthLoginRequestSchema = z.infer<typeof authLoginRequestSchema>;
export type AuthLoginResponseSchema = z.infer<typeof authLoginResponseSchema>;
// #endregion SCHEMAS TYPES
export const authKeys = {
  all: ["auth"] as const,
  login: (params?: AuthLoginRequestSchema) =>
    [...authKeys.all, "login", ...(params ? [params] : [])] as const,
};
export const authRepositories = (http: InstanceType<typeof Http>) =>
  ({
    login: async (
      {
        json,
      }: {
        json: AuthLoginRequestSchema;
      },
      options?: Options
    ) => {
      const resp = await http.instance
        .post("auth/login", {
          json,
          ...options,
        })
        .json();
      return authLoginResponseSchema.parse(resp);
    },
  }) as const;
