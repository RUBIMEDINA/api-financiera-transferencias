const jwt = require('jsonwebtoken');

const APP_TOKEN_SECRET = process.env.APP_TOKEN_SECRET || 'app_token_secret_financiero_2026';

const generarAppToken = () => {
    const payload = {
        type: 'app_token',
        name: 'API Financiera Transferencias',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    };
    return jwt.sign(payload, APP_TOKEN_SECRET, { expiresIn: '365d' });
};

const verificarAppToken = (token) => {
    try {
        const decoded = jwt.verify(token, APP_TOKEN_SECRET);
        return decoded.type === 'app_token';
    } catch (error) {
        return false;
    }
};

console.log('🔑 ===== TOKEN DE APLICACIÓN =====');
console.log(`📌 TOKEN: ${generarAppToken()}`);
console.log('===================================');

module.exports = {
    generarAppToken,
    verificarAppToken,
    APP_TOKEN_SECRET
}; 