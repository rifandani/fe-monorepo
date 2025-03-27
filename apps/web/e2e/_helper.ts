import type { AuthLoginResponseSchema } from '@workspace/core/apis/auth'
import { faker } from '@faker-js/faker'

export function seedUser(): AuthLoginResponseSchema {
  return {
    id: faker.number.int(),
    username: faker.person.middleName(),
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    gender: faker.helpers.arrayElement(['male', 'female']),
    image: faker.image.avatar(),
    accessToken: faker.string.uuid(),
    refreshToken: faker.string.uuid(),
  }
}
