-- AlterTable
ALTER TABLE "PatientChart" ADD COLUMN "consentContent" TEXT,
ADD COLUMN "consentCompletedAt" TIMESTAMP(3),
ADD COLUMN "initialAssessmentCompletedAt" TIMESTAMP(3);

-- Existing charts: skip the new consent + initial gates (already on file)
UPDATE "PatientChart" SET
  "consentCompletedAt" = COALESCE("consentCompletedAt", "updatedAt", "createdAt"),
  "initialAssessmentCompletedAt" = COALESCE("initialAssessmentCompletedAt", "updatedAt", "createdAt");
