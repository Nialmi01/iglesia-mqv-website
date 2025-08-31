const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['admin', 'ministerio'],
        default: 'ministerio'
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
            'Diaconos',
            'Administración'
        ]
    },
    activo: {
        type: Boolean,
        default: true
    },
    ultimoAcceso: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Hash password antes de guardar
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Método para comparar passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Método para obtener datos públicos del usuario
UserSchema.methods.toPublic = function() {
    const user = this.toObject();
    delete user.password;
    return user;
};

module.exports = mongoose.model('User', UserSchema);
