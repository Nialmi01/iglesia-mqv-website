const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de seguridad
app.use(helmet({
    contentSecurityPolicy: false // Permitir contenido inline para desarrollo
}));
app.use(cors());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // límite de 100 requests por IP
});
app.use(limiter);

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configurar EJS como motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/iglesia_mqv')
    .then(() => console.log('✅ Conectado a MongoDB'))
    .catch(err => {
        console.error('❌ Error conectando a MongoDB:', err.message);
        console.log('📝 Para instalar MongoDB, visita: https://www.mongodb.com/try/download/community');
        console.log('⚠️  La aplicación continuará funcionando, pero necesita MongoDB para ser completamente funcional');
    });

// Importar rutas
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const ministerioRoutes = require('./routes/ministerios');
const publicRoutes = require('./routes/public');

// Ruta de healthcheck para Docker
app.get('/health', (req, res) => {
    const healthcheck = {
        uptime: process.uptime(),
        message: 'OK',
        timestamp: Date.now(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    };
    res.status(200).json(healthcheck);
});

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/api/ministerios', ministerioRoutes);
app.use('/', publicRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
    });
});

// Ruta 404
app.use('*', (req, res) => {
    res.status(404).render('404', { title: 'Página no encontrada' });
});

// Inicializar datos por defecto
const initializeApp = async () => {
    try {
        const User = require('./models/User');
        
        // Buscar usuario administrador existente
        const adminExists = await User.findOne({ username: 'admin' });
        
        if (!adminExists) {
            // Crear nuevo usuario administrador
            const admin = new User({
                username: 'admin',
                email: 'admin@iglesiaiqv.com',
                password: 'admin123', // El middleware pre-save se encargará del hash
                role: 'admin',
                ministerio: 'Administración',
                activo: true
            });
            await admin.save();
            console.log('👤 Usuario administrador creado - username: admin, password: admin123');
        } else {
            // Solo verificar que el admin esté activo
            await User.findOneAndUpdate(
                { username: 'admin' },
                { 
                    activo: true,
                    role: 'admin'
                }
            );
            console.log('✅ Usuario administrador verificado - username: admin');
        }
    } catch (error) {
        console.error('Error inicializando la aplicación:', error.message);
    }
};

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log('');
    console.log('='.repeat(60));
    console.log('🏛️  IGLESIA MÁS QUE VENCEDORES (MQV) - WEBSITE');
    console.log('='.repeat(60));
    console.log('📍 URL Local: http://localhost:' + PORT);
    console.log('🔧 Panel Admin: http://localhost:' + PORT + '/admin');
    console.log('🔑 Credenciales por defecto:');
    console.log('   - Usuario: admin');
    console.log('   - Contraseña: admin123');
    console.log('='.repeat(60));
    console.log('');
    
    // Intentar inicializar datos solo si MongoDB está disponible
    setTimeout(() => {
        if (mongoose.connection.readyState === 1) {
            initializeApp();
        } else {
            console.log('⚠️  MongoDB no disponible - Inicialización omitida');
        }
    }, 2000);
});

module.exports = app;
