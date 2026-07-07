const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012';
const IV_LENGTH = 16;

const encrypt = (text) => {
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv);
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const authTag = cipher.getAuthTag().toString('hex');
        
        return {
            iv: iv.toString('hex'),
            encryptedData: encrypted,
            authTag: authTag
        };
    } catch (error) {
        throw new Error('Error al cifrar datos');
    }
};

const decrypt = (iv, encryptedData, authTag) => {
    try {
        const ivBuffer = Buffer.from(iv, 'hex');
        const authTagBuffer = Buffer.from(authTag, 'hex');
        
        const decipher = crypto.createDecipheriv(
            'aes-256-gcm',
            Buffer.from(ENCRYPTION_KEY),
            ivBuffer
        );
        
        decipher.setAuthTag(authTagBuffer);
        
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        throw new Error('Error al descifrar datos');
    }
};

const encryptAccountNumber = (accountNumber) => {
    const result = encrypt(accountNumber);
    return JSON.stringify(result);
};

const decryptAccountNumber = (encryptedData) => {
    try {
        const data = JSON.parse(encryptedData);
        return decrypt(data.iv, data.encryptedData, data.authTag);
    } catch (error) {
        throw new Error('Error al desencriptar número de cuenta');
    }
};

module.exports = {
    encrypt,
    decrypt,
    encryptAccountNumber,
    decryptAccountNumber
}; 