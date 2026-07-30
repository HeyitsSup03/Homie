import 'dotenv/config';
import app from './app';
import connectDB from './src/config/db';

const PORT = Number(process.env.PORT) || 5000;

const start = async (): Promise<void> => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
