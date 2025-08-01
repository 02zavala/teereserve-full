/*
  Warnings:

  - Added the required column `slug` to the `GolfCourse` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GolfCourse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
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
INSERT INTO "new_GolfCourse" ("contactEmail", "contactPhone", "createdAt", "currency", "description", "difficulty", "features", "holes", "id", "imageUrl", "isActive", "location", "name", "priceWeekday", "priceWeekend", "rating", "teeSheetUrl", "updatedAt") SELECT "contactEmail", "contactPhone", "createdAt", "currency", "description", "difficulty", "features", "holes", "id", "imageUrl", "isActive", "location", "name", "priceWeekday", "priceWeekend", "rating", "teeSheetUrl", "updatedAt" FROM "GolfCourse";
DROP TABLE "GolfCourse";
ALTER TABLE "new_GolfCourse" RENAME TO "GolfCourse";
CREATE UNIQUE INDEX "GolfCourse_slug_key" ON "GolfCourse"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
