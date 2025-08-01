-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "golfCourseId" TEXT NOT NULL,
    "bookingDate" DATETIME NOT NULL,
    "teeTime" DATETIME NOT NULL,
    "numberOfPlayers" INTEGER NOT NULL,
    "totalPrice" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentMethod" TEXT NOT NULL DEFAULT 'stripe',
    "paymentData" TEXT,
    "paypalOrderId" TEXT,
    "discountCodeId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_golfCourseId_fkey" FOREIGN KEY ("golfCourseId") REFERENCES "GolfCourse" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_discountCodeId_fkey" FOREIGN KEY ("discountCodeId") REFERENCES "DiscountCode" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("bookingDate", "createdAt", "discountCodeId", "golfCourseId", "id", "numberOfPlayers", "status", "teeTime", "totalPrice", "updatedAt", "userId") SELECT "bookingDate", "createdAt", "discountCodeId", "golfCourseId", "id", "numberOfPlayers", "status", "teeTime", "totalPrice", "updatedAt", "userId" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
