# 🚀 Configuración para Producción

## 🌐 Variables de Entorno Necesarias

### Para Render.com:

```bash
# Base de Datos
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/iglesia_mqv

# Seguridad
JWT_SECRET=tu_jwt_secret_super_seguro_para_produccion

# Aplicación
NODE_ENV=production
PORT=10000

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=cambiar_en_produccion

# Uploads
UPLOAD_PATH=uploads
MAX_FILE_SIZE=10485760
```

## 📊 MongoDB Atlas - Configuración

### 1. Crear Cluster
- Tipo: M0 Sandbox (Gratis)
- Región: Cercana a tu audiencia
- Nombre: `iglesia-mqv-cluster`

### 2. Database Access
```
Username: mqv-admin
Password: [Generar seguro]
Privileges: Read and write to any database
```

### 3. Network Access
```
IP Address: 0.0.0.0/0 (Allow from anywhere)
```

### 4. Connection String
```
mongodb+srv://mqv-admin:<password>@iglesia-mqv-cluster.xxxxx.mongodb.net/iglesia_mqv?retryWrites=true&w=majority
```

## 🔧 Pasos en Render

1. **Ir a Dashboard de Render**
2. **Seleccionar tu Web Service**
3. **Settings → Environment**
4. **Add Environment Variable** para cada variable arriba
5. **Deploy** automáticamente se ejecutará

## ✅ Verificación

Después de configurar:
- [ ] Variables de entorno configuradas
- [ ] MongoDB Atlas funcionando
- [ ] Deploy exitoso sin errores de conexión
- [ ] Aplicación carga correctamente
- [ ] Admin panel accesible

## 🆘 Troubleshooting

### Error: "connect ECONNREFUSED"
- ✅ Verificar MONGODB_URI está configurado
- ✅ Verificar IP whitelisting en Atlas
- ✅ Verificar credenciales de usuario

### Error: "Authentication failed"
- ✅ Verificar username/password en Atlas
- ✅ Verificar que el usuario tiene permisos

### Error: "Timeout"
- ✅ Verificar Network Access en Atlas
- ✅ Verificar región del cluster vs región de Render
