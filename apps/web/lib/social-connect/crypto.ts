import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'

import { getOAuthSecret } from './config'

const ALGORITHM = 'aes-256-gcm'
const IV_BYTES = 12

function deriveKey(): Buffer {
  return createHash('sha256').update(getOAuthSecret()).digest()
}

/** Encrypt a JSON-serializable payload into a URL-safe sealed string. */
export function sealJson(payload: unknown): string {
  const iv = randomBytes(IV_BYTES)
  const cipher = createCipheriv(ALGORITHM, deriveKey(), iv)
  const plaintext = Buffer.from(JSON.stringify(payload), 'utf8')
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, encrypted]).toString('base64url')
}

/** Decrypt a sealed string previously produced by `sealJson`. */
export function unsealJson<T>(sealed: string): T {
  const buffer = Buffer.from(sealed, 'base64url')
  if (buffer.length <= IV_BYTES + 16) {
    throw new Error('Invalid sealed payload')
  }

  const iv = buffer.subarray(0, IV_BYTES)
  const tag = buffer.subarray(IV_BYTES, IV_BYTES + 16)
  const encrypted = buffer.subarray(IV_BYTES + 16)
  const decipher = createDecipheriv(ALGORITHM, deriveKey(), iv)
  decipher.setAuthTag(tag)
  const plaintext = Buffer.concat([decipher.update(encrypted), decipher.final()])
  return JSON.parse(plaintext.toString('utf8')) as T
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url')
}
