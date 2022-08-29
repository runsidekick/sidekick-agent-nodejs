const crypto = require('crypto');

export default class CryptoUtils {
    static generateSHA256(source: string) {
        return crypto
            .createHash('sha256')
            .update(source)
            .digest('hex');
    } 
}
