# Guía de Contribución - Iglesia MQV Website

¡Gracias por tu interés en contribuir al proyecto del sitio web de la Iglesia Más que Vencedores! 🙏

## 📋 Cómo Contribuir

### 🐛 Reportar Bugs

1. Revisa si el bug ya fue reportado en [Issues](../../issues)
2. Si no existe, crea un nuevo issue con:
   - Descripción clara del problema
   - Pasos para reproducir el error
   - Comportamiento esperado vs actual
   - Capturas de pantalla (si aplica)
   - Información del sistema (OS, browser, Node.js version)

### 💡 Sugerir Mejoras

1. Abre un issue describiendo tu sugerencia
2. Explica por qué sería útil para la iglesia
3. Proporciona ejemplos o mockups si es posible

### 🔧 Contribuir Código

#### Configuración del Entorno

1. **Fork** el repositorio
2. **Clona** tu fork:
   ```bash
   git clone https://github.com/tu-usuario/iglesia-mqv-website.git
   cd iglesia-mqv-website
   ```
3. **Instala** dependencias:
   ```bash
   npm install
   ```
4. **Configura** variables de entorno:
   ```bash
   cp .env.example .env
   # Edita .env con tus valores
   ```

#### Desarrollo con Docker (Recomendado)

```bash
# Iniciar con Docker
docker-compose up -d

# O usar scripts de utilidades
./docker-utils.sh start    # Linux/macOS
.\docker-utils.ps1 start   # Windows
```

#### Flujo de Trabajo

1. **Crea una rama** para tu feature:
   ```bash
   git checkout -b feature/nombre-de-tu-feature
   ```

2. **Realiza tus cambios** siguiendo las convenciones:
   - Usa nombres descriptivos para variables y funciones
   - Comenta código complejo
   - Sigue el estilo existente
   - Añade logs apropiados

3. **Prueba tus cambios**:
   ```bash
   # Pruebas locales
   npm start
   
   # Con Docker
   docker-compose logs -f
   ```

4. **Commit** con mensajes descriptivos:
   ```bash
   git add .
   git commit -m "feat: añadir funcionalidad de X"
   ```

5. **Push** y crea un **Pull Request**:
   ```bash
   git push origin feature/nombre-de-tu-feature
   ```

#### Convenciones de Commit

Usa el formato: `tipo(scope): descripción`

**Tipos:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bugs
- `docs`: Documentación
- `style`: Cambios de estilo/formato
- `refactor`: Refactorización
- `test`: Pruebas
- `chore`: Tareas de mantenimiento

**Ejemplos:**
- `feat(admin): añadir gestión de eventos`
- `fix(auth): corregir validación de login`
- `docs(readme): actualizar instrucciones Docker`

### 🧪 Pruebas

- Prueba todas las funcionalidades afectadas
- Verifica responsive design
- Prueba en diferentes navegadores
- Asegúrate que Docker funcione correctamente

### 📝 Documentación

- Actualiza README.md si añades nuevas features
- Documenta cambios en variables de entorno
- Actualiza DOCKER.md para cambios de containerización

## 🎯 Áreas de Contribución

### 🌟 Funcionalidades Deseadas

- [ ] Sistema de eventos/calendario
- [ ] Newsletter/notificaciones
- [ ] Donaciones online
- [ ] Streaming en vivo
- [ ] App móvil (PWA)
- [ ] Multi-idioma
- [ ] SEO mejorado
- [ ] Analytics avanzados

### 🐛 Bugs Conocidos

- Revisa los [Issues abiertos](../../issues) para bugs conocidos

### 🔧 Mejoras Técnicas

- [ ] Tests automatizados
- [ ] CI/CD pipeline
- [ ] Performance optimization
- [ ] Security improvements
- [ ] Accessibility (WCAG)

## 📞 Contacto

Para preguntas específicas sobre el desarrollo:

- **Email**: dev@iglesiaiqv.com
- **Issues**: [GitHub Issues](../../issues)
- **Discusiones**: [GitHub Discussions](../../discussions)

## 🙏 Reconocimientos

Todos los contribuidores serán reconocidos en nuestro README.md y en el sitio web.

---

**¡Que Dios bendiga tu contribución al Reino! 🙏✨**
