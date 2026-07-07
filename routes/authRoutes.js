const express = require('express');
const router = express.Router();
const {
    registrar,
    login,
    obtenerPerfil
} = require('../controllers/authController');
const { verificarAutenticacion } = require('../middleware/auth');

router.post('/registrar', registrar);
router.post('/login', login);
router.get('/perfil', verificarAutenticacion, obtenerPerfil);

module.exports = router; 