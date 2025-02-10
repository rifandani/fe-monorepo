import type { Role } from '@/app/models'
import type { IUserRepository } from '@/app/repositories/interfaces/IUserRepository'

interface CountUsersParams {
  where?: {
    role?: Role
  }
}

interface CountUsersResponse {
  count: number
}

export class CountUsers {
  constructor(private userRepository: IUserRepository) {}

  execute = async (params: CountUsersParams): Promise<CountUsersResponse> => {
    const response = await this.userRepository.count(params)

    return response
  }
}

export default CountUsers
