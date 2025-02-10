import { PORT } from '@/app/constants/global'
import { app } from './app'

export default {
  ...app,
  port: PORT,
}
