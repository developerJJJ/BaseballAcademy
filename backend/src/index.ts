import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import attendanceRouter from './routes/attendance';
import sessionRouter from './routes/session';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/sessions', sessionRouter);
app.use('/api/attendance', attendanceRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Database schema and enums should be synchronized.');
});
