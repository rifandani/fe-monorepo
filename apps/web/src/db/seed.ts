import { hashPassword } from "better-auth/crypto";
import { drizzle } from "drizzle-orm/node-postgres";
import { reset, seed } from "drizzle-seed";
import { Pool } from "pg";

import {
  accountTable,
  sessionTable,
  userTable,
  verificationTable,
} from "./schema";
import { SEED_BULK_PASSWORD, SEED_USER } from "./seed-user";

const RANDOM_USER_COUNT = 10;

const authTables = {
  accountTable,
  sessionTable,
  userTable,
  verificationTable,
};

type Db = ReturnType<typeof drizzle<typeof authTables>>;

const seedRandomUsers = async (db: Db) => {
  console.log(`Seeding ${RANDOM_USER_COUNT} random users…`);
  await seed(db, { userTable }, { count: RANDOM_USER_COUNT, seed: 42 }).refine(
    (f) => ({
      userTable: {
        columns: {
          deletedAt: f.default({ defaultValue: null }),
          email: f.email(),
          emailVerified: f.boolean(),
          id: f.uuid(),
          image: f.default({ defaultValue: null }),
          name: f.fullName(),
          updatedAt: f.default({ defaultValue: null }),
        },
      },
    })
  );
};

/** Gives every seeded user the same credential account, so they are loggable in. */
const linkCredentialAccounts = async (db: Db) => {
  const [users, bulkPasswordHash] = await Promise.all([
    db.select({ id: userTable.id }).from(userTable),
    hashPassword(SEED_BULK_PASSWORD),
  ]);
  await db.insert(accountTable).values(
    users.map((user) => ({
      accountId: user.id,
      id: crypto.randomUUID(),
      password: bulkPasswordHash,
      providerId: "credential",
      userId: user.id,
    }))
  );
  console.log(`Linked credential accounts (password: ${SEED_BULK_PASSWORD})`);
};

const seedDemoUser = async (db: Db) => {
  const demoUserId = crypto.randomUUID();
  const demoPasswordHash = await hashPassword(SEED_USER.password);
  await db.insert(userTable).values({
    email: SEED_USER.email,
    emailVerified: true,
    id: demoUserId,
    name: SEED_USER.name,
  });
  await db.insert(accountTable).values({
    accountId: demoUserId,
    id: crypto.randomUUID(),
    password: demoPasswordHash,
    providerId: "credential",
    userId: demoUserId,
  });
  console.log(`Seeded demo user ${SEED_USER.email} / ${SEED_USER.password}`);
};

const main = async () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required");
  }

  const pool = new Pool({ connectionString });
  const db = drizzle({
    casing: "snake_case",
    client: pool,
    schema: authTables,
  });

  try {
    console.log("Resetting auth tables…");
    await reset(db, authTables);
    await seedRandomUsers(db);
    await linkCredentialAccounts(db);
    await seedDemoUser(db);
  } finally {
    await pool.end();
  }
};

try {
  await main();
} catch (error: unknown) {
  console.error(error);
  process.exit(1);
}
