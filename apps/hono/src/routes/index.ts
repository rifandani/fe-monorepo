import type { Hono } from 'hono'
import type { RequestIdVariables } from 'hono/request-id'
import users from './users'

export function routes(app: Hono<{
  Variables: RequestIdVariables
}>) {
  // custom middleware example
  // app.get('/', hello(), c => c.json({ 1: 'Hello', 2: 'World' }))

  app.get('/health', c =>
    c.json({
      uptime: process.uptime(),
      message: 'Ok',
      date: new Date(),
    }))

  app.route('/users', users)
}
