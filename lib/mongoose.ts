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

  // Small pool per serverless instance — many devices/tabs must not exhaust Atlas.
  const options = {
    serverSelectionTimeoutMS: 15000,
    maxPoolSize: 5,
    minPoolSize: 0,
  };

  let connectionUri = uri;
  if (uri.startsWith("mongodb+srv://")) {
    try {
      connectionUri = await resolveMongoUri(uri);
    } catch (error) {
      if (!isSrvDnsError(error)) throw error;
    }
  }

  try {
    return await mongoose.connect(connectionUri, options);
  } catch (error) {
    if (!uri.startsWith("mongodb+srv://") || !isRetryableConnectError(error)) {
      throw error;
    }

    const fallbackUri =
      connectionUri === uri ? await resolveMongoUri(uri) : uri;

    if (fallbackUri === connectionUri) {
      throw error;
    }

    return mongoose.connect(fallbackUri, options);
  }
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
