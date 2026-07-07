const express = require('express');
const router = express.Router();
const {
    crearCuenta,
    obtenerMisCuentas
} = require('../controllers/accountController');
const { verificarAutenticacion } = require('../middleware/auth');

router.use(verificarAutenticacion);

router.post('/', crearCuenta);
router.get('/mis-cuentas', obtenerMisCuentas);

module.exports = router; 