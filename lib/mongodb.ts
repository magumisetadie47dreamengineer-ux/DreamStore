import "@/lib/configureDns";
import { MongoClient } from "mongodb";
import { resolveMongoUri } from "@/lib/resolveMongoUri";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.DATABASE_URI ?? "";

if (!uri) {
  throw new Error("Please add your Mongo URI to .env");
}

async function connectClient() {
  const resolvedUri = await resolveMongoUri(uri);
  const client = new MongoClient(resolvedUri, {
    serverSelectionTimeoutMS:
      process.env.NODE_ENV === "production" ? 8000 : 15000,
    maxPoolSize: 5,
  });
  return client.connect();
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = connectClient();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = connectClient();
}

export default clientPromise;
