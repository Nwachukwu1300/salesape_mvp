import crypto from 'crypto';
/**
 * Encryption utility for sensitive data
 * Used for encrypting API keys, calendar tokens, and other credentials
 */
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
if (!ENCRYPTION_KEY) {
    console.warn('[Encryption] WARNING: ENCRYPTION_KEY not set in environment. Using development mode (insecure).');
}
/**
 * Derive a 32-byte key from the encryption key
 */
function getKey() {
    if (!ENCRYPTION_KEY) {
        // Development mode: use a default key (INSECURE)
        return crypto.scryptSync('default-dev-key', 'salt', 32);
    }
    // Production: derive from environment key
    return crypto.scryptSync(ENCRYPTION_KEY, 'app-salt', 32);
}
/**
 * Encrypt sensitive data
 * @param data Plain text data to encrypt
 * @returns Encrypted data as hex string (iv:authTag:encryptedData)
 */
export function encryptData(data) {
    try {
        const key = getKey();
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag();
        // Format: iv:authTag:encryptedData
        return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    }
    catch (err) {
        console.error('[Encryption] Failed to encrypt data:', err);
        throw new Error('Encryption failed');
    }
}
/**
 * Decrypt sensitive data
 * @param encryptedData Encrypted data in format (iv:authTag:encryptedData)
 * @returns Decrypted plain text
 */
export function decryptData(encryptedData) {
    try {
        const key = getKey();
        const parts = encryptedData.split(':');
        if (parts.length !== 3) {
            throw new Error('Invalid encrypted data format');
        }
        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        const encrypted = parts[2];
        const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    catch (err) {
        console.error('[Encryption] Failed to decrypt data:', err);
        throw new Error('Decryption failed');
    }
}
/**
 * Check if data is encrypted
 */
export function isEncrypted(data) {
    return data.includes(':') && data.split(':').length === 3;
}
/**
 * Safely get decrypted data (handles already decrypted data)
 */
export function getDecryptedValue(data) {
    if (isEncrypted(data)) {
        return decryptData(data);
    }
    return data;
}
//# sourceMappingURL=encryption.js.map