-- CreateTable
CREATE TABLE "WeeklyGoal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "athleteId" INTEGER NOT NULL,
    "goalType" TEXT NOT NULL,
    "targetValue" REAL NOT NULL,
    "currentValue" REAL NOT NULL,
    "memo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WeeklyGoal_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "AthleteProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RapsodoData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "athleteId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "batSpeed" REAL,
    "exitVelocity" REAL,
    "launchAngle" REAL,
    "distance" REAL,
    "attackAngle" REAL,
    "contactTime" REAL,
    "memo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RapsodoData_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "AthleteProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Drill" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "videoUrl" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "cue1" TEXT,
    "cue2" TEXT,
    "cue3" TEXT,
    "baseReps" TEXT,
    "baseSets" TEXT,
    "baseRest" TEXT,
    "academyId" INTEGER NOT NULL,
    CONSTRAINT "Drill_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "Academy" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Drill" ("academyId", "category", "description", "id", "name") SELECT "academyId", "category", "description", "id", "name" FROM "Drill";
DROP TABLE "Drill";
ALTER TABLE "new_Drill" RENAME TO "Drill";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
