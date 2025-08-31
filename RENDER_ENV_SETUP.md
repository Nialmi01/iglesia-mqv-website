# 🔐 Variables de Entorno para Render

## ⚙️ Variables Requeridas para Render.com

Copia y pega estas variables en Render → Settings → Environment:

```bash
# 🍃 Base de Datos MongoDB Atlas
MONGODB_URI=mongodb+srv://mjcarbonoto_db_user:2XtGzgKD0SUoq1OyacIuster0.rxcmqsv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# 🔐 Seguridad JWT
JWT_SECRET=iglesia_mqv_super_secret_key_2025_render_production

# 🌍 Ambiente
NODE_ENV=production

# 🔧 Puerto (Render lo maneja automáticamente)
PORT=10000

# 👤 Admin por Defecto
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# 📁 Configuración de Archivos
UPLOAD_PATH=uploads
MAX_FILE_SIZE=10485760
```

## 🎯 Pasos para Aplicar:

### 1. **Ir a Render Dashboard**
- URL: https://dashboard.render.com
- Seleccionar: **iglesia-mqv-website**

### 2. **Settings → Environment**
- Agregar cada variable una por una
- Usar los valores exactos de arriba

### 3. **Verificar Variables Críticas**
- ✅ `MONGODB_URI` - Tu connection string de Atlas
- ✅ `JWT_SECRET` - Para autenticación
- ✅ `NODE_ENV=production` - Para configuración de producción

### 4. **Save Changes**
- Render automáticamente redesplegará
- En ~2-3 minutos estará listo

## 🔍 **Verificación Post-Deploy**

Después del redeploy, los logs deberían mostrar:
```
✅ Conectado a MongoDB
🎯 MongoDB conectado - Funcionalidad completa disponible
👤 Usuario administrador verificado - username: admin
```

En lugar de:
```
❌ Error conectando a MongoDB
```

## 🚨 **IMPORTANTE**

⚠️ **Reemplaza `TU_PASSWORD` en MONGODB_URI** con la contraseña real del usuario `mjcarbonoto_db_user` de tu MongoDB Atlas.

**¿Ya tienes la contraseña del usuario de MongoDB Atlas?**
