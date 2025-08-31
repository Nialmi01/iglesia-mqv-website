const express = require('express');
const Media = require('../models/Media');
const Configuracion = require('../models/Configuracion');
const mongoose = require('mongoose');

const router = express.Router();

// Función para obtener datos de demostración
const getDemoData = () => {
    return {
        mediosDestacados: [
            {
                _id: 'demo1',
                titulo: 'Culto Dominical',
                descripcion: 'Momentos de adoración y alabanza',
                tipo: 'foto',
                url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
                archivo: {
                    path: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
                    mimetype: 'image/jpeg'
                },
                ministerio: 'Adoración y Música',
                destacado: true,
                activo: true,
                createdAt: new Date()
            },
            {
                _id: 'demo2',
                titulo: 'Actividad Juvenil',
                descripcion: 'Jóvenes en actividad de confraternidad',
                tipo: 'foto',
                url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop',
                archivo: {
                    path: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop',
                    mimetype: 'image/jpeg'
                },
                ministerio: 'Jóvenes',
                destacado: true,
                activo: true,
                createdAt: new Date()
            },
            {
                _id: 'demo3',
                titulo: 'Oración Matutina',
                descripcion: 'Momento de oración en comunidad',
                tipo: 'foto',
                url: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&h=600&fit=crop',
                archivo: {
                    path: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&h=600&fit=crop',
                    mimetype: 'image/jpeg'
                },
                ministerio: 'Intercesión',
                destacado: true,
                activo: true,
                createdAt: new Date()
            }
        ],
        mediosPorMinisterio: {
            'Adoración y Música': [
                {
                    _id: 'demo4',
                    titulo: 'Ensayo del Coro',
                    tipo: 'foto',
                    url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
                    archivo: {
                        path: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
                        mimetype: 'image/jpeg'
                    },
                    ministerio: 'Adoración y Música',
                    activo: true,
                    createdAt: new Date()
                },
                {
                    _id: 'demo5',
                    titulo: 'Práctica de Instrumentos',
                    tipo: 'foto',
                    url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=300&fit=crop',
                    archivo: {
                        path: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=300&fit=crop',
                        mimetype: 'image/jpeg'
                    },
                    ministerio: 'Adoración y Música',
                    activo: true,
                    createdAt: new Date()
                }
            ],
            'Jóvenes': [
                {
                    _id: 'demo6',
                    titulo: 'Retiro Juvenil',
                    tipo: 'foto',
                    url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=300&fit=crop',
                    archivo: {
                        path: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=300&fit=crop',
                        mimetype: 'image/jpeg'
                    },
                    ministerio: 'Jóvenes',
                    activo: true,
                    createdAt: new Date()
                },
                {
                    _id: 'demo7',
                    titulo: 'Actividad Deportiva',
                    tipo: 'foto',
                    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
                    archivo: {
                        path: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
                        mimetype: 'image/jpeg'
                    },
                    ministerio: 'Jóvenes',
                    activo: true,
                    createdAt: new Date()
                }
            ]
        }
    };
};

// Página principal
router.get('/', async (req, res) => {
    try {
        let mediosDestacados = [];
        let mediosPorMinisterio = {};
        
        // Verificar si MongoDB está disponible
        if (mongoose.connection.readyState === 1) {
            try {
                // MongoDB disponible - usar datos reales
                mediosDestacados = await Media.find({ 
                    destacado: true, 
                    activo: true 
                })
                .sort({ createdAt: -1 })
                .limit(5);

                // Obtener algunos medios recientes de cada ministerio para mostrar
                const ministerios = [
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
                
                for (const ministerio of ministerios) {
                    const medios = await Media.find({ 
                        ministerio, 
                        activo: true 
                    })
                    .sort({ createdAt: -1 })
                    .limit(4);
                    
                    mediosPorMinisterio[ministerio] = medios;
                }
            } catch (dbError) {
                console.warn('⚠️ Error obteniendo datos de MongoDB, usando datos de demostración:', dbError.message);
                // Usar datos de demostración si hay error
                const demoData = getDemoData();
                mediosDestacados = demoData.mediosDestacados;
                mediosPorMinisterio = demoData.mediosPorMinisterio;
            }
        } else {
            // MongoDB no disponible - usar datos de demostración
            console.log('🔍 MongoDB no conectado, usando datos de demostración');
            const demoData = getDemoData();
            mediosDestacados = demoData.mediosDestacados;
            mediosPorMinisterio = demoData.mediosPorMinisterio;
        }

        // Información de la iglesia (esto debería venir de la configuración)
        const infoIglesia = {
            mision: "Ser una iglesia que impacte vidas para Cristo, formando discípulos comprometidos con el Reino de Dios.",
            vision: "Ser más que vencedores en Cristo, siendo luz y sal en nuestra comunidad y el mundo.",
            direccion: "Av. Principal #123, Ciudad, País",
            telefono: "+1 234 567 8900",
            email: "info@iglesiaiqv.com",
            horarios: {
                domingo: "9:00 AM y 6:00 PM",
                miercoles: "7:00 PM",
                viernes: "7:00 PM"
            }
        };

        // Lista de ministerios
        const ministerios = [
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

        res.render('public/index', {
            title: 'Iglesia Más que Vencedores - Tu Casa',
            mediosDestacados,
            mediosPorMinisterio,
            infoIglesia,
            ministerios
        });

    } catch (error) {
        console.error('Error cargando página principal:', error);
        res.render('public/error', { 
            title: 'Error', 
            message: 'Error cargando la página' 
        });
    }
});

// Página de ministerios
router.get('/ministerios', async (req, res) => {
    try {
        const ministerios = [
            {
                nombre: 'Adoración y Música',
                descripcion: 'Ministerio dedicado a la alabanza y adoración a través de la música.',
                icono: 'fas fa-music'
            },
            {
                nombre: 'Jóvenes',
                descripcion: 'Ministerio enfocado en el crecimiento espiritual de los jóvenes.',
                icono: 'fas fa-users'
            },
            {
                nombre: 'Niños',
                descripcion: 'Ministerio dedicado a la formación cristiana de los más pequeños.',
                icono: 'fas fa-child'
            },
            {
                nombre: 'Mujeres',
                descripcion: 'Ministerio que fortalece y empodera a las mujeres en la fe.',
                icono: 'fas fa-female'
            },
            {
                nombre: 'Hombres',
                descripcion: 'Ministerio que forma hombres íntegros según el corazón de Dios.',
                icono: 'fas fa-male'
            },
            {
                nombre: 'Intercesión',
                descripcion: 'Ministerio dedicado a la oración e intercesión por la iglesia y la comunidad.',
                icono: 'fas fa-praying-hands'
            },
            {
                nombre: 'Evangelismo',
                descripcion: 'Ministerio enfocado en llevar el evangelio a los no creyentes.',
                icono: 'fas fa-cross'
            },
            {
                nombre: 'Misiones',
                descripcion: 'Ministerio que apoya y realiza trabajo misionero local e internacional.',
                icono: 'fas fa-globe-americas'
            },
            {
                nombre: 'Diaconos',
                descripcion: 'Ministerio de servicio y apoyo a las necesidades de la congregación.',
                icono: 'fas fa-hands-helping'
            }
        ];

        // Obtener estadísticas de cada ministerio solo si MongoDB está disponible
        if (mongoose.connection.readyState === 1) {
            try {
                for (let ministerio of ministerios) {
                    const totalMedias = await Media.countDocuments({
                        ministerio: ministerio.nombre,
                        activo: true
                    });
                    ministerio.totalMedias = totalMedias;
                }
            } catch (dbError) {
                console.warn('⚠️ Error obteniendo estadísticas de ministerios:', dbError.message);
                // Agregar valores por defecto si hay error de DB
                ministerios.forEach(ministerio => {
                    ministerio.totalMedias = 0;
                });
            }
        } else {
            // MongoDB no disponible - usar valores por defecto
            ministerios.forEach(ministerio => {
                ministerio.totalMedias = 0;
            });
        }

        res.render('public/ministerios', {
            title: 'Ministerios - Iglesia MQV',
            ministerios
        });

    } catch (error) {
        console.error('Error cargando ministerios:', error);
        res.render('public/error', { 
            title: 'Error', 
            message: 'Error cargando ministerios' 
        });
    }
});

// Página específica de un ministerio
router.get('/ministerio/:nombre', async (req, res) => {
    try {
        const nombreMinisterio = decodeURIComponent(req.params.nombre);
        const page = parseInt(req.query.page) || 1;
        const tipo = req.query.tipo; // 'foto' o 'video'
        const limit = 12;

        const ministeriosValidos = [
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

        if (!ministeriosValidos.includes(nombreMinisterio)) {
            return res.status(404).render('public/404', { title: 'Ministerio no encontrado' });
        }

        const filtros = {
            ministerio: nombreMinisterio,
            activo: true
        };

        if (tipo) {
            filtros.tipo = tipo;
        }

        const skip = (page - 1) * limit;

        let medios = [];
        let totalFotos = 0;
        let totalVideos = 0;
        let total = 0;

        // Solo hacer consultas si MongoDB está conectado
        if (mongoose.connection.readyState === 1) {
            try {
                [medios, totalFotos, totalVideos, total] = await Promise.all([
                    Media.find(filtros)
                        .populate('subidoPor', 'username ministerio')
                        .sort({ destacado: -1, fechaEvento: -1 })
                        .skip(skip)
                        .limit(limit),
                    Media.countDocuments({ ...filtros, tipo: 'foto' }),
                    Media.countDocuments({ ...filtros, tipo: 'video' }),
                    Media.countDocuments(filtros)
                ]);
            } catch (dbError) {
                console.warn('⚠️ Error obteniendo datos del ministerio, usando datos de demostración:', dbError.message);
                // Usar datos de demostración
                medios = [];
                totalFotos = 0;
                totalVideos = 0;
                total = 0;
            }
        } else {
            console.log('🔍 MongoDB no conectado, usando datos de demostración para ministerio:', nombreMinisterio);
            // Datos de demostración para el ministerio específico
            medios = [];
            totalFotos = 0;
            totalVideos = 0; 
            total = 0;
        }

        const totalPages = Math.ceil(total / limit);

        // Información específica del ministerio
        const infoMinisterios = {
            'Adoración y Música': {
                descripcion: 'Nuestro ministerio de adoración y música busca llevar a la congregación a una experiencia genuina de adoración a Dios.',
                versiculo: '"Cantad alegres a Dios, habitantes de toda la tierra." - Salmos 100:1'
            },
            'Jóvenes': {
                descripcion: 'Formamos jóvenes comprometidos con Cristo, equipándolos para ser líderes del Reino.',
                versiculo: '"No permitas que nadie te subestime por ser joven..." - 1 Timoteo 4:12'
            },
            'Niños': {
                descripcion: 'Enseñamos a los niños los fundamentos de la fe cristiana de manera divertida y significativa.',
                versiculo: '"Instruye al niño en su camino..." - Proverbios 22:6'
            }
            // Agregar más según necesidades
        };

        res.render('public/ministerio-detalle', {
            title: `${nombreMinisterio} - Iglesia MQV`,
            ministerio: {
                nombre: nombreMinisterio,
                ...infoMinisterios[nombreMinisterio] || {
                    descripcion: `Ministerio de ${nombreMinisterio} de la Iglesia Más que Vencedores.`,
                    versiculo: ''
                }
            },
            medios,
            totalFotos,
            totalVideos,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: total,
                hasNext: page < totalPages,
                hasPrev: page > 1
            },
            filtroTipo: tipo
        });

    } catch (error) {
        console.error('Error cargando ministerio:', error);
        res.render('public/error', { 
            title: 'Error', 
            message: 'Error cargando ministerio' 
        });
    }
});

// Página de contacto
router.get('/contacto', (req, res) => {
    res.render('public/contacto', {
        title: 'Contacto - Iglesia MQV',
        infoIglesia: {
            nombre: "Iglesia Más que Vencedores (MQV) - Tu Casa",
            direccion: "Av. Principal #123, Ciudad, País",
            telefono: "+1 234 567 8900",
            email: "info@masquevencedores.com",
            horarios: {
                domingo: "9:00 AM y 6:00 PM",
                miercoles: "7:00 PM - Estudio Bíblico",
                viernes: "7:00 PM - Noche de Adoración"
            },
            pastores: {
                principal: "Pastor Edgar Bernal",
                copastor: "Pastora Bibi Bernal"
            }
        }
    });
});

// Página acerca de
router.get('/acerca', (req, res) => {
    res.render('public/acerca', {
        title: 'Acerca de Nosotros - Iglesia MQV',
        infoIglesia: {
            mision: "Ser una iglesia que impacte vidas para Cristo, formando discípulos comprometidos con el Reino de Dios.",
            vision: "Ser más que vencedores en Cristo, siendo luz y sal en nuestra comunidad y el mundo.",
            valores: [
                "Amor por Dios y el prójimo",
                "Integridad en todas nuestras acciones",
                "Excelencia en el servicio",
                "Compromiso con la Palabra de Dios",
                "Unidad en la diversidad"
            ],
            pastores: {
                principal: {
                    nombre: "Pastor Edgar Bernal",
                    biografia: "Con una pasión ardiente por las almas y un corazón pastoral dedicado al servicio de Dios, el Pastor Edgar Bernal lidera con humildad y sabiduría nuestra congregación.",
                    cargo: "Pastor Principal"
                },
                copastor: {
                    nombre: "Pastora Bibi Bernal", 
                    biografia: "Con un corazón pastoral lleno de amor y dedicación, la Pastora Bibi Bernal ministra con gracia y sabiduría. Su liderazgo se refleja en el cuidado espiritual de cada miembro de la congregación.",
                    cargo: "Pastora Principal"
                }
            },
            // Mantenemos compatibilidad con el código existente
            pastor: {
                nombre: "Pastor Edgar Bernal",
                biografia: "Con una pasión ardiente por las almas y un corazón pastoral dedicado al servicio de Dios, el Pastor Edgar Bernal lidera con humildad y sabiduría nuestra congregación. Junto a su esposa, la Pastora Bibi Bernal, han dedicado sus vidas a edificar el Reino de Dios y transformar vidas a través del poder del Evangelio."
            }
        }
    });
});

// API para obtener medios (usado por JavaScript del frontend)
router.get('/api/medios/:ministerio', async (req, res) => {
    try {
        const ministerio = decodeURIComponent(req.params.ministerio);
        const tipo = req.query.tipo;
        const limit = parseInt(req.query.limit) || 6;

        const filtros = {
            ministerio,
            activo: true
        };

        if (tipo) {
            filtros.tipo = tipo;
        }

        const medios = await Media.find(filtros)
            .sort({ createdAt: -1 })
            .limit(limit);

        res.json({
            success: true,
            data: medios
        });

    } catch (error) {
        console.error('Error obteniendo medios:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo medios'
        });
    }
});

// Ruta de login (redirige al admin)
router.get('/login', (req, res) => {
    res.redirect('/admin/login');
});

module.exports = router;
