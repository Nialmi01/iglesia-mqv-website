#!/bin/bash
# Script de utilidades para Docker - Iglesia MQV

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar ayuda
show_help() {
    echo -e "${BLUE}🏛️  Iglesia MQV - Docker Utilities${NC}"
    echo ""
    echo "Uso: ./docker-utils.sh [COMMAND]"
    echo ""
    echo "Comandos disponibles:"
    echo "  build           Construir las imágenes Docker"
    echo "  dev             Iniciar en modo desarrollo (con logs)"
    echo "  start           Iniciar los servicios en background"
    echo "  stop            Detener los servicios"
    echo "  restart         Reiniciar los servicios"
    echo "  logs            Ver logs de los servicios"
    echo "  status          Ver estado de los contenedores"
    echo "  clean           Limpiar contenedores, imágenes y volúmenes"
    echo "  backup          Hacer backup de la base de datos"
    echo "  restore         Restaurar backup de la base de datos"
    echo "  shell           Abrir shell en el contenedor de la aplicación"
    echo "  mongo           Abrir shell de MongoDB"
    echo "  help            Mostrar esta ayuda"
}

# Función para verificar si Docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker no está instalado${NC}"
        echo "Por favor instala Docker desde: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! command -v docker compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose no está disponible${NC}"
        echo "Por favor instala Docker Compose"
        exit 1
    fi
}

# Función para usar docker-compose o docker compose
docker_compose() {
    if command -v docker-compose &> /dev/null; then
        docker-compose "$@"
    else
        docker compose "$@"
    fi
}

# Función para construir imágenes
build() {
    echo -e "${BLUE}🔨 Construyendo imágenes Docker...${NC}"
    docker_compose build --no-cache
    echo -e "${GREEN}✅ Imágenes construidas exitosamente${NC}"
}

# Función para iniciar en modo desarrollo
dev() {
    echo -e "${BLUE}🚀 Iniciando Iglesia MQV en modo desarrollo...${NC}"
    docker_compose up --build
}

# Función para iniciar servicios
start() {
    echo -e "${BLUE}🚀 Iniciando servicios de Iglesia MQV...${NC}"
    docker_compose up -d
    echo -e "${GREEN}✅ Servicios iniciados${NC}"
    echo -e "${YELLOW}🌐 Aplicación disponible en: http://localhost:3000${NC}"
    echo -e "${YELLOW}🔧 Panel Admin: http://localhost:3000/admin${NC}"
}

# Función para detener servicios
stop() {
    echo -e "${BLUE}🛑 Deteniendo servicios...${NC}"
    docker_compose down
    echo -e "${GREEN}✅ Servicios detenidos${NC}"
}

# Función para reiniciar servicios
restart() {
    echo -e "${BLUE}🔄 Reiniciando servicios...${NC}"
    docker_compose restart
    echo -e "${GREEN}✅ Servicios reiniciados${NC}"
}

# Función para ver logs
logs() {
    echo -e "${BLUE}📋 Mostrando logs...${NC}"
    docker_compose logs -f
}

# Función para ver estado
status() {
    echo -e "${BLUE}📊 Estado de los servicios:${NC}"
    docker_compose ps
}

# Función para limpiar
clean() {
    echo -e "${YELLOW}⚠️  Esto eliminará contenedores, imágenes y volúmenes${NC}"
    read -p "¿Estás seguro? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}🧹 Limpiando recursos Docker...${NC}"
        docker_compose down -v --remove-orphans
        docker system prune -a -f
        echo -e "${GREEN}✅ Limpieza completada${NC}"
    fi
}

# Función para backup
backup() {
    echo -e "${BLUE}💾 Creando backup de MongoDB...${NC}"
    timestamp=$(date +%Y%m%d_%H%M%S)
    docker_compose exec mqv-mongodb mongodump --db iglesia_mqv --out /data/backup_$timestamp
    echo -e "${GREEN}✅ Backup creado: backup_$timestamp${NC}"
}

# Función para restaurar
restore() {
    echo -e "${YELLOW}⚠️  Esto reemplazará la base de datos actual${NC}"
    read -p "¿Estás seguro? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Ingresa el timestamp del backup (YYYYMMDD_HHMMSS): " timestamp
        echo -e "${BLUE}🔄 Restaurando backup...${NC}"
        docker_compose exec mqv-mongodb mongorestore --db iglesia_mqv --drop /data/backup_$timestamp/iglesia_mqv
        echo -e "${GREEN}✅ Backup restaurado${NC}"
    fi
}

# Función para abrir shell en la aplicación
shell() {
    echo -e "${BLUE}🐚 Abriendo shell en contenedor de aplicación...${NC}"
    docker_compose exec mqv-web sh
}

# Función para abrir shell de MongoDB
mongo() {
    echo -e "${BLUE}🍃 Abriendo shell de MongoDB...${NC}"
    docker_compose exec mqv-mongodb mongosh iglesia_mqv
}

# Verificar Docker
check_docker

# Procesar comando
case "${1:-help}" in
    build)
        build
        ;;
    dev)
        dev
        ;;
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    logs)
        logs
        ;;
    status)
        status
        ;;
    clean)
        clean
        ;;
    backup)
        backup
        ;;
    restore)
        restore
        ;;
    shell)
        shell
        ;;
    mongo)
        mongo
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}❌ Comando no reconocido: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
