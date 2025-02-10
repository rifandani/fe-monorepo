import { promises as fs } from 'node:fs'
import path from 'node:path'
import { FileMigrationProvider, Migrator } from 'kysely'
import { run } from 'kysely-migration-cli'
import { db } from '.'

const migrator = new Migrator({
  db,
  provider: new FileMigrationProvider({
    fs,
    path,
    migrationFolder: path.join(__dirname, './migrations'),
  }),
})

run(db, migrator, './src/lib/db/migrations')
