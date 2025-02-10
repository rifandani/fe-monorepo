import type { Role } from '@/app/models'
import type { IUserRepository } from '@/app/repositories/interfaces/IUserRepository'
import type { UsersId } from '@/lib/db/schema/public/Users'

interface CreateUserParams {
  name: string
  email: string
  role: Role
  mobile_phone_number?: string
}

export interface CreateUserResponse {
  id: UsersId
}

export function CreateUser(userRepository: IUserRepository) {
  const execute = async (
    params: CreateUserParams,
  ): Promise<CreateUserResponse> => {
    const response = await userRepository.create(params)

    return response
  }

  return { execute }
}

export default CreateUser
