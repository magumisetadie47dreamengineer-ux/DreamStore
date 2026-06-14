import { getSiteUrl } from "@/lib/site";

export function getCheckoutBaseUrl(): string {
  if (process.env.NODE_ENV === "production") {
    return getSiteUrl();
  }
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}
