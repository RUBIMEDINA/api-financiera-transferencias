const { verificarAppToken } = require('../utils/appToken');

const validarAppToken = (req, res, next) => {
    const appToken = req.headers['app-token'];

    if (!appToken) {
        return res.status(401).json({
            success: false,
            message: 'Token de aplicación requerido',
            code: 'APP_TOKEN_REQUIRED',
            error: 'El header "app-token" es obligatorio para acceder a la API'
        });
    }

    if (!verificarAppToken(appToken)) {
        return res.status(401).json({
            success: false,
            message: 'Token de aplicación inválido',
            code: 'APP_TOKEN_INVALID',
            error: 'El token de aplicación no es válido o ha expirado'
        });
    }

    next();
};

module.exports = validarAppToken; 