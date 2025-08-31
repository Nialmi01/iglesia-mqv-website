# Dockerfile para Iglesia MQV
FROM node:18-alpine

# Información del mantenedor
LABEL maintainer="Iglesia MQV <admin@iglesiaiqv.com>"
LABEL description="Website para Iglesia Más que Vencedores (MQV)"

# Instalar dependencias del sistema
RUN apk add --no-cache \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S mqvapp -u 1001

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de Node.js
RUN npm ci --only=production && npm cache clean --force

# Copiar código fuente
COPY --chown=mqvapp:nodejs . .

# Crear directorio para uploads
RUN mkdir -p uploads && \
    chown -R mqvapp:nodejs uploads

# Cambiar al usuario no-root
USER mqvapp

# Exponer puerto
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Usar dumb-init para manejar señales
ENTRYPOINT ["dumb-init", "--"]

# Comando por defecto
CMD ["node", "server.js"]

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js
