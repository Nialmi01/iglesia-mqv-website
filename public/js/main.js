// Configuración global
const CONFIG = {
    API_BASE_URL: '',
    ANIMATION_DURATION: 300,
    NOTIFICATION_TIMEOUT: 5000
};

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Deshabilitar animaciones problemáticas
    // initializeAnimations();
    // initializeScrollEffects();
    initializeSmoothScrolling();
});

// Funciones de animación - DESHABILITADAS
function initializeAnimations() {
    // Animaciones deshabilitadas para evitar problemas de z-index
    return;
}

function initializeScrollEffects() {
    // Efectos de scroll deshabilitados
    return;
}

function initializeSmoothScrolling() {
    // Scroll suave para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Utilidades generales
const Utils = {
    // Mostrar notificaciones
    showNotification: function(message, type = 'success', duration = CONFIG.NOTIFICATION_TIMEOUT) {
        const alertClass = type === 'success' ? 'alert-success' : 
                          type === 'error' ? 'alert-danger' : 
                          type === 'warning' ? 'alert-warning' : 'alert-info';
        
        const icon = type === 'success' ? 'fas fa-check-circle' : 
                    type === 'error' ? 'fas fa-exclamation-triangle' : 
                    type === 'warning' ? 'fas fa-exclamation-triangle' : 'fas fa-info-circle';

        const notification = `
            <div class="alert ${alertClass} alert-dismissible fade show notification-alert" role="alert">
                <i class="${icon} me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        // Insertar notificación
        let container = document.getElementById('notifications');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notifications';
            container.className = 'position-fixed top-0 end-0 p-3';
            container.style.zIndex = '9999';
            document.body.appendChild(container);
        }

        const alertElement = document.createElement('div');
        alertElement.innerHTML = notification;
        container.appendChild(alertElement.firstElementChild);

        // Auto-hide después del tiempo especificado
        setTimeout(() => {
            const alerts = container.querySelectorAll('.notification-alert');
            alerts.forEach(alert => {
                if (alert.parentNode) {
                    alert.classList.remove('show');
                    setTimeout(() => {
                        if (alert.parentNode) {
                            alert.remove();
                        }
                    }, 150);
                }
            });
        }, duration);
    },

    // Formatear fechas
    formatDate: function(date, options = {}) {
        const defaultOptions = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const formatOptions = { ...defaultOptions, ...options };
        return new Date(date).toLocaleDateString('es-ES', formatOptions);
    },

    // Formatear tamaño de archivo
    formatFileSize: function(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // Debounce function
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Validar email
    isValidEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Capitalizar primera letra
    capitalize: function(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
};

// Manejo de formularios
const FormHandler = {
    // Validar formulario
    validateForm: function(formElement) {
        let isValid = true;
        const inputs = formElement.querySelectorAll('input[required], textarea[required], select[required]');

        inputs.forEach(input => {
            if (!input.value.trim()) {
                this.showFieldError(input, 'Este campo es requerido');
                isValid = false;
            } else if (input.type === 'email' && !Utils.isValidEmail(input.value)) {
                this.showFieldError(input, 'Email inválido');
                isValid = false;
            } else {
                this.clearFieldError(input);
            }
        });

        return isValid;
    },

    // Mostrar error en campo
    showFieldError: function(input, message) {
        input.classList.add('is-invalid');
        
        let errorElement = input.parentNode.querySelector('.invalid-feedback');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'invalid-feedback';
            input.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
    },

    // Limpiar error de campo
    clearFieldError: function(input) {
        input.classList.remove('is-invalid');
        const errorElement = input.parentNode.querySelector('.invalid-feedback');
        if (errorElement) {
            errorElement.remove();
        }
    },

    // Enviar formulario con AJAX
    submitForm: function(formElement, callback) {
        if (!this.validateForm(formElement)) {
            return;
        }

        const formData = new FormData(formElement);
        const url = formElement.action || window.location.href;
        const method = formElement.method || 'POST';

        fetch(url, {
            method: method,
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (callback) callback(data);
        })
        .catch(error => {
            console.error('Error:', error);
            Utils.showNotification('Error enviando formulario', 'error');
        });
    }
};

// Manejo de medios (fotos/videos)
const MediaHandler = {
    // Preview de archivos antes de subir
    previewFiles: function(inputElement, previewContainer) {
        const files = Array.from(inputElement.files);
        previewContainer.innerHTML = '';

        files.forEach((file, index) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const previewElement = document.createElement('div');
                previewElement.className = 'col-md-4 mb-3 file-preview';
                
                let content = '';
                if (file.type.startsWith('image/')) {
                    content = `
                        <div class="card">
                            <img src="${e.target.result}" class="card-img-top" style="height: 200px; object-fit: cover;" alt="Preview">
                            <div class="card-body p-2">
                                <small class="text-muted">${file.name}</small><br>
                                <small class="text-muted">${Utils.formatFileSize(file.size)}</small>
                            </div>
                        </div>
                    `;
                } else if (file.type.startsWith('video/')) {
                    content = `
                        <div class="card">
                            <video class="card-img-top" style="height: 200px; object-fit: cover;" controls>
                                <source src="${e.target.result}" type="${file.type}">
                            </video>
                            <div class="card-body p-2">
                                <small class="text-muted">${file.name}</small><br>
                                <small class="text-muted">${Utils.formatFileSize(file.size)}</small>
                            </div>
                        </div>
                    `;
                }
                
                previewElement.innerHTML = content;
                previewContainer.appendChild(previewElement);
            };
            
            reader.readAsDataURL(file);
        });
    },

    // Crear galería con lightbox
    initializeGallery: function(selector) {
        const galleryItems = document.querySelectorAll(selector);
        
        galleryItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const src = this.dataset.src || this.src;
                const title = this.dataset.title || this.alt;
                const type = this.dataset.type || 'image';
                
                MediaHandler.showLightbox(src, title, type);
            });
        });
    },

    // Mostrar lightbox
    showLightbox: function(src, title, type = 'image') {
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox-overlay';
        lightbox.innerHTML = `
            <div class="lightbox-container">
                <button class="lightbox-close" onclick="this.closest('.lightbox-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
                <div class="lightbox-content">
                    ${type === 'image' ? 
                        `<img src="${src}" alt="${title}" class="lightbox-media">` :
                        `<video src="${src}" controls class="lightbox-media"></video>`
                    }
                    ${title ? `<div class="lightbox-title">${title}</div>` : ''}
                </div>
            </div>
        `;

        document.body.appendChild(lightbox);
        
        // Cerrar con Escape
        document.addEventListener('keydown', function closeOnEscape(e) {
            if (e.key === 'Escape') {
                lightbox.remove();
                document.removeEventListener('keydown', closeOnEscape);
            }
        });
        
        // Cerrar al hacer clic fuera
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                lightbox.remove();
            }
        });
    }
};

// Animaciones y efectos visuales
const AnimationHandler = {
    // Animación de aparición al hacer scroll
    observeElements: function(selector, animationClass = 'animate-fade-up') {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(animationClass);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        document.querySelectorAll(selector).forEach(el => {
            observer.observe(el);
        });
    },

    // Smooth scroll para anchors
    initializeSmoothScroll: function() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    },

    // Lazy loading de imágenes
    initializeLazyLoading: function() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('fade-in');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }
};

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar tooltips de Bootstrap
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Inicializar popovers de Bootstrap
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function(popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Inicializar animaciones
    AnimationHandler.observeElements('.card');
    AnimationHandler.observeElements('section');
    AnimationHandler.initializeSmoothScroll();
    AnimationHandler.initializeLazyLoading();

    // Inicializar galería de medios
    MediaHandler.initializeGallery('.gallery-item');

    // Manejo de formularios de contacto
    const contactForms = document.querySelectorAll('.contact-form');
    contactForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            FormHandler.submitForm(this, function(response) {
                if (response.success) {
                    Utils.showNotification('Mensaje enviado exitosamente');
                    form.reset();
                } else {
                    Utils.showNotification(response.message || 'Error enviando mensaje', 'error');
                }
            });
        });
    });

    // Búsqueda en tiempo real (si existe)
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', Utils.debounce(function() {
            const query = this.value.toLowerCase();
            const searchableItems = document.querySelectorAll('.searchable-item');
            
            searchableItems.forEach(item => {
                const text = item.textContent.toLowerCase();
                if (text.includes(query) || query === '') {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        }, 300));
    }

    // Manejo de navegación activa
    const currentLocation = location.pathname;
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentLocation) {
            link.classList.add('active');
        }
    });

    // Efecto parallax simple en el hero
    const hero = document.querySelector('.hero-section');
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallax = scrolled * 0.5;
            hero.style.transform = `translateY(${parallax}px)`;
        });
    }

    // Auto-hide navbar en mobile al hacer clic en link
    const navbarCollapse = document.querySelector('.navbar-collapse');
    const navbarToggler = document.querySelector('.navbar-toggler');
    
    if (navbarCollapse && navbarToggler) {
        document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (navbarCollapse.classList.contains('show')) {
                    navbarToggler.click();
                }
            });
        });
    }

    // Detectar tema del sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-theme');
    }

    // Loading de la página
    window.addEventListener('load', function() {
        const loader = document.querySelector('.page-loader');
        if (loader) {
            loader.classList.add('fade-out');
            setTimeout(() => loader.remove(), 300);
        }
    });
});

// Manejo de errores globales
window.addEventListener('error', function(e) {
    console.error('Error global:', e.error);
});

// Función global para cambio de tema (si se implementa)
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Restaurar tema guardado
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
});

// Exportar utilidades para uso global
window.Utils = Utils;
window.FormHandler = FormHandler;
window.MediaHandler = MediaHandler;
window.AnimationHandler = AnimationHandler;
