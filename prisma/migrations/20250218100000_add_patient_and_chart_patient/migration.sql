-- CreateTable Patient
CREATE TABLE IF NOT EXISTS "Patient" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "phoneNumber" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable PatientChart if not exists (so shadow DB can run this before 20251221)
CREATE TABLE IF NOT EXISTS "PatientChart" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "content" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PatientChart_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "PatientChart_bookingId_key" ON "PatientChart"("bookingId");

-- AlterTable: make bookingId optional and add patientId to PatientChart
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'PatientChart' AND column_name = 'patientId') THEN
    ALTER TABLE "PatientChart" ADD COLUMN "patientId" TEXT;
    ALTER TABLE "PatientChart" ALTER COLUMN "bookingId" DROP NOT NULL;
  END IF;
END $$;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PatientChart_patientId_key" ON "PatientChart"("patientId");
CREATE INDEX IF NOT EXISTS "Patient_email_idx" ON "Patient"("email");
CREATE INDEX IF NOT EXISTS "Patient_createdById_idx" ON "Patient"("createdById");
CREATE INDEX IF NOT EXISTS "PatientChart_patientId_idx" ON "PatientChart"("patientId");

-- AddForeignKey (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Patient_createdById_fkey' AND table_name = 'Patient') THEN
    ALTER TABLE "Patient" ADD CONSTRAINT "Patient_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'PatientChart_patientId_fkey' AND table_name = 'PatientChart') THEN
    ALTER TABLE "PatientChart" ADD CONSTRAINT "PatientChart_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
