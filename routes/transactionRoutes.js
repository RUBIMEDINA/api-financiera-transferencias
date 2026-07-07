const express = require('express');
const router = express.Router();
const {
    transferir,
    obtenerMisTransacciones
} = require('../controllers/transactionController');
const { verificarAutenticacion } = require('../middleware/auth');

router.use(verificarAutenticacion);

router.post('/transferir', transferir);
router.get('/mis-transacciones', obtenerMisTransacciones);

module.exports = router; 