import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from 'express';
import { connectDB } from './config/db';

const app = express();

const PORT = process.env.PORT || 5000;

connectDB();

app.get('/', (req: Request, res: Response) => {
  return res.json({ 
    message: "Server running...",
    status_db: "Connection configured and ready for MongoDB Atlas"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} at: http://localhost:${PORT}`);
});

