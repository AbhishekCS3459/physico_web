import { createCipheriv, createDecipheriv, randomBytes } from "crypto"

const ALGORITHM = "aes-256-gcm"
const VERSION = "v1"

function getKey(): Buffer {
  const raw = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY
  if (!raw) {
    throw new Error("GOOGLE_TOKEN_ENCRYPTION_KEY is not set")
  }
  const key = /^[0-9a-f]{64}$/i.test(raw) ? Buffer.from(raw, "hex") : Buffer.from(raw, "base64")
  if (key.length !== 32) {
    throw new Error("GOOGLE_TOKEN_ENCRYPTION_KEY must be 32 bytes (64 hex characters or base64)")
  }
  return key
}

export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGORITHM, getKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return [VERSION, iv.toString("base64url"), tag.toString("base64url"), ciphertext.toString("base64url")].join(":")
}

export function decryptSecret(payload: string): string {
  const [version, iv, tag, ciphertext] = payload.split(":")
  if (version !== VERSION || !iv || !tag || !ciphertext) {
    throw new Error("Unrecognized encrypted secret format")
  }
  const decipher = createDecipheriv(ALGORITHM, getKey(), Buffer.from(iv, "base64url"))
  decipher.setAuthTag(Buffer.from(tag, "base64url"))
  return Buffer.concat([decipher.update(Buffer.from(ciphertext, "base64url")), decipher.final()]).toString("utf8")
}
