import 'dotenv/config'

/**
 * Prisma 5+ config. Seed is run with: npx prisma db seed
 * Run from the physico_web directory: cd physico_web && npx prisma db seed
 */
export default {
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL ?? '',
  },
}
