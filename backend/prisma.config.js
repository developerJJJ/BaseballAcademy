const { defineConfig } = require('@prisma/config');
require('dotenv').config();

module.exports = defineConfig({
  migrations: {
    seed: 'ts-node prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
