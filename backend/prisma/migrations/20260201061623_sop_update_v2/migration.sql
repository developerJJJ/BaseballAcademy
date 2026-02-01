/*
  Warnings:

  - Made the column `category` on table `Drill` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Attendance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sessionId" INTEGER NOT NULL,
    "athleteId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "conditionScore" INTEGER,
    "hasPain" BOOLEAN NOT NULL DEFAULT false,
    "isForcedToD" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    CONSTRAINT "Attendance_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Attendance_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "AthleteProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Attendance" ("athleteId", "id", "notes", "sessionId", "status") SELECT "athleteId", "id", "notes", "sessionId", "status" FROM "Attendance";
DROP TABLE "Attendance";
ALTER TABLE "new_Attendance" RENAME TO "Attendance";
CREATE TABLE "new_Drill" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "academyId" INTEGER NOT NULL,
    CONSTRAINT "Drill_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "Academy" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Drill" ("academyId", "category", "description", "id", "name") SELECT "academyId", "category", "description", "id", "name" FROM "Drill";
DROP TABLE "Drill";
ALTER TABLE "new_Drill" RENAME TO "Drill";
CREATE TABLE "new_SessionTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "workoutType" TEXT NOT NULL DEFAULT 'A_LOWER',
    "duration" TEXT NOT NULL DEFAULT 'MIN_60',
    "academyId" INTEGER NOT NULL,
    CONSTRAINT "SessionTemplate_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "Academy" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SessionTemplate" ("academyId", "id", "name") SELECT "academyId", "id", "name" FROM "SessionTemplate";
DROP TABLE "SessionTemplate";
ALTER TABLE "new_SessionTemplate" RENAME TO "SessionTemplate";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
