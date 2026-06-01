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
  return message.includes("querySrv") || message.includes("ECONNREFUSED");
}

async function connectMongoose() {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

  const options = { serverSelectionTimeoutMS: 15000 };

  try {
    return await mongoose.connect(uri, options);
  } catch (error) {
    if (uri.startsWith("mongodb+srv://") && isSrvDnsError(error)) {
      const resolvedUri = await resolveMongoUri(uri);
      return mongoose.connect(resolvedUri, options);
    }
    throw error;
  }
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
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
