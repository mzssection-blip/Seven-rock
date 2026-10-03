import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";

function deriveKey(password: string, salt: string) {
  return new Promise<Buffer>((resolve, reject) => {
    scryptCallback(password, salt, 64, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = await deriveKey(password, salt);
  return `scrypt$${salt}$${key.toString("base64")}`;
}

export async function verifyPassword(password: string, encodedPassword: string) {
  const [algorithm, salt, encodedKey] = encodedPassword.split("$");
  if (algorithm !== "scrypt" || !salt || !encodedKey) return false;

  const storedKey = Buffer.from(encodedKey, "base64");
  const candidateKey = await deriveKey(password, salt);
  return storedKey.length === candidateKey.length && timingSafeEqual(storedKey, candidateKey);
}
