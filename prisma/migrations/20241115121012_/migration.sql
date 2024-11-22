/*
  Warnings:

  - You are about to drop the `Bid` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "Bid_variantId_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Bid";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserBid" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "auctionId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "bidAmount" REAL NOT NULL,
    "bidTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserBid_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserBid_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserBid_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UserBid" ("auctionId", "bidAmount", "createdAt", "customerId", "customerName", "id", "productId", "variantId") SELECT "auctionId", "bidAmount", "createdAt", "customerId", "customerName", "id", "productId", "variantId" FROM "UserBid";
DROP TABLE "UserBid";
ALTER TABLE "new_UserBid" RENAME TO "UserBid";
CREATE INDEX "UserBid_auctionId_productId_variantId_idx" ON "UserBid"("auctionId", "productId", "variantId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
