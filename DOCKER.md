# 🐳 Dockerización - Iglesia Más que Vencedores (MQV)

Esta guía te ayudará a ejecutar la aplicación de la Iglesia MQV usando Docker y Docker Compose.

## 📋 Requisitos Previos

- [Docker](https://docs.docker.com/get-docker/) instalado
- [Docker Compose](https://docs.docker.com/compose/install/) instalado (incluido en Docker Desktop)

## 🚀 Inicio Rápido

### 1. Configurar Variables de Entorno

Copia el archivo de ejemplo y personalizalo:

```bash
# Linux/macOS
cp .env.docker.example .env.docker

# Windows
copy .env.docker.example .env.docker
```

Edita `.env.docker` con tus valores personalizados:

```bash
# Variables importantes que DEBES cambiar
JWT_SECRET=tu_clave_jwt_super_secreta_cambiala_en_produccion_2024
ADMIN_PASSWORD=TuPasswordSeguro123!
MONGO_ROOT_PASSWORD=TuPasswordMongoDB456!
```

### 2. Construir e Iniciar

```bash
# Construir las imágenes
docker-compose build

# Iniciar todos los servicios
docker-compose up -d

# O usar el script de utilidades (recomendado)
./docker-utils.sh start    # Linux/macOS
.\docker-utils.ps1 start   # Windows PowerShell
```

### 3. Acceder a la Aplicación

- **Sitio Web:** http://localhost:3000
- **Panel Admin:** http://localhost:3000/admin
- **Credenciales por defecto:**
  - Usuario: `admin`
  - Contraseña: `admin123` (o la que configuraste en `.env.docker`)

## 🛠️ Scripts de Utilidades

Incluimos scripts para facilitar las operaciones comunes:

### Linux/macOS:
```bash
./docker-utils.sh [comando]
```

### Windows PowerShell:
```powershell
.\docker-utils.ps1 [comando]
```

### Comandos Disponibles:

| Comando | Descripción |
|---------|-------------|
| `build` | Construir las imágenes Docker |
| `dev` | Iniciar en modo desarrollo (con logs visibles) |
| `start` | Iniciar servicios en segundo plano |
| `stop` | Detener todos los servicios |
| `restart` | Reiniciar servicios |
| `logs` | Ver logs en tiempo real |
| `status` | Ver estado de los contenedores |
| `clean` | Limpiar contenedores y volúmenes |
| `backup` | Hacer backup de MongoDB |
| `restore` | Restaurar backup de MongoDB |
| `shell` | Abrir terminal en el contenedor de la app |
| `mongo` | Abrir shell de MongoDB |

## 🏗️ Arquitectura Docker

La aplicación se ejecuta con los siguientes servicios:

### 📱 mqv-web
- **Imagen:** Personalizada basada en Node.js 18 Alpine
- **Puerto:** 3000
- **Función:** Aplicación principal de la iglesia
- **Healthcheck:** Endpoint `/health`

### 🍃 mqv-mongodb
- **Imagen:** MongoDB 7 oficial
- **Puerto:** 27017
- **Función:** Base de datos
- **Datos:** Persistidos en volumen `mongodb-data`

### 🔄 mqv-nginx (Opcional - Solo para Producción)
- **Imagen:** Nginx Alpine oficial
- **Puertos:** 80, 443
- **Función:** Proxy reverso y balanceador de carga
- **Perfil:** `production`

## 📂 Volúmenes y Persistencia

### Datos Persistentes:
- `mongodb-data`: Base de datos MongoDB
- `uploads-data`: Archivos subidos por usuarios

### Para hacer backup manual:
```bash
# Backup de MongoDB
docker-compose exec mqv-mongodb mongodump --db iglesia_mqv --out /data/backup

# Backup de uploads
docker cp mqv-website:/app/uploads ./backup-uploads
```

## 🔧 Configuración Avanzada

### Desarrollo Local

Para desarrollo con recarga automática:

```bash
# Iniciar en modo desarrollo
./docker-utils.sh dev
```

### Producción con Nginx

Para usar Nginx como proxy reverso:

```bash
# Iniciar con perfil de producción
docker-compose --profile production up -d
```

### Variables de Entorno Personalizadas

Puedes sobreescribir cualquier variable usando un archivo `.env.docker`:

```bash
# Ejemplo de configuración personalizada
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://mqv-mongodb:27017/iglesia_mqv_prod
JWT_SECRET=mi_super_secreto_jwt_2024
ADMIN_USERNAME=administrador
ADMIN_PASSWORD=MiPasswordSeguro123!
```

## 🐛 Solución de Problemas

### La aplicación no inicia

1. Verifica que Docker esté ejecutándose:
   ```bash
   docker --version
   docker-compose --version
   ```

2. Revisa los logs:
   ```bash
   docker-compose logs mqv-web
   ```

### MongoDB no se conecta

1. Verifica que MongoDB esté saludable:
   ```bash
   docker-compose exec mqv-mongodb mongosh --eval "db.adminCommand('ping')"
   ```

2. Reinicia los servicios:
   ```bash
   ./docker-utils.sh restart
   ```

### Problemas de permisos en uploads

```bash
# Arreglar permisos del directorio de uploads
docker-compose exec mqv-web chown -R mqvapp:nodejs /app/uploads
```

### Limpiar completamente

Si tienes problemas persistentes:

```bash
# Detener y limpiar todo
./docker-utils.sh clean

# Reconstruir desde cero
./docker-utils.sh build
./docker-utils.sh start
```

## 📊 Monitoreo y Logs

### Ver logs en tiempo real:
```bash
# Todos los servicios
docker-compose logs -f

# Solo la aplicación
docker-compose logs -f mqv-web

# Solo MongoDB
docker-compose logs -f mqv-mongodb
```

### Verificar salud de servicios:
```bash
# Estado de contenedores
docker-compose ps

# Healthcheck de la aplicación
curl http://localhost:3000/health
```

## 🔐 Seguridad en Producción

### Recomendaciones importantes:

1. **Cambia todas las contraseñas por defecto**
2. **Usa JWT_SECRET fuerte y único**
3. **Configura HTTPS con certificados SSL**
4. **Usa Docker Secrets para información sensible**
5. **Implementa backups regulares**
6. **Configura firewall apropriado**

### Ejemplo de Docker Secrets:

```yaml
# En docker-compose.yml
secrets:
  jwt_secret:
    external: true
  mongo_password:
    external: true

services:
  mqv-web:
    secrets:
      - jwt_secret
      - mongo_password
```

## 🆘 Soporte

Si tienes problemas:

1. Revisa los logs: `./docker-utils.sh logs`
2. Verifica el estado: `./docker-utils.sh status`
3. Consulta la documentación oficial de Docker
4. Reporta issues en el repositorio del proyecto

---

**¡Tu iglesia ahora está dockerizada y lista para usar! 🎉**
