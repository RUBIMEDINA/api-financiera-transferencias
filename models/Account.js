const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
    usuario: {
        type: String,
        required: true
    },
    numeroCuenta: {
        type: String,
        required: true,
        unique: true
    },
    saldo: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Account', AccountSchema);
