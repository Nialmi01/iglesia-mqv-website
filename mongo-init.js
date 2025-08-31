// Script de inicialización para MongoDB
// Este script se ejecuta cuando se crea el contenedor de MongoDB por primera vez

// Cambiar a la base de datos de la aplicación
db = db.getSiblingDB('iglesia_mqv');

// Crear colecciones iniciales
db.createCollection('usuarios');
db.createCollection('medios');

// Insertar datos de ejemplo (opcional)
print('Base de datos iglesia_mqv inicializada correctamente');
print('Colecciones creadas: usuarios, medios');
