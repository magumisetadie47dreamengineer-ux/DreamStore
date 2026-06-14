export function getPesepayIntegrationKey(): string {
  return process.env.PESEPAY_INTEGRATION_KEY?.trim() || "";
}

export function getPesepayEncryptionKey(): string {
  return process.env.PESEPAY_ENCRYPTION_KEY?.trim() || "";
}

export function isPesepayConfigured(): boolean {
  return Boolean(getPesepayIntegrationKey() && getPesepayEncryptionKey());
}

export function getPesepayCurrency(): string {
  return process.env.PESEPAY_CURRENCY?.trim().toUpperCase() || "USD";
}

export function isPesepaySandbox(): boolean {
  const env = process.env.PESEPAY_ENV?.trim().toLowerCase();
  if (env === "production" || env === "live") return false;
  if (env === "sandbox" || env === "test") return true;
  return process.env.NODE_ENV !== "production";
}

export function getPesepayApiBaseUrl(): string {
  if (isPesepaySandbox()) {
    return "https://api.test.sandbox.pesepay.com/payments-engine/v1/payments";
  }
  return "https://api.pesepay.com/api/payments-engine/v1/payments";
}
