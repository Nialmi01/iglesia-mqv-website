# Script de utilidades para Docker - Iglesia MQV (PowerShell)
param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

# Función para mostrar ayuda
function Show-Help {
    Write-Host "🏛️  Iglesia MQV - Docker Utilities" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Uso: .\docker-utils.ps1 [COMMAND]"
    Write-Host ""
    Write-Host "Comandos disponibles:"
    Write-Host "  build           Construir las imágenes Docker"
    Write-Host "  dev             Iniciar en modo desarrollo (con logs)"
    Write-Host "  start           Iniciar los servicios en background"
    Write-Host "  stop            Detener los servicios"
    Write-Host "  restart         Reiniciar los servicios"
    Write-Host "  logs            Ver logs de los servicios"
    Write-Host "  status          Ver estado de los contenedores"
    Write-Host "  clean           Limpiar contenedores, imágenes y volúmenes"
    Write-Host "  backup          Hacer backup de la base de datos"
    Write-Host "  restore         Restaurar backup de la base de datos"
    Write-Host "  shell           Abrir shell en el contenedor de la aplicación"
    Write-Host "  mongo           Abrir shell de MongoDB"
    Write-Host "  help            Mostrar esta ayuda"
}

# Función para verificar si Docker está instalado
function Test-Docker {
    if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Docker no está instalado" -ForegroundColor Red
        Write-Host "Por favor instala Docker Desktop desde: https://docs.docker.com/desktop/windows/"
        exit 1
    }
    
    if (!(Get-Command docker-compose -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Docker Compose no está disponible" -ForegroundColor Red
        Write-Host "Por favor instala Docker Compose"
        exit 1
    }
}

# Función para construir imágenes
function Build-Images {
    Write-Host "🔨 Construyendo imágenes Docker..." -ForegroundColor Blue
    docker-compose build --no-cache
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Imágenes construidas exitosamente" -ForegroundColor Green
    }
}

# Función para iniciar en modo desarrollo
function Start-Dev {
    Write-Host "🚀 Iniciando Iglesia MQV en modo desarrollo..." -ForegroundColor Blue
    docker-compose up --build
}

# Función para iniciar servicios
function Start-Services {
    Write-Host "🚀 Iniciando servicios de Iglesia MQV..." -ForegroundColor Blue
    docker-compose up -d
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Servicios iniciados" -ForegroundColor Green
        Write-Host "🌐 Aplicación disponible en: http://localhost:3000" -ForegroundColor Yellow
        Write-Host "🔧 Panel Admin: http://localhost:3000/admin" -ForegroundColor Yellow
    }
}

# Función para detener servicios
function Stop-Services {
    Write-Host "🛑 Deteniendo servicios..." -ForegroundColor Blue
    docker-compose down
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Servicios detenidos" -ForegroundColor Green
    }
}

# Función para reiniciar servicios
function Restart-Services {
    Write-Host "🔄 Reiniciando servicios..." -ForegroundColor Blue
    docker-compose restart
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Servicios reiniciados" -ForegroundColor Green
    }
}

# Función para ver logs
function Show-Logs {
    Write-Host "📋 Mostrando logs..." -ForegroundColor Blue
    docker-compose logs -f
}

# Función para ver estado
function Show-Status {
    Write-Host "📊 Estado de los servicios:" -ForegroundColor Blue
    docker-compose ps
}

# Función para limpiar
function Clean-Resources {
    Write-Host "⚠️  Esto eliminará contenedores, imágenes y volúmenes" -ForegroundColor Yellow
    $confirmation = Read-Host "¿Estás seguro? (y/N)"
    if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
        Write-Host "🧹 Limpiando recursos Docker..." -ForegroundColor Blue
        docker-compose down -v --remove-orphans
        docker system prune -a -f
        Write-Host "✅ Limpieza completada" -ForegroundColor Green
    }
}

# Función para backup
function Backup-Database {
    Write-Host "💾 Creando backup de MongoDB..." -ForegroundColor Blue
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    docker-compose exec mqv-mongodb mongodump --db iglesia_mqv --out /data/backup_$timestamp
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backup creado: backup_$timestamp" -ForegroundColor Green
    }
}

# Función para restaurar
function Restore-Database {
    Write-Host "⚠️  Esto reemplazará la base de datos actual" -ForegroundColor Yellow
    $confirmation = Read-Host "¿Estás seguro? (y/N)"
    if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
        $timestamp = Read-Host "Ingresa el timestamp del backup (YYYYMMDD_HHMMSS)"
        Write-Host "🔄 Restaurando backup..." -ForegroundColor Blue
        docker-compose exec mqv-mongodb mongorestore --db iglesia_mqv --drop /data/backup_$timestamp/iglesia_mqv
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Backup restaurado" -ForegroundColor Green
        }
    }
}

# Función para abrir shell en la aplicación
function Open-Shell {
    Write-Host "🐚 Abriendo shell en contenedor de aplicación..." -ForegroundColor Blue
    docker-compose exec mqv-web sh
}

# Función para abrir shell de MongoDB
function Open-MongoShell {
    Write-Host "🍃 Abriendo shell de MongoDB..." -ForegroundColor Blue
    docker-compose exec mqv-mongodb mongosh iglesia_mqv
}

# Verificar Docker
Test-Docker

# Procesar comando
switch ($Command.ToLower()) {
    "build" { Build-Images }
    "dev" { Start-Dev }
    "start" { Start-Services }
    "stop" { Stop-Services }
    "restart" { Restart-Services }
    "logs" { Show-Logs }
    "status" { Show-Status }
    "clean" { Clean-Resources }
    "backup" { Backup-Database }
    "restore" { Restore-Database }
    "shell" { Open-Shell }
    "mongo" { Open-MongoShell }
    "help" { Show-Help }
    default {
        Write-Host "❌ Comando no reconocido: $Command" -ForegroundColor Red
        Write-Host ""
        Show-Help
        exit 1
    }
}
