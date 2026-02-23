-- Add endDate to TherapyBooking if not present (idempotent; no-op if table from initial_schema)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'TherapyBooking')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'TherapyBooking' AND column_name = 'endDate') THEN
    ALTER TABLE "TherapyBooking" ADD COLUMN "endDate" TIMESTAMP(3);
  END IF;
END $$;
