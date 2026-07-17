const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const accountRoutes = require('./routes/accountRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

const errorHandler = require('./middleware/errorHandler');
const validarAppToken = require('./middleware/appTokenValidator');
const { generarAppToken } = require('./utils/appToken');

const app = express();

// ============================================
// RUTAS PÚBLICAS (NO REQUIEREN APP-TOKEN)
// ============================================
const RUTAS_PUBLICAS = ['/health', '/api/app-token'];

// ============================================
// MIDDLEWARE DE APP-TOKEN
// ============================================
app.use((req, res, next) => {
    if (RUTAS_PUBLICAS.includes(req.path)) {
        return next();
    }
    validarAppToken(req, res, next);
});

// Middlewares generales
app.use(helmet());
app.use(express.json());

// ============================================
// RUTA PÚBLICA: OBTENER APP-TOKEN
// ============================================
app.get('/api/app-token', (req, res) => {
    res.json({
        success: true,
        message: 'Token de aplicación generado',
        data: {
            token: generarAppToken(),
            usage: 'Usa este token en el header "app-token" para todas las peticiones'
        }
    });
});

// ============================================
// RUTAS PROTEGIDAS (REQUIEREN APP-TOKEN)
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/cuentas', accountRoutes);
app.use('/api/transacciones', transactionRoutes);

// ============================================
// HEALTH CHECK (PÚBLICO)
// ============================================
app.get('/health', (req, res) => {
    const state = mongoose.connection.readyState;
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        mongo: states[state] || 'unknown',
        readyState: state,
        host: mongoose.connection.host || 'no host',
        database: mongoose.connection.db ? mongoose.connection.db.databaseName : 'no database'
    });
});

app.get('/', (req, res) => {
    res.send('🏦 API Financiera de Transferencias');
});

app.use(errorHandler);

// ============================================
// CONEXIÓN A MONGODB
// ============================================
const mongoURI = process.env.MONGO_URI;
console.log('==================================');
console.log('MONGO_URI existe:', !!mongoURI);
console.log('Primeros 40 caracteres:', mongoURI ? mongoURI.substring(0, 40) : 'NO EXISTE');
console.log('==================================');

if (mongoURI) {
    console.log('🔄 Intentando conectar a MongoDB...');
    
    mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
    })
    .then(() => {
        console.log('✅ Conectado a MongoDB Atlas');
        console.log(`📊 Base de datos: ${mongoose.connection.db.databaseName}`);
        console.log(`🔗 Host: ${mongoose.connection.host}`);
    })
    .catch((error) => {
        console.error('❌ Error de conexión:', error.message);
    });
    
    mongoose.connection.on('error', (err) => {
        console.error('❌ Error en conexión de MongoDB:', err.message);
    });
    
    mongoose.connection.on('connected', () => {
        console.log('✅ MongoDB conectado (evento)');
    });
    
    mongoose.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB desconectado');
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
        console.log('   📌 RUTAS PÚBLICAS (sin app-token):');
        console.log('   GET    /health                  - Health Check');
        console.log('   GET    /api/app-token           - Obtener token de aplicación');
        console.log('   📌 RUTAS PROTEGIDAS (requieren app-token):');
        console.log('   POST   /api/auth/registrar      - Registrar usuario');
        console.log('   POST   /api/auth/login          - Iniciar sesión');
        console.log('   GET    /api/auth/perfil         - Obtener perfil');
        console.log('   POST   /api/cuentas             - Crear cuenta');
        console.log('   GET    /api/cuentas/mis-cuentas - Mis cuentas');
        console.log('   POST   /api/transacciones/transferir - Transferir');
        console.log('   GET    /api/transacciones/mis-transacciones - Mis transacciones\n');
    });
}

module.exports = app; 