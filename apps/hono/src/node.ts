import { PORT } from '@/app/constants/global'
import { serve } from '@hono/node-server'
import { logger } from '@workspace/core/utils/logger.util'
import { app } from './app'

serve({ ...app, port: PORT }, (info) => {
  logger.info(`Listening on http://localhost:${info.port}`)
})
