-- AddColumn
ALTER TABLE "User" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AddColumn
ALTER TABLE "User" ADD COLUMN "lastLoginAt" TIMESTAMP(3);

-- AddColumn
ALTER TABLE "Group" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'RSD';

-- AddColumn
ALTER TABLE "Settlement" ADD COLUMN "notes" TEXT;
