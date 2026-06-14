import crypto from "crypto";
import CryptoJS from "crypto-js";

function getKeyMaterial(encryptionKey: string) {
  return {
    key: CryptoJS.enc.Utf8.parse(encryptionKey),
    iv: CryptoJS.enc.Utf8.parse(encryptionKey.slice(0, 16)),
  };
}

function decryptWithCryptoJs<T>(
  encryptedData: string,
  encryptionKey: string
): T | null {
  try {
    const { key, iv } = getKeyMaterial(encryptionKey);
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
    if (!jsonString) return null;
    return JSON.parse(jsonString) as T;
  } catch {
    return null;
  }
}

function decryptWithOpenSsl<T>(
  encryptedData: string,
  encryptionKey: string
): T | null {
  try {
    const iv = Buffer.from(encryptionKey.substring(0, 16), "utf8");
    const encrypted = Buffer.from(encryptedData, "base64");
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(encryptionKey, "utf8"),
      iv
    );
    let decrypted = decipher.update(encrypted, undefined, "utf8");
    decrypted += decipher.final("utf8");
    if (!decrypted) return null;
    return JSON.parse(decrypted) as T;
  } catch {
    return null;
  }
}

export function encryptPesepayPayload(
  data: Record<string, unknown>,
  encryptionKey: string
): string {
  const { key, iv } = getKeyMaterial(encryptionKey);
  return CryptoJS.AES.encrypt(JSON.stringify(data), key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString();
}

export function decryptPesepayPayload<T = Record<string, unknown>>(
  encryptedData: string,
  encryptionKey: string
): T {
  const decrypted =
    decryptWithCryptoJs<T>(encryptedData, encryptionKey) ??
    decryptWithOpenSsl<T>(encryptedData, encryptionKey);

  if (!decrypted) {
    throw new Error("Failed to decrypt Pesepay payload");
  }

  return decrypted;
}
