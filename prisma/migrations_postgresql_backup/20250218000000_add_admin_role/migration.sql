-- Create Admin table if it doesn't exist (ensures shadow DB has table before we alter it)
CREATE TABLE IF NOT EXISTS "Admin" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "name" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Admin_email_key" ON "Admin"("email");
CREATE INDEX IF NOT EXISTS "Admin_email_idx" ON "Admin"("email");

-- AlterTable (idempotent: only add column if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Admin' AND column_name = 'role'
  ) THEN
    ALTER TABLE "Admin" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'staff';
  END IF;
END $$;

-- CreateIndex (idempotent: ignore if exists)
CREATE INDEX IF NOT EXISTS "Admin_role_idx" ON "Admin"("role");
