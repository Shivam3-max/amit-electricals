-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Dealer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "gstin" TEXT,
    "city" TEXT,
    "address" TEXT,
    "passwordHash" TEXT NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'RETAILER',
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Dealer" ("address", "city", "company", "contact", "createdAt", "email", "gstin", "id", "notes", "passwordHash", "phone", "status", "tier", "updatedAt") SELECT "address", "city", "company", "contact", "createdAt", "email", "gstin", "id", "notes", "passwordHash", "phone", "status", "tier", "updatedAt" FROM "Dealer";
DROP TABLE "Dealer";
ALTER TABLE "new_Dealer" RENAME TO "Dealer";
CREATE UNIQUE INDEX "Dealer_phone_key" ON "Dealer"("phone");
CREATE INDEX "Dealer_status_idx" ON "Dealer"("status");
CREATE INDEX "Dealer_tier_idx" ON "Dealer"("tier");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
