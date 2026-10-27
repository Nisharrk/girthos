import mongoose from "mongoose";

// Share in-flight connections across requests and development reloads.
const cache = globalThis.girthosMongo ??= { promise: null };

export default async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose;
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not defined");
  if (!cache.promise) {
    cache.promise = mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    }).finally(() => { cache.promise = null; });
  }
  return cache.promise;
}
