/**
 * Encrypt sensitive data
 * @param data Plain text data to encrypt
 * @returns Encrypted data as hex string (iv:authTag:encryptedData)
 */
export declare function encryptData(data: string): string;
/**
 * Decrypt sensitive data
 * @param encryptedData Encrypted data in format (iv:authTag:encryptedData)
 * @returns Decrypted plain text
 */
export declare function decryptData(encryptedData: string): string;
/**
 * Check if data is encrypted
 */
export declare function isEncrypted(data: string): boolean;
/**
 * Safely get decrypted data (handles already decrypted data)
 */
export declare function getDecryptedValue(data: string): string;
//# sourceMappingURL=encryption.d.ts.map