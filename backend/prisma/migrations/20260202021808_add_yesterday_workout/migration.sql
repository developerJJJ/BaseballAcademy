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
    "painArea" TEXT,
    "workedOutYesterday" BOOLEAN NOT NULL DEFAULT false,
    "isForcedToD" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    CONSTRAINT "Attendance_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Attendance_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "AthleteProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Attendance" ("athleteId", "conditionScore", "hasPain", "id", "isForcedToD", "notes", "painArea", "sessionId", "status") SELECT "athleteId", "conditionScore", "hasPain", "id", "isForcedToD", "notes", "painArea", "sessionId", "status" FROM "Attendance";
DROP TABLE "Attendance";
ALTER TABLE "new_Attendance" RENAME TO "Attendance";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
