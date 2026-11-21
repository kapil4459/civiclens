import app from './app.js';
import env from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';

const start = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error('[db] Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }

  const server = app.listen(env.port, () => {
    console.log(`[server] CivicLens API listening on http://localhost:${env.port}`);
    console.log(`[server] Health check: http://localhost:${env.port}/api/health`);
  });

  const shutdown = async (signal) => {
    console.log(`[server] ${signal} received, shutting down...`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

start();
