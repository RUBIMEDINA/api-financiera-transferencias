const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');

// Cargar variables de entorno
dotenv.config();

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const accountRoutes = require('./routes/accountRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

// Importar middleware de errores
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middlewares
app.use(helmet());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/cuentas', accountRoutes);
app.use('/api/transacciones', transactionRoutes);

// Ruta de health check
app.get('/health', (req, res) => {
    const state = mongoose.connection.readyState;
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        mongo: states[state] || 'unknown',
        readyState: state
    });
});

// Ruta raíz
app.get('/', (req, res) => {
    res.send('🏦 API Financiera de Transferencias');
});

// Middleware de errores (debe ir al final)
app.use(errorHandler);

// ============================================
// CONEXIÓN A MONGODB (SIN ESPERAR)
// ============================================
const mongoURI = process.env.MONGO_URI;
console.log('==================================');
console.log('MONGO_URI existe:', !!mongoURI);
console.log('Primeros 40 caracteres:', mongoURI ? mongoURI.substring(0, 40) : 'NO EXISTE');
console.log('==================================');

if (mongoURI) {
    mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    })
    .then(() => {
        console.log('✅ Conectado a MongoDB Atlas');
        console.log(`📊 Base de datos: ${mongoose.connection.db.databaseName}`);
    })
    .catch((error) => {
        console.error('❌ Error de conexión:', error.message);
    });
} else {
    console.error('❌ MONGO_URI no definida en .env');
}

// ============================================
// INICIAR SERVIDOR (SOLO LOCAL)
// ============================================
const PORT = process.env.PORT || 5100;

if (!process.env.VERCEL) {
    app.listen(PORT, async () => {
        console.log(`\n🏦 API Financiera corriendo en el puerto ${PORT}`);
        console.log(`📡 http://localhost:${PORT}`);
        console.log(`🔗 Health Check: http://localhost:${PORT}/health\n`);
        
        console.log('\n✅ Sistema financiero listo para usar');
        console.log('📋 Endpoints disponibles:');
        console.log('   POST   /api/auth/registrar       - Registrar usuario');
        console.log('   POST   /api/auth/login           - Iniciar sesión');
        console.log('   GET    /api/auth/perfil          - Obtener perfil');
        console.log('   POST   /api/cuentas              - Crear cuenta');
        console.log('   GET    /api/cuentas/mis-cuentas  - Mis cuentas');
        console.log('   POST   /api/transacciones/transferir - Transferir');
        console.log('   GET    /api/transacciones/mis-transacciones - Mis transacciones\n');
    });
}

// ============================================
// EXPORTAR PARA VERCEL
// ============================================
module.exports = app; 