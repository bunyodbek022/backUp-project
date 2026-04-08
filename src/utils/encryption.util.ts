import * as crypto from 'crypto';

// The key used for AES-256-CBC encryption. It MUST be 32 bytes (256 bits).
// In a real production application, this should be set in .env as ENCRYPTION_KEY
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || 'default_secret_key_32_chars_long!';
const IV_LENGTH = 16;

export function encrypt(text: string): string {
  if (!text) return text;

  // To avoid re-encrypting already encrypted text in legacy flows
  if (text.includes(':') && text.split(':')[0].length === 32) return text;

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)),
    iv,
  );

  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
  if (!text) return text;

  // If the text doesn't contain the iv separator, it might be legacy plaintext
  if (!text.includes(':')) return text;

  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');

    // Validate IV length to ensure it's actually an encrypted string
    if (iv.length !== IV_LENGTH) return text;

    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)),
      iv,
    );

    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  } catch {
    // If decryption fails, return the original string just in case it was somehow plaintext with a colon
    return text;
  }
}
