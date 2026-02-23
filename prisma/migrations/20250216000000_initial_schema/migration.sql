-- CreateTable (IF NOT EXISTS so shadow DB can apply migrations in any order)
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "phoneNumber" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TherapyBooking" (
    "id" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "appointmentType" TEXT NOT NULL,
    "preferredDate" TIMESTAMP(3) NOT NULL,
    "preferredTime" TEXT,
    "endDate" TIMESTAMP(3),
    "serviceLocation" TEXT NOT NULL,
    "fullAddress" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "condition" TEXT,
    "medicalHistory" TEXT,
    "useDirectBilling" BOOLEAN NOT NULL DEFAULT false,
    "insuranceProvider" TEXT,
    "policyNumber" TEXT,
    "groupNumber" TEXT,
    "emergencyContact" TEXT,
    "specialInstructions" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TherapyBooking_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable Assessment (so later migration 20250222 can add plan columns)
CREATE TABLE IF NOT EXISTS "Assessment" (
    "id" TEXT NOT NULL,
    "assessmentType" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "reasonForReferral" TEXT,
    "hpi" TEXT,
    "painDescription" TEXT,
    "painLevel" TEXT,
    "painType" TEXT,
    "whatMakesWorse" TEXT,
    "whatHelps" TEXT,
    "pmhx" TEXT,
    "associatedImaging" TEXT,
    "baselineActivity" TEXT,
    "observation" TEXT,
    "swellingCirculation" TEXT,
    "romInitial" TEXT,
    "romFollowupFlexion" TEXT,
    "romFollowupAbduction" TEXT,
    "strengthInitial" TEXT,
    "strengthFollowupFlexion" TEXT,
    "strengthFollowupAbduction" TEXT,
    "palpation" TEXT,
    "neuro" TEXT,
    "specialTests" TEXT,
    "clinicalImpression" TEXT,
    "goals" TEXT,
    "subjectivePain" TEXT,
    "subjectiveActivity" TEXT,
    "subjectiveExercises" TEXT,
    "subjectiveModalities" TEXT,
    "subjectiveMedications" TEXT,
    "objectiveFindings" TEXT,
    "assessmentModalities" TEXT,
    "assessmentROM" TEXT,
    "assessmentStrengthening" TEXT,
    "assessmentHEP" TEXT,
    "assessmentEducation" TEXT,
    "assessmentRestrictions" TEXT,
    "assessmentHandouts" TEXT,
    "treatment" TEXT,
    "treatmentModality" TEXT,
    "treatmentROM" TEXT,
    "treatmentStrengthening" TEXT,
    "treatmentStretching" TEXT,
    "treatmentHEP" TEXT,
    "treatmentEducation" TEXT,
    "treatmentRestrictions" TEXT,
    "treatmentHandouts" TEXT,
    "plan" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Assessment_bookingId_idx" ON "Assessment"("bookingId");
CREATE INDEX IF NOT EXISTS "Assessment_assessmentType_idx" ON "Assessment"("assessmentType");
CREATE INDEX IF NOT EXISTS "Assessment_createdAt_idx" ON "Assessment"("createdAt");
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Assessment_bookingId_fkey' AND table_name = 'Assessment') THEN
    ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "TherapyBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");
CREATE INDEX IF NOT EXISTS "TherapyBooking_email_idx" ON "TherapyBooking"("email");
CREATE INDEX IF NOT EXISTS "TherapyBooking_status_idx" ON "TherapyBooking"("status");
CREATE INDEX IF NOT EXISTS "TherapyBooking_createdAt_idx" ON "TherapyBooking"("createdAt");
CREATE INDEX IF NOT EXISTS "TherapyBooking_userId_idx" ON "TherapyBooking"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "Admin_email_key" ON "Admin"("email");
CREATE INDEX IF NOT EXISTS "Admin_email_idx" ON "Admin"("email");

-- AddForeignKey (ignore if exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'TherapyBooking_userId_fkey' AND table_name = 'TherapyBooking'
  ) THEN
    ALTER TABLE "TherapyBooking" ADD CONSTRAINT "TherapyBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
