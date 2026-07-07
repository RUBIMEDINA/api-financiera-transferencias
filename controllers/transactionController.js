const mongoose = require('mongoose');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

const transferir = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { cuentaOrigenId, cuentaDestinoId, monto, descripcion } = req.body;

        if (!cuentaOrigenId || !cuentaDestinoId || !monto) {
            return res.status(400).json({
                success: false,
                message: 'Cuenta origen, cuenta destino y monto son obligatorios',
                code: 'MISSING_FIELDS'
            });
        }

        if (monto <= 0) {
            return res.status(400).json({
                success: false,
                message: 'El monto debe ser mayor a 0',
                code: 'INVALID_AMOUNT'
            });
        }

        if (cuentaOrigenId === cuentaDestinoId) {
            return res.status(400).json({
                success: false,
                message: 'No puedes transferir a la misma cuenta',
                code: 'SAME_ACCOUNT'
            });
        }

        const cuentaOrigen = await Account.findById(cuentaOrigenId).session(session);
        const cuentaDestino = await Account.findById(cuentaDestinoId).session(session);

        if (!cuentaOrigen) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: 'Cuenta de origen no encontrada',
                code: 'ACCOUNT_NOT_FOUND'
            });
        }

        if (!cuentaDestino) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: 'Cuenta de destino no encontrada',
                code: 'ACCOUNT_NOT_FOUND'
            });
        }

        if (cuentaOrigen.usuarioId.toString() !== req.user._id.toString()) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para transferir desde esta cuenta',
                code: 'FORBIDDEN'
            });
        }

        if (cuentaOrigen.saldo < monto) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'Saldo insuficiente',
                code: 'INSUFFICIENT_BALANCE'
            });
        }

        const saldoOrigenAntes = cuentaOrigen.saldo;
        const saldoDestinoAntes = cuentaDestino.saldo;

        cuentaOrigen.saldo -= monto;
        cuentaDestino.saldo += monto;

        await cuentaOrigen.save({ session });
        await cuentaDestino.save({ session });

        const transaction = await Transaction.create([{
            cuentaOrigenId: cuentaOrigen._id,
            cuentaDestinoId: cuentaDestino._id,
            monto,
            tipo: 'transferencia',
            estado: 'completada',
            descripcion: descripcion || 'Transferencia entre cuentas',
            saldoOrigenAntes,
            saldoOrigenDespues: cuentaOrigen.saldo,
            saldoDestinoAntes,
            saldoDestinoDespues: cuentaDestino.saldo,
            completadaEn: new Date()
        }], { session });

        await session.commitTransaction();
        session.endSession();

        res.json({
            success: true,
            message: 'Transferencia realizada exitosamente',
            data: {
                transaccion: transaction[0],
                nuevoSaldoOrigen: cuentaOrigen.saldo,
                nuevoSaldoDestino: cuentaDestino.saldo
            }
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        
        console.error('Error en transferencia:', error);
        res.status(500).json({
            success: false,
            message: 'Error al realizar transferencia',
            code: 'TRANSFER_ERROR'
        });
    }
};

const obtenerMisTransacciones = async (req, res) => {
    try {
        const cuentas = await Account.find({ usuarioId: req.user._id });
        const cuentasIds = cuentas.map(c => c._id);

        const transactions = await Transaction.find({
            $or: [
                { cuentaOrigenId: { $in: cuentasIds } },
                { cuentaDestinoId: { $in: cuentasIds } }
            ]
        })
            .populate('cuentaOrigenId', 'numeroCuenta')
            .populate('cuentaDestinoId', 'numeroCuenta')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: transactions });

    } catch (error) {
        console.error('Error obteniendo transacciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener transacciones',
            code: 'GET_TRANSACTIONS_ERROR'
        });
    }
};

module.exports = {
    transferir,
    obtenerMisTransacciones
}; 