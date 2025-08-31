const express = require('express');
const Media = require('../models/Media');
const { verificarToken, verificarMinisterio } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');

const router = express.Router();

// Lista de ministerios disponibles
const MINISTERIOS = [
    'Adoración y Música',
    'Jóvenes',
    'Niños',
    'Mujeres',
    'Hombres',
    'Intercesión',
    'Evangelismo',
    'Misiones',
    'Diaconos'
];

// Obtener todos los ministerios
router.get('/', (req, res) => {
    res.json({
        success: true,
        ministerios: MINISTERIOS
    });
});

// Obtener medios de un ministerio específico
router.get('/:ministerio', async (req, res) => {
    try {
        const ministerio = decodeURIComponent(req.params.ministerio);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const tipo = req.query.tipo; // 'foto' o 'video'

        if (!MINISTERIOS.includes(ministerio)) {
            return res.status(400).json({
                success: false,
                message: 'Ministerio no válido.'
            });
        }

        const filtros = {
            ministerio: ministerio,
            activo: true
        };

        if (tipo) {
            filtros.tipo = tipo;
        }

        const skip = (page - 1) * limit;

        const [medios, total] = await Promise.all([
            Media.find(filtros)
                .populate('subidoPor', 'username ministerio')
                .sort({ destacado: -1, fechaEvento: -1 })
                .skip(skip)
                .limit(limit),
            Media.countDocuments(filtros)
        ]);

        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: {
                ministerio,
                medios,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: total,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Error obteniendo medios del ministerio:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor.'
        });
    }
});

// Subir medios a un ministerio específico
router.post('/:ministerio/upload', 
    verificarToken, 
    verificarMinisterio,
    upload.array('archivos', 5), 
    handleMulterError, 
    async (req, res) => {
        try {
            const ministerio = decodeURIComponent(req.params.ministerio);
            const { titulo, descripcion, fechaEvento, destacado } = req.body;

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
                    fechaEvento: fechaEvento ? new Date(fechaEvento) : new Date(),
                    destacado: destacado === 'true' || destacado === true
                });

                await nuevoMedio.save();
                await nuevoMedio.populate('subidoPor', 'username ministerio');
                mediosCreados.push(nuevoMedio);
            }

            res.json({
                success: true,
                message: `${mediosCreados.length} archivo(s) subido(s) exitosamente al ministerio ${ministerio}.`,
                data: mediosCreados
            });

        } catch (error) {
            console.error('Error subiendo medios al ministerio:', error);
            res.status(500).json({
                success: false,
                message: 'Error subiendo archivos: ' + error.message
            });
        }
    }
);

// Actualizar medio específico
router.put('/:ministerio/:mediaId', 
    verificarToken, 
    verificarMinisterio, 
    async (req, res) => {
        try {
            const { ministerio, mediaId } = req.params;
            const { titulo, descripcion, fechaEvento, destacado } = req.body;

            const media = await Media.findById(mediaId);

            if (!media) {
                return res.status(404).json({
                    success: false,
                    message: 'Archivo no encontrado.'
                });
            }

            if (media.ministerio !== decodeURIComponent(ministerio)) {
                return res.status(400).json({
                    success: false,
                    message: 'El archivo no pertenece a este ministerio.'
                });
            }

            // Verificar permisos adicionales
            if (req.user.role !== 'admin' && 
                req.user._id.toString() !== media.subidoPor.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para editar este archivo.'
                });
            }

            // Actualizar campos
            if (titulo) media.titulo = titulo;
            if (descripcion !== undefined) media.descripcion = descripcion;
            if (fechaEvento) media.fechaEvento = new Date(fechaEvento);
            if (destacado !== undefined) media.destacado = destacado === 'true' || destacado === true;

            await media.save();
            await media.populate('subidoPor', 'username ministerio');

            res.json({
                success: true,
                message: 'Archivo actualizado exitosamente.',
                data: media
            });

        } catch (error) {
            console.error('Error actualizando medio:', error);
            res.status(500).json({
                success: false,
                message: 'Error actualizando archivo: ' + error.message
            });
        }
    }
);

// Eliminar medio específico
router.delete('/:ministerio/:mediaId', 
    verificarToken, 
    verificarMinisterio, 
    async (req, res) => {
        try {
            const { ministerio, mediaId } = req.params;

            const media = await Media.findById(mediaId);

            if (!media) {
                return res.status(404).json({
                    success: false,
                    message: 'Archivo no encontrado.'
                });
            }

            if (media.ministerio !== decodeURIComponent(ministerio)) {
                return res.status(400).json({
                    success: false,
                    message: 'El archivo no pertenece a este ministerio.'
                });
            }

            // Verificar permisos adicionales
            if (req.user.role !== 'admin' && 
                req.user._id.toString() !== media.subidoPor.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para eliminar este archivo.'
                });
            }

            // Eliminar archivo físico
            const fs = require('fs');
            try {
                if (fs.existsSync(media.archivo.path)) {
                    fs.unlinkSync(media.archivo.path);
                }
            } catch (fileError) {
                console.error('Error eliminando archivo físico:', fileError);
            }

            // Marcar como inactivo
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
    }
);

// Obtener estadísticas de un ministerio
router.get('/:ministerio/stats', verificarToken, async (req, res) => {
    try {
        const ministerio = decodeURIComponent(req.params.ministerio);

        if (!MINISTERIOS.includes(ministerio)) {
            return res.status(400).json({
                success: false,
                message: 'Ministerio no válido.'
            });
        }

        const [totalFotos, totalVideos, totalDestacados] = await Promise.all([
            Media.countDocuments({ ministerio, tipo: 'foto', activo: true }),
            Media.countDocuments({ ministerio, tipo: 'video', activo: true }),
            Media.countDocuments({ ministerio, destacado: true, activo: true })
        ]);

        res.json({
            success: true,
            data: {
                ministerio,
                totalFotos,
                totalVideos,
                totalDestacados,
                total: totalFotos + totalVideos
            }
        });

    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor.'
        });
    }
});

module.exports = router;
