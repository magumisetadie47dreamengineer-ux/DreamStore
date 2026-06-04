/** Canonical production URL for DreamStore (Stripe redirects, metadata, etc.). */
export const productionSiteUrl = "https://dreamstore-inky.vercel.app";

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return productionSiteUrl;
}
