const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    descripcion: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    tipo: {
        type: String,
        enum: ['foto', 'video'],
        required: true
    },
    archivo: {
        filename: {
            type: String,
            required: true
        },
        originalName: {
            type: String,
            required: true
        },
        mimetype: {
            type: String,
            required: true
        },
        size: {
            type: Number,
            required: true
        },
        path: {
            type: String,
            required: true
        }
    },
    ministerio: {
        type: String,
        required: true,
        enum: [
            'Adoración y Música',
            'Jóvenes',
            'Niños',
            'Mujeres',
            'Hombres',
            'Intercesión',
            'Evangelismo',
            'Misiones',
            'Diaconos'
        ]
    },
    subidoPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    activo: {
        type: Boolean,
        default: true
    },
    fechaEvento: {
        type: Date,
        default: Date.now
    },
    orden: {
        type: Number,
        default: 0
    },
    destacado: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Índices para mejorar consultas
MediaSchema.index({ ministerio: 1, activo: 1, createdAt: -1 });
MediaSchema.index({ destacado: 1, activo: 1 });

module.exports = mongoose.model('Media', MediaSchema);
