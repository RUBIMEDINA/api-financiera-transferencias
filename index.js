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
const PORT = process.env.PORT || 5100;

// Middlewares
app.use(helmet());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/cuentas', accountRoutes);
app.use('/api/transacciones', transactionRoutes);

// Ruta de health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        mongo: mongoose.connection.readyState === 1 ? '✅ connected' : '❌ disconnected'
    });
});

// Ruta raíz
app.get('/', (req, res) => {
    res.send('🏦 API Financiera de Transferencias');
});

// Middleware de errores (debe ir al final)
app.use(errorHandler);

// ============================================
// CONEXIÓN A MONGODB
// ============================================
async function connectToMongo() {
    try {
        const mongoURI = process.env.MONGO_URI;
        
        if (!mongoURI) {
            console.error('❌ MONGO_URI no definida en .env');
            process.exit(1);
        }

        console.log('🔄 Conectando a MongoDB Atlas...');
        
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
        console.log('✅ Conectado a MongoDB Atlas');
        console.log(`📊 Base de datos: ${mongoose.connection.db.databaseName}`);
        
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
        
        if (error.message.includes('ENOTFOUND')) {
            console.log('\n💡 Verifica:');
            console.log('1. Tu conexión a internet');
            console.log('2. URI de MongoDB correcta en .env');
            console.log('3. Tu IP en Network Access de Atlas');
        } else if (error.message.includes('Authentication failed')) {
            console.log('\n💡 Verifica:');
            console.log('1. Usuario y contraseña correctos');
            console.log('2. El usuario existe en MongoDB Atlas');
        }
        
        process.exit(1);
    }
}

// ============================================
// INICIAR SERVIDOR
// ============================================
app.listen(PORT, async () => {
    console.log(`\n🏦 API Financiera corriendo en el puerto ${PORT}`);
    console.log(`📡 http://localhost:${PORT}`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/health\n`);
    
    await connectToMongo();
    
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