import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Robustly find the backend directory
const findBackendDir = () => {
    let current = __dirname;
    // Walk up until we find package.json and a prisma directory
    for (let i = 0; i < 6; i++) {
        if (fs.existsSync(path.join(current, 'package.json')) && fs.existsSync(path.join(current, 'prisma'))) {
            return current;
        }
        current = path.resolve(current, '..');
    }
    return process.cwd();
};

const backendDir = findBackendDir();
console.log('--- Backend Root Dir:', backendDir);

// Explicitly load .env from the backend root
const envPath = path.join(backendDir, '.env');
dotenv.config({ path: envPath });
console.log('--- Loading .env from:', envPath);
console.log('--- DATABASE_URL from env:', process.env.DATABASE_URL);

const getDbPath = () => {
    const dbUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';
    const filePath = dbUrl.replace('file:', '');
    if (path.isAbsolute(filePath)) return filePath;
    
    // Resolve relative path against the discovered backend directory
    return path.resolve(backendDir, filePath);
};

const dbPath = getDbPath();
console.log('--- Final SQLite Path:', dbPath);

if (!fs.existsSync(dbPath)) {
    console.error('!!! WARNING: Database file does not exist at:', dbPath);
}

const adapter = new PrismaBetterSqlite3({ url: dbPath });

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });
console.log('--- Prisma Client Active ---');

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
