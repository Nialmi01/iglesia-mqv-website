const mongoose = require('mongoose');

const ConfiguracionSchema = new mongoose.Schema({
    clave: {
        type: String,
        required: true,
        unique: true
    },
    valor: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    descripcion: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Configuracion', ConfiguracionSchema);
