const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verificarToken } = require('../middleware/auth');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Usuario y contraseña son requeridos.'
            });
        }

        // Buscar usuario
        const user = await User.findOne({ 
            $or: [
                { username: username },
                { email: username }
            ]
        });

        if (!user || !user.activo) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas.'
            });
        }

        // Verificar contraseña
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas.'
            });
        }

        // Actualizar último acceso
        user.ultimoAcceso = new Date();
        await user.save();

        // Generar token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '7d' }
        );

        // Configurar cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
        });

        res.json({
            success: true,
            message: 'Login exitoso',
            user: user.toPublic(),
            token
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor.'
        });
    }
});

// Logout
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({
        success: true,
        message: 'Logout exitoso'
    });
});

// Verificar token
router.get('/verify', verificarToken, (req, res) => {
    res.json({
        success: true,
        user: req.user.toPublic()
    });
});

// Cambiar contraseña
router.post('/change-password', verificarToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Contraseña actual y nueva contraseña son requeridas.'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La nueva contraseña debe tener al menos 6 caracteres.'
            });
        }

        const user = await User.findById(req.user._id);
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);

        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña actual es incorrecta.'
            });
        }

        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Contraseña cambiada exitosamente.'
        });

    } catch (error) {
        console.error('Error cambiando contraseña:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor.'
        });
    }
});

module.exports = router;
