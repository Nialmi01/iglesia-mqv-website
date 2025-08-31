const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Media = require('../models/Media');
const { verificarTokenWeb, verificarAdmin } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Middleware para parsing de cookies
const cookieParser = require('cookie-parser');
router.use(cookieParser());

// Ruta raíz de admin - redirigir al dashboard
router.get('/', (req, res) => {
    if (req.cookies.token) {
        return res.redirect('/admin/dashboard');
    }
    res.redirect('/admin/login');
});

// Página de login
router.get('/login', (req, res) => {
    if (req.cookies.token) {
        return res.redirect('/admin/dashboard');
    }
    res.render('admin/login', { title: 'Iniciar Sesión - Admin MQV', error: null });
});

// Procesar login
router.post('/login', async (req, res) => {
    try {
        console.log('🔐 Intento de login:', req.body);
        const { username, password } = req.body;

        if (!username || !password) {
            console.log('❌ Faltan credenciales');
            return res.render('admin/login', { 
                title: 'Iniciar Sesión - Admin MQV', 
                error: 'Usuario y contraseña son requeridos.' 
            });
        }

        // Verificar si MongoDB está disponible
        if (mongoose.connection.readyState !== 1) {
            console.log('⚠️ MongoDB no disponible, usando credenciales por defecto');
            
            // Credenciales por defecto para modo demostración
            if (username === 'admin' && password === 'admin123') {
                const jwt = require('jsonwebtoken');
                const token = jwt.sign(
                    { 
                        userId: 'demo-admin', 
                        username: 'admin',
                        role: 'admin',
                        ministerio: 'Administración'
                    },
                    process.env.JWT_SECRET || 'fallback-secret',
                    { expiresIn: '24h' }
                );

                res.cookie('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 24 * 60 * 60 * 1000
                });

                console.log('✅ Login exitoso (modo demostración)');
                return res.redirect('/admin/dashboard');
            } else {
                return res.render('admin/login', { 
                    title: 'Iniciar Sesión - Admin MQV', 
                    error: 'Credenciales inválidas. Use: admin / admin123' 
                });
            }
        }

        // MongoDB disponible - usar base de datos
        const user = await User.findOne({ 
            $or: [{ username }, { email: username }]
        });
        console.log('👤 Usuario encontrado:', user ? user.username : 'NO ENCONTRADO');

        if (!user || !user.activo) {
            console.log('❌ Usuario no encontrado o inactivo');
            return res.render('admin/login', { 
                title: 'Iniciar Sesión - Admin MQV', 
                error: 'Credenciales inválidas.' 
            });
        }

        const isPasswordValid = await user.comparePassword(password);
        console.log('🔑 Contraseña válida:', isPasswordValid);
        
        if (!isPasswordValid) {
            console.log('❌ Contraseña incorrecta');
            return res.render('admin/login', { 
                title: 'Iniciar Sesión - Admin MQV', 
                error: 'Credenciales inválidas.' 
            });
        }

        // Generar token
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '7d' }
        );

        // Actualizar último acceso
        user.ultimoAcceso = new Date();
        await user.save();

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        console.log('✅ Login exitoso, redirigiendo al dashboard');
        res.redirect('/admin/dashboard');

    } catch (error) {
        console.error('Error en login admin:', error);
        res.render('admin/login', { 
            title: 'Iniciar Sesión - Admin MQV', 
            error: 'Error interno del servidor.' 
        });
    }
});

// Logout
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/admin/login');
});

// Logout POST (para formularios)
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/admin/login');
});

// Dashboard principal
router.get('/dashboard', verificarTokenWeb, async (req, res) => {
    try {
        const totalUsuarios = await User.countDocuments({ activo: true });
        const totalMedias = await Media.countDocuments({ activo: true });
        
        const mediasPorMinisterio = await Media.aggregate([
            { $match: { activo: true } },
            { $group: { _id: '$ministerio', total: { $sum: 1 } } },
            { $sort: { total: -1 } }
        ]);

        const mediasRecientes = await Media.find({ activo: true })
            .populate('subidoPor', 'username ministerio')
            .sort({ createdAt: -1 })
            .limit(10);

        res.render('admin/dashboard-new', {
            title: 'Dashboard - Admin MQV',
            totalUsuarios,
            totalMedias,
            mediasPorMinisterio,
            mediasRecientes
        });
    } catch (error) {
        console.error('Error en dashboard:', error);
        res.render('admin/error', { title: 'Error', message: 'Error cargando dashboard' });
    }
});

// Gestión de usuarios
router.get('/usuarios', verificarTokenWeb, verificarAdmin, async (req, res) => {
    try {
        const usuarios = await User.find().sort({ createdAt: -1 });
        res.render('admin/usuarios', {
            title: 'Gestión de Usuarios - Admin MQV',
            usuarios
        });
    } catch (error) {
        console.error('Error cargando usuarios:', error);
        res.render('admin/error', { title: 'Error', message: 'Error cargando usuarios' });
    }
});

// Crear usuario
router.post('/usuarios', verificarTokenWeb, verificarAdmin, async (req, res) => {
    try {
        const { username, email, password, ministerio, role } = req.body;

        const userExists = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'El usuario o email ya existe.'
            });
        }

        const newUser = new User({
            username,
            email,
            password,
            ministerio,
            role: role || 'ministerio'
        });

        await newUser.save();

        res.json({
            success: true,
            message: 'Usuario creado exitosamente.',
            user: newUser.toPublic()
        });

    } catch (error) {
        console.error('Error creando usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error creando usuario: ' + error.message
        });
    }
});

// Editar usuario
router.put('/usuarios/:id', verificarTokenWeb, verificarAdmin, async (req, res) => {
    try {
        const { username, email, ministerio, role, activo } = req.body;
        const userId = req.params.id;

        const updateData = { username, email, ministerio, role, activo };
        
        const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado.'
            });
        }

        res.json({
            success: true,
            message: 'Usuario actualizado exitosamente.',
            user: user.toPublic()
        });

    } catch (error) {
        console.error('Error actualizando usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error actualizando usuario: ' + error.message
        });
    }
});

// Eliminar usuario
router.delete('/usuarios/:id', verificarTokenWeb, verificarAdmin, async (req, res) => {
    try {
        const userId = req.params.id;

        if (userId === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'No puedes eliminarte a ti mismo.'
            });
        }

        await User.findByIdAndUpdate(userId, { activo: false });

        res.json({
            success: true,
            message: 'Usuario desactivado exitosamente.'
        });

    } catch (error) {
        console.error('Error eliminando usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error eliminando usuario: ' + error.message
        });
    }
});

// Gestión de medios
router.get('/medios', verificarTokenWeb, async (req, res) => {
    try {
        const filtros = {};
        
        // Si no es admin, solo puede ver su ministerio
        if (req.user.role !== 'admin') {
            filtros.ministerio = req.user.ministerio;
        }

        // Aplicar filtros de búsqueda
        if (req.query.ministerio) {
            filtros.ministerio = req.query.ministerio;
        }

        if (req.query.tipo) {
            filtros.tipo = req.query.tipo;
        }

        filtros.activo = true;

        const medios = await Media.find(filtros)
            .populate('subidoPor', 'username ministerio')
            .sort({ createdAt: -1 });

        res.render('admin/medios-new', {
            title: 'Gestión de Medios - Admin MQV',
            medios,
            filtros: req.query,
            user: req.user
        });

    } catch (error) {
        console.error('Error cargando medios:', error);
        res.render('admin/error', { title: 'Error', message: 'Error cargando medios' });
    }
});

// Subir medios
router.post('/medios', verificarTokenWeb, upload.array('archivos', 5), handleMulterError, async (req, res) => {
    try {
        const { titulo, descripcion, ministerio, fechaEvento } = req.body;
        
        // Verificar permisos
        if (req.user.role !== 'admin' && req.user.ministerio !== ministerio) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para subir contenido a este ministerio.'
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No se seleccionaron archivos.'
            });
        }

        const mediosCreados = [];

        for (const file of req.files) {
            const tipo = file.mimetype.startsWith('image/') ? 'foto' : 'video';
            
            const nuevoMedio = new Media({
                titulo: titulo || file.originalname,
                descripcion,
                tipo,
                archivo: {
                    filename: file.filename,
                    originalName: file.originalname,
                    mimetype: file.mimetype,
                    size: file.size,
                    path: file.path
                },
                ministerio,
                subidoPor: req.user._id,
                fechaEvento: fechaEvento ? new Date(fechaEvento) : new Date()
            });

            await nuevoMedio.save();
            mediosCreados.push(nuevoMedio);
        }

        res.json({
            success: true,
            message: `${mediosCreados.length} archivo(s) subido(s) exitosamente.`,
            medios: mediosCreados
        });

    } catch (error) {
        console.error('Error subiendo medios:', error);
        res.status(500).json({
            success: false,
            message: 'Error subiendo archivos: ' + error.message
        });
    }
});

// Eliminar medio
router.delete('/medios/:id', verificarTokenWeb, async (req, res) => {
    try {
        const mediaId = req.params.id;
        const media = await Media.findById(mediaId);

        if (!media) {
            return res.status(404).json({
                success: false,
                message: 'Archivo no encontrado.'
            });
        }

        // Verificar permisos
        if (req.user.role !== 'admin' && 
            req.user.ministerio !== media.ministerio && 
            req.user._id.toString() !== media.subidoPor.toString()) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para eliminar este archivo.'
            });
        }

        // Eliminar archivo físico
        try {
            if (fs.existsSync(media.archivo.path)) {
                fs.unlinkSync(media.archivo.path);
            }
        } catch (fileError) {
            console.error('Error eliminando archivo físico:', fileError);
        }

        // Marcar como inactivo en lugar de eliminar
        media.activo = false;
        await media.save();

        res.json({
            success: true,
            message: 'Archivo eliminado exitosamente.'
        });

    } catch (error) {
        console.error('Error eliminando medio:', error);
        res.status(500).json({
            success: false,
            message: 'Error eliminando archivo: ' + error.message
        });
    }
});

module.exports = router;
