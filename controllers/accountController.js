const Account = require('../models/Account');

const crearCuenta = async (req, res) => {
    try {
        const { numeroCuenta, saldoInicial, moneda } = req.body;

        const cuentaExistente = await Account.findOne({ numeroCuenta });
        if (cuentaExistente) {
            return res.status(400).json({
                success: false,
                message: 'El número de cuenta ya está registrado',
                code: 'ACCOUNT_EXISTS'
            });
        }

        const account = await Account.create({
            usuarioId: req.user._id,
            numeroCuenta,
            saldo: saldoInicial || 0,
            saldoInicial: saldoInicial || 0,
            moneda: moneda || 'MXN'
        });

        res.status(201).json({
            success: true,
            message: 'Cuenta creada exitosamente',
            data: account
        });

    } catch (error) {
        console.error('Error creando cuenta:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear cuenta',
            code: 'CREATE_ACCOUNT_ERROR'
        });
    }
};

const obtenerMisCuentas = async (req, res) => {
    try {
        const accounts = await Account.find({ usuarioId: req.user._id });
        res.json({ success: true, data: accounts });
    } catch (error) {
        console.error('Error obteniendo cuentas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener cuentas',
            code: 'GET_ACCOUNTS_ERROR'
        });
    }
};

module.exports = {
    crearCuenta,
    obtenerMisCuentas
}; 