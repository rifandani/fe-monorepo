import { http } from '@/core/services/http'
import type { ResourceListRequestSchema } from '@workspace/core/apis/core'
import { z } from 'zod'

export const userSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  maidenName: z.string(),
  age: z.number(),
  gender: z.union([z.literal('male'), z.literal('female')]),
  email: z.email(),
  phone: z.string(),
  username: z.string(),
  password: z.string(),
  birthDate: z.string(),
  image: z.url(),
  bloodGroup: z.string(),
  height: z.number(),
  weight: z.number(),
  eyeColor: z.string(),
  // ... and a lot more
})
export type UserSchema = z.infer<typeof userSchema>

export const getUserApiRequestSchema = z.object({
  id: z.number(),
})
export type GetUserApiRequestSchema = z.infer<typeof getUserApiRequestSchema>

export const getUserApiResponseSchema = userSchema
export type GetUserApiResponseSchema = z.infer<typeof getUserApiResponseSchema>

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params?: ResourceListRequestSchema) => [...userKeys.lists(), ...(params ? [params] : [])] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (params?: GetUserApiRequestSchema) => [...userKeys.details(), ...(params ? [params] : [])] as const,
}

export const userApi = {
  /**
   * @access public
   * @url GET ${env.apiBaseUrl}/users/${params.id}
   * @throws HTTPError | TimeoutError | ZodError
   */
  getDetail: async (params: GetUserApiRequestSchema) => {
    const json = await http.instance.get(`users/${params.id}`).json<GetUserApiResponseSchema>()

    return getUserApiResponseSchema.parse(json)
  },
} as const
