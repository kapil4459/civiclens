import mongoose from 'mongoose';
import env from './env.js';

let memoryServer = null;

/**
 * Connects to MongoDB Atlas via MONGODB_URI.
 * In development, falls back to an ephemeral in-memory MongoDB
 * (mongodb-memory-server) when no URI is configured, so the app
 * remains runnable for local demos. Production requires MONGODB_URI.
 */
export const connectDB = async () => {
  let uri = env.mongoUri;

  if (!uri) {
    if (env.nodeEnv === 'production') {
      throw new Error('MONGODB_URI is required when NODE_ENV=production');
    }
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri('civiclens');
    console.warn('[db] MONGODB_URI not set — using in-memory MongoDB (development fallback)');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15000,
    maxPoolSize: 10,
  });

  console.log(`[db] MongoDB connected — database: ${mongoose.connection.name}`);
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
  console.log('[db] MongoDB disconnected');
};
