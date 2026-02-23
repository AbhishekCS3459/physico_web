-- CreateTable ChartAccessRequest
CREATE TABLE "ChartAccessRequest" (
    "id" TEXT NOT NULL,
    "chartId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "permission" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "respondedById" TEXT,
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChartAccessRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable AdminNotification
CREATE TABLE "AdminNotification" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "chartId" TEXT,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChartAccessRequest_chartId_requestedById_key" ON "ChartAccessRequest"("chartId", "requestedById");
CREATE INDEX "ChartAccessRequest_chartId_idx" ON "ChartAccessRequest"("chartId");
CREATE INDEX "ChartAccessRequest_requestedById_idx" ON "ChartAccessRequest"("requestedById");
CREATE INDEX "ChartAccessRequest_status_idx" ON "ChartAccessRequest"("status");
CREATE INDEX "AdminNotification_adminId_idx" ON "AdminNotification"("adminId");
CREATE INDEX "AdminNotification_read_idx" ON "AdminNotification"("read");
CREATE INDEX "AdminNotification_createdAt_idx" ON "AdminNotification"("createdAt");

-- AddForeignKey
ALTER TABLE "ChartAccessRequest" ADD CONSTRAINT "ChartAccessRequest_chartId_fkey" FOREIGN KEY ("chartId") REFERENCES "PatientChart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChartAccessRequest" ADD CONSTRAINT "ChartAccessRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChartAccessRequest" ADD CONSTRAINT "ChartAccessRequest_respondedById_fkey" FOREIGN KEY ("respondedById") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AdminNotification" ADD CONSTRAINT "AdminNotification_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
