import dns from "dns/promises";
import { MongoClient } from "mongodb";
import "@/lib/configureDns";

const PUBLIC_DNS = ["8.8.8.8", "8.8.4.4", "1.1.1.1"];

let cachedUri: string | null = null;
let cachedSourceUri: string | null = null;

function parseSrvUri(uri: string) {
  const withoutProtocol = uri.slice("mongodb+srv://".length);
  const atIndex = withoutProtocol.lastIndexOf("@");
  if (atIndex === -1) return null;

  const auth = withoutProtocol.slice(0, atIndex);
  const hostAndRest = withoutProtocol.slice(atIndex + 1);
  const slashIndex = hostAndRest.indexOf("/");
  const hostname =
    slashIndex === -1
      ? hostAndRest.split("?")[0]
      : hostAndRest.slice(0, slashIndex);
  const pathAndQuery =
    slashIndex === -1 ? "" : hostAndRest.slice(slashIndex);

  return { auth, hostname, pathAndQuery };
}

async function discoverReplicaSet(
  auth: string,
  hosts: string,
  pathAndQuery: string
): Promise<string | null> {
  const firstHost = hosts.split(",")[0];
  const separator = pathAndQuery.includes("?") ? "&" : "?";
  const probeUri = `mongodb://${auth}@${firstHost}${pathAndQuery}${separator}authSource=admin&ssl=true&directConnection=true`;

  try {
    const client = await MongoClient.connect(probeUri, {
      serverSelectionTimeoutMS: 10000,
    });
    const hello = await client.db("admin").command({ hello: 1 });
    await client.close();
    return typeof hello.setName === "string" ? hello.setName : null;
  } catch {
    return null;
  }
}

/**
 * Converts mongodb+srv:// to mongodb:// using public DNS.
 * Avoids querySrv ECONNREFUSED when the system DNS blocks SRV lookups.
 */
export async function resolveMongoUri(uri: string): Promise<string> {
  if (!uri.startsWith("mongodb+srv://")) {
    return uri;
  }

  if (cachedUri && cachedSourceUri === uri) {
    return cachedUri;
  }

  const parsed = parseSrvUri(uri);
  if (!parsed) {
    return uri;
  }

  const { auth, hostname, pathAndQuery } = parsed;

  dns.setServers(PUBLIC_DNS);

  const srvRecords = await dns.resolveSrv(`_mongodb._tcp.${hostname}`);
  const hosts = srvRecords.map((r) => `${r.name}:${r.port}`).join(",");

  const paramParts = new URLSearchParams();
  paramParts.set("authSource", "admin");
  paramParts.set("ssl", "true");

  try {
    const txtRecords = await dns.resolveTxt(`_mongodb._tcp.${hostname}`);
    const txt = txtRecords.map((parts) => parts.join("")).join("&");
    if (txt) {
      for (const pair of txt.split("&")) {
        const [key, value] = pair.split("=");
        if (key && value) paramParts.set(key, value);
      }
    }
  } catch {
    // TXT record is optional
  }

  if (!paramParts.has("replicaSet")) {
    const replicaSet = await discoverReplicaSet(auth, hosts, pathAndQuery);
    if (replicaSet) {
      paramParts.set("replicaSet", replicaSet);
    }
  }

  const existingQuery = pathAndQuery.includes("?")
    ? pathAndQuery.split("?")[1]
    : "";
  if (existingQuery) {
    for (const pair of existingQuery.split("&")) {
      const [key, value] = pair.split("=");
      if (key && value && !paramParts.has(key)) {
        paramParts.set(key, value);
      }
    }
  }

  const dbPath = pathAndQuery.includes("?")
    ? pathAndQuery.split("?")[0]
    : pathAndQuery;

  cachedSourceUri = uri;
  cachedUri = `mongodb://${auth}@${hosts}${dbPath}?${paramParts.toString()}`;

  return cachedUri;
}
