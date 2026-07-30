import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import 'dotenv/config';
import authRoutes from './src/routes/authRoutes';

const app: Application = express();

// CORS — allow only the client origin
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

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
