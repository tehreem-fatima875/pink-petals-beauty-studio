import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

declare global {
  var mongooseConnection:
    | { connection: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
    | undefined;
}

const cached = global.mongooseConnection ?? { connection: null, promise: null };
global.mongooseConnection = cached;

export async function connectMongo() {
  if (!uri) throw new Error("MONGODB_URI is not configured.");
  if (cached.connection) return cached.connection;
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri).catch((error: unknown) => {
      cached.promise = null;
      throw error;
    });
  }
  cached.connection = await cached.promise;
  return cached.connection;
}

export function hasMongoConfig() {
  return Boolean(uri);
}
