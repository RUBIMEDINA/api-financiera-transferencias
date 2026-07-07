const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    cuentaOrigenId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: [true, 'La cuenta de origen es obligatoria']
    },
    cuentaDestinoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: [true, 'La cuenta de destino es obligatoria']
    },
    monto: {
        type: Number,
        required: [true, 'El monto es obligatorio'],
        min: [0.01, 'El monto mínimo es 0.01']
    },
    tipo: {
        type: String,
        enum: ['transferencia', 'deposito', 'retiro'],
        default: 'transferencia'
    },
    estado: {
        type: String,
        enum: ['pendiente', 'completada', 'fallida', 'reversada'],
        default: 'pendiente'
    },
    descripcion: {
        type: String,
        trim: true,
        default: ''
    },
    referencia: {
        type: String,
        unique: true,
        default: function() {
            return `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        }
    },
    saldoOrigenAntes: {
        type: Number,
        required: true
    },
    saldoOrigenDespues: {
        type: Number,
        required: true
    },
    saldoDestinoAntes: {
        type: Number,
        required: true
    },
    saldoDestinoDespues: {
        type: Number,
        required: true
    },
    completadaEn: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

TransactionSchema.index({ cuentaOrigenId: 1, createdAt: -1 });
TransactionSchema.index({ cuentaDestinoId: 1, createdAt: -1 });
TransactionSchema.index({ referencia: 1 }, { unique: true });

TransactionSchema.pre('save', function(next) {
    if (this.isModified('estado') && this.estado === 'completada' && !this.completadaEn) {
        this.completadaEn = new Date();
    }
    next();
});

TransactionSchema.set('toJSON', {
    transform: function(doc, ret) {
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Transaction', TransactionSchema); 