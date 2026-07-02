import type { ResourceListRequestSchema } from "@workspace/core/apis/core";
import { z } from "zod";

import { http } from "@/core/services/http";

export const userSchema = z.object({
  age: z.number(),
  birthDate: z.string(),
  bloodGroup: z.string(),
  email: z.email(),
  eyeColor: z.string(),
  firstName: z.string(),
  gender: z.union([z.literal("male"), z.literal("female")]),
  height: z.number(),
  id: z.number(),
  image: z.url(),
  lastName: z.string(),
  maidenName: z.string(),
  password: z.string(),
  phone: z.string(),
  username: z.string(),
  weight: z.number(),
});
export type UserSchema = z.infer<typeof userSchema>;
export const getUserApiRequestSchema = z.object({
  id: z.number(),
});
export type GetUserApiRequestSchema = z.infer<typeof getUserApiRequestSchema>;
export const getUserApiResponseSchema = userSchema;
export type GetUserApiResponseSchema = z.infer<typeof getUserApiResponseSchema>;
export const userKeys = {
  all: ["users"] as const,
  detail: (params?: GetUserApiRequestSchema) =>
    [...userKeys.details(), ...(params ? [params] : [])] as const,
  details: () => [...userKeys.all, "detail"] as const,
  list: (params?: ResourceListRequestSchema) =>
    [...userKeys.lists(), ...(params ? [params] : [])] as const,
  lists: () => [...userKeys.all, "list"] as const,
};
export const userApi = {
  /**
   * GET ${env.apiBaseUrl}/users/${params.id}
   * @throws {HTTPError} When the HTTP request fails
   * @throws {TimeoutError} When the request times out
   * @throws {ZodError} When response validation fails
   */
  getDetail: async (params: GetUserApiRequestSchema) => {
    const json = await http.instance
      .get(`users/${params.id}`)
      .json<GetUserApiResponseSchema>();
    return getUserApiResponseSchema.parse(json);
  },
} as const;
