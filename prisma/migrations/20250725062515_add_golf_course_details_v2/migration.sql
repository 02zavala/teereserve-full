/*
  Warnings:

  - You are about to drop the column `pricePerRound` on the `GolfCourse` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GolfCourse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT,
    "holes" INTEGER NOT NULL,
    "rating" REAL,
    "priceWeekday" REAL,
    "priceWeekend" REAL,
    "teeSheetUrl" TEXT,
    "currency" TEXT DEFAULT 'USD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "features" TEXT,
    "difficulty" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_GolfCourse" ("contactEmail", "contactPhone", "createdAt", "description", "holes", "id", "imageUrl", "location", "name", "rating", "updatedAt") SELECT "contactEmail", "contactPhone", "createdAt", "description", "holes", "id", "imageUrl", "location", "name", "rating", "updatedAt" FROM "GolfCourse";
DROP TABLE "GolfCourse";
ALTER TABLE "new_GolfCourse" RENAME TO "GolfCourse";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
