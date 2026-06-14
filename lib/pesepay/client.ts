import {
  decryptPesepayPayload,
  encryptPesepayPayload,
} from "@/lib/pesepay/crypto";
import {
  getPesepayApiBaseUrl,
  getPesepayEncryptionKey,
  getPesepayIntegrationKey,
} from "@/lib/pesepay/config";

export type PesepayTransaction = {
  referenceNumber?: string;
  redirectUrl?: string;
  pollUrl?: string;
  transactionStatus?: string;
  transactionStatusDescription?: string;
  amountDetails?: {
    amount?: number;
    currencyCode?: string;
  };
};

type InitiateTransactionInput = {
  amount: number;
  currencyCode: string;
  reasonForPayment: string;
  resultUrl: string;
  returnUrl: string;
};

async function pesepayRequest<T>(
  method: "GET" | "POST",
  path: string,
  body?: Record<string, unknown>
): Promise<T> {
  const integrationKey = getPesepayIntegrationKey();
  const encryptionKey = getPesepayEncryptionKey();
  const url = `${getPesepayApiBaseUrl()}${path}`;

  const response = await fetch(url, {
    method,
    headers: {
      authorization: integrationKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    ...(body
      ? {
          body: JSON.stringify({
            payload: encryptPesepayPayload(body, encryptionKey),
          }),
        }
      : {}),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        `Pesepay request failed (${response.status})`
    );
  }

  if (!data.payload) {
    throw new Error("Pesepay response missing encrypted payload");
  }

  return decryptPesepayPayload<T>(data.payload, encryptionKey);
}

export function isPesepayPaymentSuccessful(
  transaction: PesepayTransaction
): boolean {
  return transaction.transactionStatus === "SUCCESS";
}

export async function initiatePesepayTransaction(
  input: InitiateTransactionInput
): Promise<PesepayTransaction> {
  return pesepayRequest<PesepayTransaction>("POST", "/initiate", {
    amountDetails: {
      amount: input.amount,
      currencyCode: input.currencyCode,
    },
    reasonForPayment: input.reasonForPayment,
    resultUrl: input.resultUrl,
    returnUrl: input.returnUrl,
  });
}

export async function checkPesepayPaymentStatus(
  referenceNumber: string
): Promise<PesepayTransaction> {
  const integrationKey = getPesepayIntegrationKey();
  const encryptionKey = getPesepayEncryptionKey();
  const url = `${getPesepayApiBaseUrl()}/check-payment?referenceNumber=${encodeURIComponent(referenceNumber)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      authorization: integrationKey,
      "content-type": "application/json",
      accept: "application/json",
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        `Pesepay status check failed (${response.status})`
    );
  }

  if (!data.payload) {
    throw new Error("Pesepay status response missing encrypted payload");
  }

  return decryptPesepayPayload<PesepayTransaction>(data.payload, encryptionKey);
}

export function parsePesepayWebhookPayload(
  payload: string
): PesepayTransaction {
  return decryptPesepayPayload<PesepayTransaction>(
    payload,
    getPesepayEncryptionKey()
  );
}
