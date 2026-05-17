# MongoDB setup (Prisma)

This app uses **MongoDB** with Prisma. PostgreSQL SQL migrations are archived under `prisma/migrations_postgresql_backup/`.

## Connection string

Set `DATABASE_URL` in `.env` and Vercel (include a **database name** in the path):

```env
DATABASE_URL="mongodb+srv://USER:PASSWORD@cluster.mongodb.net/physico_rehab?retryWrites=true&w=majority"
```

## Apply schema

Prisma **Migrate** does not run against MongoDB. Use **db push**:

```bash
cd physico_web
npx prisma db push
npx prisma db seed   # optional: admin@physiorehab.com / admin
```

## Production (Vercel)

1. Set `DATABASE_URL` to your Atlas connection string.
2. After deploy, run once (locally or in CI):

   ```bash
   DATABASE_URL="..." npx prisma db push
   ```

   Or add a post-deploy step / GitHub Action that runs `db push`.

3. `npm run build` still runs `prisma generate` only; it does not sync the schema.

## Data from PostgreSQL

Existing Neon/Postgres data is **not** copied automatically. Export from Postgres and import with a one-off script, or start fresh and re-seed.

## Scripts

| Command        | Action                          |
|----------------|---------------------------------|
| `pnpm db:push` | Sync schema to MongoDB          |
| `pnpm db:seed` | Create default admin            |
| `pnpm db:studio` | Browse data in Prisma Studio |
