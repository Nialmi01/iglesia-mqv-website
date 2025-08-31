# 💾 Instalación de MongoDB para Iglesia MQV

## 🎯 Estado Actual
✅ **La aplicación está funcionando en modo DEMOSTRACIÓN**
- Se muestran datos de ejemplo
- Todas las funciones visuales están operativas
- Para funcionalidad completa, instalar MongoDB

## 🚀 Instalación Rápida de MongoDB

### Windows (Recomendado)
1. **Descargar MongoDB Community Server:**
   - Ir a: https://www.mongodb.com/try/download/community
   - Seleccionar: Windows x64
   - Descargar el instalador .msi

2. **Instalar:**
   - Ejecutar el instalador descargado
   - Seguir el asistente (configuración por defecto está bien)
   - ✅ Marcar "Install MongoDB as a Service"
   - ✅ Marcar "Install MongoDB Compass" (opcional, pero útil)

3. **Verificar instalación:**
   ```powershell
   # En PowerShell/CMD
   mongod --version
   ```

4. **Reiniciar la aplicación:**
   ```bash
   # Detener servidor actual (Ctrl+C)
   # Luego iniciar de nuevo:
   npm start
   ```

### Alternativa: MongoDB Atlas (Nube) - GRATIS
1. **Crear cuenta:** https://www.mongodb.com/atlas
2. **Crear cluster gratuito** (sigue el wizard)
3. **Obtener cadena de conexión:**
   - Click en "Connect"
   - Seleccionar "Connect your application"
   - Copiar la cadena de conexión

4. **Actualizar archivo .env:**
   ```env
   MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/iglesia_mqv
   ```

5. **Reiniciar aplicación:** `npm start`

## 🔍 ¿Cómo saber si MongoDB está funcionando?

### Señales de éxito:
- ✅ Al iniciar la aplicación aparece: "✅ Conectado a MongoDB"
- ✅ El panel administrativo permite subir archivos reales
- ✅ Los cambios se guardan entre reinicios

### Señales de que aún está en modo demo:
- ⚠️ Aparece: "⚠️ MongoDB no disponible - Inicialización omitida"
- ⚠️ Los datos mostrados son de ejemplo
- ⚠️ Los cambios no se guardan

## 🆘 Solución de Problemas

### Problema: "mongod no se reconoce como comando"
**Solución:** MongoDB no está en el PATH del sistema
1. Reiniciar la computadora después de instalar
2. O agregar manualmente a PATH: `C:\Program Files\MongoDB\Server\7.0\bin`

### Problema: "Error conectando a MongoDB"
**Solución:** El servicio no está iniciado
1. **Windows:** Ir a Servicios > MongoDB > Iniciar
2. **O desde cmd:** `net start MongoDB`

### Problema: Puerto ocupado
**Solución:** MongoDB usa puerto 27017 por defecto
```bash
# Verificar qué está usando el puerto
netstat -ano | findstr :27017

# Si algo más lo usa, detenerlo o cambiar puerto en .env
```

## 💡 Consejos Útiles

1. **MongoDB Compass:** Interfaz gráfica para ver los datos
   - Se instala automáticamente con MongoDB
   - Conectar a: `mongodb://localhost:27017`

2. **Backup de datos:**
   ```bash
   mongodump --db iglesia_mqv --out backup_folder
   ```

3. **Restaurar datos:**
   ```bash
   mongorestore --db iglesia_mqv backup_folder/iglesia_mqv
   ```

## 🎉 Una vez instalado MongoDB:

1. **Usuario administrador:** Se creará automáticamente
   - Usuario: `admin`
   - Contraseña: `admin123`

2. **Panel administrativo:** http://localhost:3000/admin

3. **Subir contenido real:** Reemplazar las imágenes de demostración

---

**¿Prefieres seguir usando el modo demostración?**
¡Está perfectamente bien! La aplicación es completamente funcional para mostrar el diseño y estructura. MongoDB solo es necesario si quieres agregar contenido real y persistente.
