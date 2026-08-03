import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import 'dotenv/config';
import path from 'path';
import authRoutes from './src/routes/authRoutes';
import listingRoutes from './src/routes/listingRoutes';
import interestRoutes from './src/routes/interestRoutes';
import messageRoutes from './src/routes/messageRoutes';
import userRoutes from './src/routes/userRoutes';
import uploadRoutes from './src/routes/uploadRoutes';

const app: Application = express();

// CORS — allow only the client origin
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

app.use(express.json());

// Serve static uploaded files (PDF resumes, etc.)
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/interests', interestRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/uploads', uploadRoutes);

// 404 fallback
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found.' });
});

// Centralised error handler — catches anything forwarded by asyncHandler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error.' });
});

export default app;
