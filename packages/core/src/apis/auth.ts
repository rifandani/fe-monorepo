import type { Http } from "@workspace/core/services/http";
import type { Options } from "ky";
import { z } from "zod";
// #region API SCHEMAS
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
export type AuthLoginRequestSchema = z.infer<typeof authLoginRequestSchema>;
export type AuthLoginResponseSchema = z.infer<typeof authLoginResponseSchema>;
// #endregion SCHEMAS TYPES
export const authKeys = {
  all: ["auth"] as const,
  login: (params: AuthLoginRequestSchema | undefined) =>
    [...authKeys.all, "login", ...(params ? [params] : [])] as const,
};
export const authRepositories = (http: InstanceType<typeof Http>) =>
  ({
    /**
     * POST ${env.apiBaseUrl}/auth/login
     * @throws {HTTPError} When the HTTP request fails
     * @throws {TimeoutError} When the request times out
     * @throws {ZodError} When response validation fails
     */
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
          hooks: {
            afterResponse: [
              async ({ request, response }) => {
                if (response.status === 200) {
                  const data =
                    (await response.json()) as AuthLoginResponseSchema;
                  if ("accessToken" in data) {
                    // set 'Authorization' headers
                    request.headers.set(
                      "Authorization",
                      `Bearer ${data.accessToken}`
                    );
                  }
                }
              },
            ],
          },
          json,
          ...options,
        })
        .json();
      return authLoginResponseSchema.parse(resp);
    },
  }) as const;
