import type { RequestIdVariables } from 'hono/request-id'
import CountUsers from '@/app/cases/users/countUsers'
import CreateUser from '@/app/cases/users/createUser'
import { Role } from '@/app/models'
import UserRepository from '@/app/repositories/UserRepository'
import { Hono } from 'hono'
import { any, intersection, nativeEnum, object, string } from 'zod'

const CountUserSchemaInput = object({
  where: object({
    role: nativeEnum(Role).optional(),
  }).optional(),
})

function CreateUserSchemaInput(role: Role) {
  // This is just an example of how you can manage requests
  // that require fields depending on the payload
  const AdminUserSchema = object({
    mobile_phone_number: string().refine(value =>
      /^\+(?:[0-9-()/.]\s?){6,15}\d$/.test(value),
    ),
  })

  const schema = intersection(
    object({
      name: string().trim().min(1),
      email: string(),
      role: nativeEnum(Role),
    }),

    (role === Role.ADMIN && AdminUserSchema) || any(),
  )

  return schema
}

const users = new Hono<{
  Variables: RequestIdVariables
}>()

users.post('/', async (c) => {
  const data = await c.req.json()

  const { name, email, role, mobile_phone_number } = CreateUserSchemaInput(
    data.role as Role,
  ).parse(data)

  // example using function
  const createUser = CreateUser(new UserRepository())

  const response = await createUser.execute({
    name,
    email,
    role,
    mobile_phone_number,
  })

  return c.json(response, 200)
})

users.post('/count', async (c) => {
  const { where } = CountUserSchemaInput.parse(await c.req.json())

  const countUsers = new CountUsers(new UserRepository())

  const response = await countUsers.execute({
    where,
  })

  return c.json(response, 200)
})

users.get('/', c => c.text('List users')) // GET /user

users.get('/:id', (c) => {
  // GET /user
  const id = c.req.param('id')
  return c.text(`Get user: ${id}`)
})

export default users
