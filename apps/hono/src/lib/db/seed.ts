import { Role } from '@/app/models'
import { logger } from '@workspace/core/utils/logger'
import { db } from '.'

async function main() {
  await db
    .insertInto('users')
    .values([{ name: 'Test', email: 'test@test.com', role: Role.MEMBER }])
    // .onConflict(oc => oc.column('name').doNothing()) // : )
    .execute()

  logger.info(`Seeding finished.`)
}

main()
  .then(async () => {})
  .catch(async (e) => {
    console.error('Error seeding database', e)
  })
  .finally(() => process.exit(0))
