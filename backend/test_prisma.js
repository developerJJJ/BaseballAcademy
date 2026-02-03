const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');
const dbPath = path.resolve(__dirname, 'prisma/dev.db');
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function test() {
  try {
    const profiles = await prisma.athleteProfile.findMany();
    console.log('Profiles found:', profiles.length);
    if (profiles.length > 0) {
        console.log('First profile:', profiles[0]);
    }
  } catch (err) {
    console.error('PRISMA ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
