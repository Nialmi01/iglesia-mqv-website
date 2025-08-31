const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para verificar token JWT
const verificarToken = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '') || 
                     req.cookies?.token ||
                     req.session?.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Acceso denegado. No se proporcionó token.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        const user = await User.findById(decoded.userId).select('-password');

        if (!user || !user.activo) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido o usuario inactivo.'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Error en verificación de token:', error);
        res.status(401).json({
            success: false,
            message: 'Token inválido.'
        });
    }
};

// Middleware para verificar rol de administrador
const verificarAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Acceso denegado. Se requieren permisos de administrador.'
        });
    }
};

// Middleware para verificar que el usuario pertenece al ministerio
const verificarMinisterio = (req, res, next) => {
    const ministerioRequerido = req.params.ministerio || req.body.ministerio;
    
    if (req.user.role === 'admin' || req.user.ministerio === ministerioRequerido) {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'No tienes permisos para acceder a este ministerio.'
        });
    }
};

// Middleware para rutas web (no API)
const verificarTokenWeb = async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.session?.token;

        if (!token) {
            return res.redirect('/admin/login');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        const user = await User.findById(decoded.userId).select('-password');

        if (!user || !user.activo) {
            res.clearCookie('token');
            return res.redirect('/admin/login');
        }

        req.user = user;
        res.locals.user = user; // Para usar en las vistas
        next();
    } catch (error) {
        console.error('Error en verificación de token web:', error);
        res.clearCookie('token');
        res.redirect('/admin/login');
    }
};

module.exports = {
    verificarToken,
    verificarAdmin,
    verificarMinisterio,
    verificarTokenWeb
};
