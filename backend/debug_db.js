const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.resolve(__dirname, 'prisma/dev.db');
const db = new Database(dbPath);
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables.map(t => t.name));
const columns = db.prepare("PRAGMA table_info(AthleteProfile)").all();
console.log('AthleteProfile Columns:', columns.map(c => c.name));
db.close();
