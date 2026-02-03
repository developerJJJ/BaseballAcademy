import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const getDbPath = () => {
    // If DATABASE_URL is provided in env, use it
    if (process.env.DATABASE_URL) {
        return path.resolve(process.cwd(), process.env.DATABASE_URL.replace('file:', ''));
    }
    // Otherwise, try to find prisma/dev.db relative to process.cwd()
    const relativePath = process.cwd().endsWith('backend') ? 'prisma/dev.db' : 'backend/prisma/dev.db';
    return path.resolve(process.cwd(), relativePath);
};

const dbPath = getDbPath();
console.log('--- Resolved Database Path:', dbPath);
const adapter = new PrismaBetterSqlite3({ url: dbPath });

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });
console.log('--- Prisma Client Active ---');

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
