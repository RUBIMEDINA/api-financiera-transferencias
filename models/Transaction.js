const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    cuentaOrigenId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    cuentaDestinoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    monto: {
        type: Number,
        required: true,
        min: 0
    },
    tipo: {
        type: String,
        enum: ['transferencia', 'deposito', 'retiro'],
        default: 'transferencia'
    },
    estado: {
        type: String,
        enum: ['pendiente', 'completada', 'fallida'],
        default: 'pendiente'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Transaction', TransactionSchema); 