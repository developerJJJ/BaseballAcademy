import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import attendanceRouter from './routes/attendance';
import sessionRouter from './routes/session';
import drillsRouter from './routes/drills';
import goalsRouter from './routes/goals';
import rapsodoRouter from './routes/rapsodo';
import parentRouter from './routes/parent';
import rulesRouter from './routes/rules';

import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, __dirname.includes('dist') ? '../../.env' : '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/sessions', sessionRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/drills', drillsRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/rapsodo', rapsodoRouter);
app.use('/api/parent', parentRouter);
app.use('/api/rules', rulesRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Database schema and enums should be synchronized.');
});
