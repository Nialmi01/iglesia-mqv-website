# Iglesia Más que Vencedores (MQV) - Sitio Web

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Una plataforma web completa para la gestión de contenido multimedia de ministerios de la Iglesia Más que Vencedores.

## 📸 Capturas de Pantalla

### Página Principal
![Página Principal](https://via.placeholder.com/800x400/4a5a6d/ffffff?text=P%C3%A1gina+Principal)

### Panel Administrativo
![Panel Admin](https://via.placeholder.com/800x400/3a4a5c/ffffff?text=Panel+Administrativo)

### Gestión de Medios
![Gestión Medios](https://via.placeholder.com/800x400/4a5a6d/ffffff?text=Gesti%C3%B3n+de+Medios)

## 🚀 Características Principales

### Frontend Público
- **Página de inicio** con misión, visión, ubicación y contenido destacado
- **Sistema de ministerios** con páginas individuales para cada ministerio
- **Galería multimedia** con fotos y videos organizados por ministerio
- **Páginas informativas** (Acerca, Contacto)
- **Diseño responsive** y profesional
- **Navegación intuitiva** con menús dropdown

### Panel Administrativo
- **Dashboard** con estadísticas y métricas
- **Gestión de usuarios** con roles y permisos
- **Gestión de contenido multimedia** (subida, edición, eliminación)
- **Sistema de autenticación** con JWT
- **Interfaz intuitiva** para administradores y usuarios de ministerios

### Ministerios Incluidos
- Adoración y Música
- Jóvenes
- Niños
- Mujeres
- Hombres
- Intercesión
- Evangelismo
- Misiones
- Diaconos

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** - Servidor
- **Express.js** - Framework web
- **MongoDB** - Base de datos
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación
- **Multer** - Manejo de archivos
- **bcryptjs** - Hashing de contraseñas

### Frontend
- **EJS** - Motor de plantillas
- **Bootstrap 5** - Framework CSS
- **Font Awesome** - Iconos
- **jQuery** - Manipulación DOM
- **Chart.js** - Gráficos (en admin)

### DevOps y Contenedores
- **Docker** - Contenedorización
- **Docker Compose** - Orquestación de servicios
- **Nginx** - Proxy reverso (opcional para producción)

### Seguridad
- **Helmet** - Headers de seguridad
- **Rate Limiting** - Limitación de solicitudes
- **CORS** - Control de acceso
- **Validación** de datos de entrada

## 📁 Estructura del Proyecto

```
iglesia-mqv/
├── models/              # Modelos de base de datos
│   ├── User.js         # Modelo de usuarios
│   ├── Media.js        # Modelo de archivos multimedia
│   └── Configuracion.js # Configuraciones del sitio
├── routes/             # Rutas del servidor
│   ├── auth.js         # Autenticación
│   ├── admin.js        # Panel administrativo
│   ├── ministerios.js  # API de ministerios
│   └── public.js       # Rutas públicas
├── views/              # Plantillas EJS
│   ├── public/         # Vistas públicas
│   ├── admin/          # Vistas administrativas
│   └── partials/       # Componentes reutilizables
├── middleware/         # Middleware personalizado
│   ├── auth.js         # Verificación de autenticación
│   └── upload.js       # Manejo de archivos
├── public/             # Archivos estáticos
│   ├── css/           # Estilos
│   └── js/            # Scripts del cliente
├── uploads/           # Archivos subidos
└── server.js          # Servidor principal
```

## 🚀 Instalación y Configuración

### 🐳 Opción 1: Con Docker (Recomendado)

La forma más fácil de ejecutar la aplicación es usando Docker:

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd iglesia-mqv

# 2. Configurar variables de entorno
cp .env.docker.example .env.docker
# Editar .env.docker con tus valores

# 3. Construir e iniciar con Docker Compose
docker-compose up -d

# O usar los scripts de utilidades
./docker-utils.sh start    # Linux/macOS
.\docker-utils.ps1 start   # Windows PowerShell
```

**🌐 Acceder a la aplicación:**
- Sitio web: http://localhost:3000
- Admin: http://localhost:3000/admin

**📚 Documentación completa de Docker:** [DOCKER.md](DOCKER.md)

### 💻 Opción 2: Instalación Local

#### Prerrequisitos
- Node.js (v14 o superior)
- MongoDB (local o en la nube)
- NPM o Yarn

#### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd iglesia-mqv
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar variables de entorno
# PORT=3000
# MONGODB_URI=mongodb://localhost:27017/iglesia_mqv
# JWT_SECRET=tu_clave_secreta_muy_segura
```

4. **Iniciar MongoDB**
```bash
# Si tienes MongoDB instalado localmente
mongod
```

5. **Ejecutar la aplicación**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

6. **Acceder a la aplicación**
- Sitio web: `http://localhost:3000`
- Admin: `http://localhost:3000/admin/login`

### Credenciales por defecto
- **Usuario**: admin
- **Contraseña**: admin123

## 📝 Uso del Sistema

### Para Administradores

1. **Iniciar sesión** en `/admin/login`
2. **Crear usuarios** para cada ministerio
3. **Gestionar contenido** multimedia
4. **Monitorear estadísticas** en el dashboard

### Para Usuarios de Ministerio

1. **Iniciar sesión** con credenciales asignadas
2. **Subir fotos y videos** de su ministerio
3. **Gestionar su contenido** (editar/eliminar)
4. **Ver estadísticas** de su ministerio

### Para Visitantes

1. **Navegar** por los ministerios
2. **Ver contenido multimedia** en galerías
3. **Conocer** información de la iglesia
4. **Contactar** a la iglesia

## 🔧 Configuración Avanzada

### Base de Datos
```javascript
// Configuración de MongoDB
MONGODB_URI=mongodb://localhost:27017/iglesia_mqv

// Para MongoDB Atlas (nube)
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/iglesia_mqv
```

### Archivos y Multimedia
```javascript
// Tamaño máximo de archivo (10MB)
MAX_FILE_SIZE=10485760

// Directorio de uploads
UPLOAD_PATH=uploads
```

### Seguridad
```javascript
// Clave secreta para JWT (cambiar en producción)
JWT_SECRET=clave_super_secreta_cambiala_en_produccion

// Configuración de entorno
NODE_ENV=production
```

## 📱 Características Responsive

El sitio está completamente optimizado para:
- **Desktop** (1200px+)
- **Tablet** (768px - 1199px)
- **Mobile** (hasta 767px)

## 🎨 Personalización

### Colores y Temas
Los colores principales se pueden modificar en `public/css/style.css`:

```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    /* Modificar según necesidades */
}
```

### Logotipo
Reemplazar el ícono de iglesia con el logotipo oficial en:
- Barra de navegación
- Footer
- Página de login

## 🔒 Seguridad

### Medidas implementadas:
- **Autenticación JWT** con expiración
- **Hash de contraseñas** con bcrypt
- **Rate limiting** contra ataques de fuerza bruta
- **Validación** de tipos de archivo
- **Sanitización** de datos de entrada
- **Headers de seguridad** con Helmet

### Roles y Permisos:
- **Admin**: Acceso completo al sistema
- **Ministerio**: Solo su ministerio asignado
- **Público**: Solo visualización

## 📊 Funcionalidades del Dashboard

- **Estadísticas generales** (usuarios, contenido, ministerios)
- **Gráficos** de contenido por ministerio
- **Contenido reciente** con acciones rápidas
- **Gestión de usuarios** (solo admins)
- **Perfil de usuario** y cambio de contraseña

## 🚀 Deployment

### Opciones recomendadas:
- **Heroku** - Fácil deployment
- **DigitalOcean** - VPS personalizable
- **AWS** - Escalabilidad empresarial
- **Vercel/Netlify** - Para frontend estático

### Variables de entorno requeridas:
```
PORT=3000
MONGODB_URI=tu_url_de_mongodb
JWT_SECRET=tu_clave_secreta
NODE_ENV=production
```

## 🐛 Solución de Problemas

### Error: Cannot connect to MongoDB
- Verificar que MongoDB esté ejecutándose
- Revisar la URL de conexión en `.env`
- Comprobar credenciales de acceso

### Error: File upload fails
- Verificar permisos de escritura en carpeta `uploads/`
- Comprobar tamaño máximo de archivo
- Revisar tipos de archivo permitidos

### Error: Login fails
- Verificar credenciales por defecto
- Revisar JWT_SECRET en variables de entorno
- Comprobar que el usuario esté activo

## 📞 Soporte

Para soporte técnico o consultas:
- **Email**: soporte@iglesiaiqv.com
- **Teléfono**: +1 234 567 8900

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para contribuir:

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📋 Todo List

- [ ] Implementar notificaciones en tiempo real
- [ ] Agregar sistema de comentarios
- [ ] Crear aplicación móvil companion
- [ ] Implementar búsqueda avanzada
- [ ] Agregar calendario de eventos
- [ ] Sistema de donaciones en línea
- [ ] Integración con redes sociales
- [ ] Panel de analíticas avanzadas

---

**Desarrollado con ❤️ para el Reino de Dios**

*Iglesia Más que Vencedores - Tu Casa*
