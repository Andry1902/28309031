// ATI SPA Application - Single Page Application
class ATIApp {
    constructor() {
        this.currentLang = 'ES';
        this.config = null;
        this.perfiles = null;
        this.currentCI = null;
        
        this.init();
    }
    
    async init() {
        // Detectar idioma desde URL
        const urlParams = new URLSearchParams(window.location.search);
        const langParam = urlParams.get('lang');
        this.currentLang = langParam || 'ES';
        this.currentCI = urlParams.get('ci');
        
        // Cargar configuración y perfiles mediante AJAX
        await this.loadConfig();
        await this.loadPerfiles();
        
        // Configurar eventos
        this.setupEventListeners();
        
        // Actualizar interfaz según la página actual
        if (this.currentCI) {
            await this.updatePerfilView();
        } else {
            await this.updateHomeView();
        }
        
        // Añadir loading states para mejor UX
        this.setupLoadingStates();
    }
    
    async loadConfig() {
        try {
            // AJAX call usando Fetch API
            const response = await fetch(`/ATI/conf/config${this.currentLang}.json`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const text = await response.text();
            // Limpiar el JSON (remover 'const config = ')
            const jsonStr = this.cleanJsonString(text);
            this.config = JSON.parse(jsonStr);
            
            // Guardar en sessionStorage para caché
            sessionStorage.setItem(`config_${this.currentLang}`, jsonStr);
            
        } catch (error) {
            console.warn(`No se pudo cargar config ${this.currentLang}, usando ES como fallback`);
            
            // Intentar cargar desde caché primero
            const cached = sessionStorage.getItem('config_ES');
            if (cached) {
                this.config = JSON.parse(cached);
            } else {
                const fallback = await fetch('/ATI/conf/configES.json');
                const text = await fallback.text();
                const jsonStr = this.cleanJsonString(text);
                this.config = JSON.parse(jsonStr);
                sessionStorage.setItem('config_ES', jsonStr);
            }
        }
    }
    
    async loadPerfiles() {
        try {
            // AJAX call para lista de perfiles
            const response = await fetch('/ATI/datos/index.json');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const text = await response.text();
            const jsonStr = this.cleanJsonString(text);
            this.perfiles = JSON.parse(jsonStr);
            
            // Cachear en sessionStorage
            sessionStorage.setItem('perfiles', jsonStr);
            
        } catch (error) {
            console.error('Error cargando perfiles:', error);
            
            // Intentar desde caché
            const cached = sessionStorage.getItem('perfiles');
            if (cached) {
                this.perfiles = JSON.parse(cached);
            } else {
                this.perfiles = [];
            }
        }
    }
    
    async loadPerfil(ci) {
        try {
            // AJAX call para perfil específico
            const response = await fetch(`/ATI/${ci}/perfil.json`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const text = await response.text();
            const jsonStr = this.cleanJsonString(text);
            const perfil = JSON.parse(jsonStr);
            
            // Cachear perfil individual
            sessionStorage.setItem(`perfil_${ci}`, jsonStr);
            
            return perfil;
        } catch (error) {
            console.error(`Error cargando perfil ${ci}:`, error);
            
            // Intentar desde caché
            const cached = sessionStorage.getItem(`perfil_${ci}`);
            if (cached) {
                return JSON.parse(cached);
            }
            return null;
        }
    }
    
    cleanJsonString(text) {
        // Limpiar el string JSON removiendo 'const variable = ' y punto y coma
        return text
            .replace(/^const\s+\w+\s*=\s*/i, '')
            .replace(/;$/g, '')
            .trim();
    }
    
    setupEventListeners() {
        // Buscador con debounce para mejor performance
        const searchInput = document.getElementById('searchInput');
        const searchButton = document.getElementById('search-button');
        
        if (searchInput && searchButton) {
            let searchTimeout;
            
            const performSearch = () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    const searchTerm = searchInput.value.trim().toLowerCase();
                    const students = document.querySelectorAll('.caja-estudiante');
                    let found = false;
                    
                    students.forEach(student => {
                        const name = student.querySelector('.nombre-estudiante').textContent.toLowerCase();
                        if (name.includes(searchTerm) || searchTerm === '') {
                            student.style.display = 'flex';
                            found = true;
                        } else {
                            student.style.display = 'none';
                        }
                    });
                    
                    // Mostrar mensaje si no se encuentra
                    this.showSearchMessage(found, searchTerm);
                }, 300); // 300ms debounce
            };
            
            searchInput.addEventListener('input', performSearch);
            searchButton.addEventListener('click', performSearch);
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') performSearch();
            });
        }
        
        // Navegación entre perfiles con AJAX
        document.addEventListener('click', async (e) => {
            const link = e.target.closest('a[href^="?"]');
            if (link) {
                e.preventDefault();
                
                // Mostrar loading
                this.showLoading();
                
                const url = new URL(link.href, window.location.origin);
                const params = new URLSearchParams(url.search);
                
                // Actualizar URL sin recargar (SPA)
                window.history.pushState({}, '', `?${params.toString()}`);
                
                // Cargar nuevo contenido
                this.currentCI = params.get('ci');
                if (this.currentCI) {
                    await this.updatePerfilView();
                } else {
                    await this.updateHomeView();
                }
                
                // Ocultar loading
                this.hideLoading();
            }
        });
        
        // Manejar navegación con botones atrás/adelante
        window.addEventListener('popstate', async () => {
            const urlParams = new URLSearchParams(window.location.search);
            this.currentCI = urlParams.get('ci');
            
            this.showLoading();
            
            if (this.currentCI) {
                await this.updatePerfilView();
            } else {
                await this.updateHomeView();
            }
            
            this.hideLoading();
        });
    }
    
    setupLoadingStates() {
        // Crear elemento de loading si no existe
        if (!document.getElementById('loading-spinner')) {
            const spinner = document.createElement('div');
            spinner.id = 'loading-spinner';
            spinner.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0,0,0,0.7);
                color: white;
                padding: 20px;
                border-radius: 10px;
                z-index: 1000;
                display: none;
            `;
            spinner.innerHTML = 'Cargando...';
            document.body.appendChild(spinner);
        }
    }
    
    showLoading() {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) spinner.style.display = 'block';
    }
    
    hideLoading() {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) spinner.style.display = 'none';
    }
    
    showSearchMessage(found, searchTerm) {
        let message = document.getElementById('search-message');
        if (!found && searchTerm !== '') {
            if (!message) {
                message = document.createElement('div');
                message.id = 'search-message';
                message.style.cssText = 'text-align: center; font-size: 18px; color: #60add6; grid-column: 1 / -1; margin: 20px;';
                document.getElementById('contenedor-estudiantes').appendChild(message);
            }
            message.textContent = `${this.config.EstudianteNoEntontrado} "${searchTerm}"`;
        } else if (message) {
            message.remove();
        }
    }
    
    async updateHomeView() {
        if (!this.perfiles || !this.config) return;
        
        // Actualizar elementos de interfaz
        this.updateInterface();
        
        // Renderizar estudiantes
        const container = document.getElementById('contenedor-estudiantes');
        if (!container) return;
        
        container.innerHTML = this.perfiles.map(perfil => {
            const isAndreina = perfil.ci === '28309031';
            const imageHtml = isAndreina 
                ? `<img src="/ATI/${perfil.ci}/${perfil.ci}Pequena.jpg" alt="${perfil.nombre}" class="foto-estudiante foto-pequena-responsive" loading="lazy">
                   <img src="/ATI/${perfil.ci}/${perfil.ci}Grande.jpg" alt="${perfil.nombre}" class="foto-estudiante foto-grande-responsive" loading="lazy">`
                : `<img src="/ATI/${perfil.imagen}" alt="${perfil.nombre}" class="foto-estudiante" loading="lazy" onerror="this.src='/ATI/dummies/dummy1/dummy.jpg'">`;
            
            return `
                <div class="caja-estudiante" id="student-${perfil.ci}">
                    <a href="?ci=${perfil.ci}&lang=${this.currentLang}" class="student-link">
                        ${imageHtml}
                        <span class="nombre-estudiante">${perfil.nombre}</span>
                    </a>
                </div>
            `;
        }).join('');
        
        // Actualizar título
        document.title = `${this.config.sitio[0]}[${this.config.sitio[1]}] ${this.config.sitio[2]}`;
    }
    
    async updatePerfilView() {
        if (!this.currentCI || !this.config) return;
        
        const perfil = await this.loadPerfil(this.currentCI);
        if (!perfil) {
            console.error('Perfil no encontrado');
            // Redirigir al home si no existe
            window.history.pushState({}, '', `?lang=${this.currentLang}`);
            await this.updateHomeView();
            return;
        }
        
        // Actualizar título
        document.title = perfil.nombre;
        
        // Actualizar etiquetas de datos
        const labelsList = document.getElementById('lista-etiquetas');
        if (labelsList) {
            labelsList.innerHTML = `
                <li class="item-dato">${this.config.color}:</li>
                <li class="item-dato">${this.config.libro}:</li>
                <li class="item-dato">${this.config.musica}:</li>
                <li class="item-dato">${this.config.video_juego}:</li>
                <li class="item-dato"><b>${this.config.lenguajes}:</b></li>
            `;
        }
        
        // Actualizar datos del perfil
        const datosList = document.getElementById('mis-datos-lista');
        if (datosList) {
            const formatValue = (value) => 
                Array.isArray(value) ? value.join(', ') : value;
            
            datosList.innerHTML = `
                <li>${formatValue(perfil.color)}</li>
                <li>${formatValue(perfil.libro)}</li>
                <li>${formatValue(perfil.musica)}</li>
                <li>${formatValue(perfil.video_juego)}</li>
                <li><b>${formatValue(perfil.lenguajes)}</b></li>
            `;
        }
        
        // Actualizar email link
        const emailLink = document.getElementById('email-link');
        if (emailLink) {
            emailLink.href = `mailto:${perfil.email}`;
            emailLink.textContent = perfil.email;
        }
    }
    
    updateInterface() {
        // Actualizar elementos comunes
        const greeting = document.getElementById('greeting');
        if (greeting && this.config) {
            greeting.innerHTML = `${this.config.saludo} <p>, Andreina Velasquez</p>`;
        }
        
        const searchInput = document.getElementById('searchInput');
        if (searchInput && this.config) {
            searchInput.placeholder = this.config.nombre;
        }
        
        const searchButton = document.getElementById('search-button');
        if (searchButton && this.config) {
            searchButton.textContent = this.config.buscar;
        }
        
        const footerText = document.getElementById('footer-text');
        if (footerText && this.config) {
            footerText.textContent = this.config.copyRight;
        }
    }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new ATIApp();
});