-- Follow-up ROM and RIM: extension, adduction, internal/external rotation
ALTER TABLE "Assessment" ADD COLUMN "romFollowupExtension" TEXT;
ALTER TABLE "Assessment" ADD COLUMN "romFollowupAdduction" TEXT;
ALTER TABLE "Assessment" ADD COLUMN "romFollowupInternalRotation" TEXT;
ALTER TABLE "Assessment" ADD COLUMN "romFollowupExternalRotation" TEXT;
ALTER TABLE "Assessment" ADD COLUMN "strengthFollowupExtension" TEXT;
ALTER TABLE "Assessment" ADD COLUMN "strengthFollowupAdduction" TEXT;
ALTER TABLE "Assessment" ADD COLUMN "strengthFollowupInternalRotation" TEXT;
ALTER TABLE "Assessment" ADD COLUMN "strengthFollowupExternalRotation" TEXT;
