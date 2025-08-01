-- CreateTable
CREATE TABLE "onboarding_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "website" TEXT,
    "description" TEXT,
    "holes" INTEGER NOT NULL DEFAULT 18,
    "priceRange" TEXT,
    "amenities" TEXT,
    "specialRequests" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "courseId" TEXT
);
