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

// ============================================
// CONEXIÓN A MONGODB
// ============================================
async function connectToMongo() {
    try {

        if (mongoose.connection.readyState === 1) {
            return;
        }

        const mongoURI = process.env.MONGO_URI;

        if (!mongoURI) {
            throw new Error('MONGO_URI no definida');
        }

        console.log('🔄 Conectando a MongoDB Atlas...');

        await mongoose.connect(mongoURI);

        console.log('✅ Conectado a MongoDB Atlas');
        console.log(`📊 Base de datos: ${mongoose.connection.db.databaseName}`);

    } catch (error) {

        console.error('❌ Error MongoDB:', error.message);

    }
}

// Conectar inmediatamente
connectToMongo();

// Middlewares
app.use(helmet());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/cuentas', accountRoutes);
app.use('/api/transacciones', transactionRoutes);

// Ruta Health
app.get('/health', (req, res) => {

    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        mongo: mongoose.connection.readyState === 1 ? '✅ connected' : '❌ disconnected'
    });

});

// Ruta principal
app.get('/', (req, res) => {
    res.send('🏦 API Financiera de Transferencias');
});

// Middleware de errores
app.use(errorHandler);

// Solo iniciar servidor en local/Render
if (!process.env.VERCEL) {

    app.listen(PORT, () => {

        console.log(`🏦 API Financiera corriendo en el puerto ${PORT}`);
        console.log(`📡 http://localhost:${PORT}`);

    });

}

// Exportar para Vercel
module.exports = app; 