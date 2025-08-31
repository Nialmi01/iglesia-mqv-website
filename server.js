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

// Rate limiting - configuración ajustada para producción
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: process.env.NODE_ENV === 'production' ? 1000 : 100, // 1000 en producción, 100 en desarrollo
    message: {
        error: 'Demasiadas solicitudes desde esta IP. Intenta de nuevo en 15 minutos.',
        retryAfter: '15 minutos'
    },
    standardHeaders: true, // Incluir rate limit info en headers
    legacyHeaders: false, // Deshabilitar headers X-RateLimit-*
    // Aplicar rate limiting solo a rutas específicas
    skip: (req) => {
        // No aplicar rate limiting a assets estáticos y health check
        return req.path.startsWith('/public') || 
               req.path.startsWith('/uploads') || 
               req.path === '/health' ||
               req.path.startsWith('/assets');
    }
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

// Conectar a MongoDB con configuración mejorada para producción
const connectDB = async () => {
    try {
        const mongoOptions = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000, // Timeout después de 10s
            socketTimeoutMS: 45000, // Cerrar sockets después de 45s de inactividad
            maxPoolSize: 10, // Mantener hasta 10 conexiones de socket
            // Remover opciones de buffering para evitar errores
        };

        if (process.env.NODE_ENV === 'production') {
            mongoOptions.retryWrites = true;
            mongoOptions.w = 'majority';
        }

        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/iglesia_mqv', mongoOptions);
        console.log('✅ Conectado a MongoDB');
        
        // Inicializar datos solo después de conectar exitosamente
        await initializeApp();
        
        return true;
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error.message);
        
        if (process.env.NODE_ENV === 'production') {
            console.log('🔧 Para configurar MongoDB en producción:');
            console.log('1. Crear cluster gratuito en MongoDB Atlas');
            console.log('2. Configurar MONGODB_URI en variables de entorno');
            console.log('3. Verificar Network Access en Atlas');
        } else {
            console.log('📝 Para instalar MongoDB localmente, visita: https://www.mongodb.com/try/download/community');
        }
        
        console.log('⚠️  La aplicación continuará funcionando, pero necesita MongoDB para ser completamente funcional');
        return false;
    }
};

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

// Función para inicializar la aplicación
const initializeApp = async () => {
    try {
        // Solo intentar si MongoDB está conectado
        if (mongoose.connection.readyState !== 1) {
            console.log('⚠️  MongoDB no disponible - Saltando inicialización de datos');
            return;
        }

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
        console.error('❌ Error inicializando la aplicación:', error.message);
        console.log('⚠️  Continuando sin inicialización de datos...');
    }
};

// Función async para iniciar la aplicación
const startApp = async () => {
    // Primero conectar a MongoDB
    const dbConnected = await connectDB();
    
    // Configuración para Render - escuchar en todas las interfaces
    const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
    
    // Iniciar servidor independientemente de MongoDB
    const server = app.listen(PORT, HOST, () => {
        console.log(`🚀 Servidor corriendo en http://${HOST}:${PORT}`);
        console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🌐 Host: ${HOST}`);
        console.log('');
        console.log('='.repeat(60));
        console.log('🏛️  IGLESIA MÁS QUE VENCEDORES (MQV) - WEBSITE');
        console.log('='.repeat(60));
        
        if (process.env.NODE_ENV === 'production') {
            console.log('🌍 URL Producción: https://iglesia-mqv-website.onrender.com');
            console.log('� Panel Admin: https://iglesia-mqv-website.onrender.com/admin');
        } else {
            console.log('�📍 URL Local: http://localhost:' + PORT);
            console.log('🔧 Panel Admin: http://localhost:' + PORT + '/admin');
        }
        
        console.log('🔑 Credenciales por defecto:');
        console.log('   - Usuario: admin');
        console.log('   - Contraseña: admin123');
        console.log('='.repeat(60));
        console.log('');
        
        if (dbConnected) {
            console.log('🎯 MongoDB conectado - Funcionalidad completa disponible');
        } else {
            console.log('⚠️  Modo demostración - Configurar MongoDB para funcionalidad completa');
        }
    });

    return server;
};

// Iniciar la aplicación
startApp().catch(console.error);

module.exports = app;
