import dns from "dns";
import "@/lib/configureDns";
import mongoose from "mongoose";
import { resolveMongoUri } from "@/lib/resolveMongoUri";

const uri = process.env.DATABASE_URI || "";

if (!uri) {
  throw new Error("Please add your Mongo URI to .env");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

function isSrvDnsError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("querySrv") ||
    message.includes("ECONNREFUSED") ||
    message.includes("ENOTFOUND") ||
    message.includes("ETIMEOUT")
  );
}

function isRetryableConnectError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  const labels =
    error instanceof Error && "errorLabels" in error
      ? (error as { errorLabels?: Set<string> }).errorLabels
      : undefined;
  return (
    isSrvDnsError(error) ||
    message.includes("Server selection timed out") ||
    message.includes("connection") && message.includes("closed") ||
    labels?.has("RetryableError") === true
  );
}

async function connectMongoose() {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

  // Stay under Vercel Hobby's ~10s function limit (connect + query).
  const options = {
    serverSelectionTimeoutMS:
      process.env.NODE_ENV === "production" ? 5000 : 15000,
    maxPoolSize: 5,
    minPoolSize: 0,
  };

  if (uri.startsWith("mongodb+srv://")) {
    try {
      return await mongoose.connect(uri, options);
    } catch (error) {
      if (!isRetryableConnectError(error)) throw error;
      const resolvedUri = await resolveMongoUri(uri);
      return mongoose.connect(resolvedUri, options);
    }
  }

  return mongoose.connect(uri, options);
}

async function dbConnect() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (cached.conn && mongoose.connection.readyState !== 1) {
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    cached.promise = connectMongoose();
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    throw error;
  }
}

export default dbConnect;
