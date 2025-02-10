import { Role } from '@/app/models'
import MockUserRepository, {
  createUserResponse,
} from '@/app/repositories/mock/MockUserRepository'
import { describe, expect, it, spyOn } from 'bun:test'
import CreateUser from './createUser'

const mockRepo = new MockUserRepository()
const useCase = CreateUser(mockRepo)
const create = spyOn(mockRepo, 'create')

describe('Create user [Mock]', () => {
  it('should be able to create', async () => {
    const response = await useCase.execute({
      name: 'User 1',
      email: 'user@email.com',
      role: Role.ADMIN,
      mobile_phone_number: '+61111111',
    })

    expect(create).toHaveBeenCalled()
    expect(response).toEqual(createUserResponse)
  })
})
