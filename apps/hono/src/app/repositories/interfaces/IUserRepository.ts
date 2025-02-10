import type { Role } from '@/app/models'
import type { UsersId } from '@/lib/db/schema/public/Users'

/**
 * @interface UserRepository
 */
export interface CreateUserParams {
  name: string
  email: string
  role: Role
  mobile_phone_number?: string
}

export interface CreateUserResponse {
  id: UsersId
}

export interface CountUsersParams {
  where?: {
    role?: Role
  }
}

export interface CountUsersResponse {
  count: number
}

export interface IUserRepository {
  create: (params: CreateUserParams) => Promise<CreateUserResponse>
  count: (params: CountUsersParams) => Promise<CountUsersResponse>
}
