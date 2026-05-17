-- CreateTable
CREATE TABLE "ChartInvitation" (
    "id" TEXT NOT NULL,
    "chartId" TEXT NOT NULL,
    "inviteeId" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "permission" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChartInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChartInvitation_chartId_inviteeId_key" ON "ChartInvitation"("chartId", "inviteeId");

-- CreateIndex
CREATE INDEX "ChartInvitation_chartId_idx" ON "ChartInvitation"("chartId");

-- CreateIndex
CREATE INDEX "ChartInvitation_inviteeId_idx" ON "ChartInvitation"("inviteeId");

-- CreateIndex
CREATE INDEX "ChartInvitation_status_idx" ON "ChartInvitation"("status");

-- AddForeignKey
ALTER TABLE "ChartInvitation" ADD CONSTRAINT "ChartInvitation_chartId_fkey" FOREIGN KEY ("chartId") REFERENCES "PatientChart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChartInvitation" ADD CONSTRAINT "ChartInvitation_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChartInvitation" ADD CONSTRAINT "ChartInvitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
