-- Create Admin table
CREATE TABLE IF NOT EXISTS "Admin" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "name" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- Create unique index on email
CREATE UNIQUE INDEX IF NOT EXISTS "Admin_email_key" ON "Admin"("email");

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS "Admin_email_idx" ON "Admin"("email");
