-- CreateIndex (performance optimization for user search)
CREATE INDEX "User_name_idx" ON "User"("name");

-- CreateIndex (performance optimization for expense queries by date)
CREATE INDEX "Expense_date_idx" ON "Expense"("date");

-- CreateIndex (performance optimization for settlement status queries)
CREATE INDEX "Settlement_status_idx" ON "Settlement"("status");

-- AlterColumn (change default value for Group type)
ALTER TABLE "Group" ALTER COLUMN "type" SET DEFAULT 'APARTMENT';

-- AlterColumn (add check constraint for positive amounts)
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_amount_positive" CHECK ("amount" > 0);

-- AlterColumn (add check constraint for positive settlement amounts)
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_amount_positive" CHECK ("amount" > 0);
