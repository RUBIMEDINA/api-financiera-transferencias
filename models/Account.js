const mongoose = require('mongoose');
const { encryptAccountNumber, decryptAccountNumber } = require('../utils/crypto');

const AccountSchema = new mongoose.Schema({
    usuarioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El usuario es obligatorio']
    },
    numeroCuenta: {
        type: String,
        required: [true, 'El número de cuenta es obligatorio'],
        unique: true,
        set: function(value) {
            if (value && !value.includes('"iv"')) {
                return encryptAccountNumber(value);
            }
            return value;
        }
    },
    saldo: {
        type: Number,
        default: 0,
        min: [0, 'El saldo no puede ser negativo']
    },
    moneda: {
        type: String,
        enum: ['MXN', 'USD', 'EUR'],
        default: 'MXN'
    },
    activa: {
        type: Boolean,
        default: true
    },
    saldoInicial: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

AccountSchema.methods.getNumeroCuenta = function() {
    return decryptAccountNumber(this.numeroCuenta);
};

AccountSchema.index({ usuarioId: 1 });
AccountSchema.index({ numeroCuenta: 1 }, { unique: true });

AccountSchema.set('toJSON', {
    transform: function(doc, ret) {
        try {
            ret.numeroCuenta = decryptAccountNumber(ret.numeroCuenta);
        } catch (error) {
            ret.numeroCuenta = '***';
        }
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Account', AccountSchema); 