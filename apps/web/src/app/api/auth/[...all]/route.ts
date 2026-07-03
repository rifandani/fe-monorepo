import { toNextJsHandler } from 'better-auth/next-js'
import { auth } from '@/auth/utils/auth'

export const { POST, GET } = toNextJsHandler(auth)
