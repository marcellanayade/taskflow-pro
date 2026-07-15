import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from 'express';
import { connectDB } from './config/db';
import taskRoutes from './routes/taskRoutes';
import userRoutes from './routes/userRoutes';
import projectRoutes from './routes/projectRoutes';

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 5000;

connectDB();

app.use('/api/users', userRoutes);

app.use('/api/tasks', taskRoutes);

app.use('/api/projects', projectRoutes);

app.get('/', (req: Request, res: Response) => {
  return res.json({ 
    message: "Server running...",
    status_db: "Connection configured and ready for MongoDB Atlas"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} at: http://localhost:${PORT}`);
});

