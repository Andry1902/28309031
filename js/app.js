class ATIApp {
    constructor() {
        this.currentLang = 'ES';
        this.config = null;
        this.perfiles = null;
        this.currentCI = null;
        this.init();
    }
    
    async init() {
        const urlParams = new URLSearchParams(window.location.search);
        this.currentLang = urlParams.get('lang') || 'ES';
        this.currentCI = urlParams.get('ci');
        
        await this.loadConfig();
        await this.loadPerfiles();
        this.setupEventListeners();
        this.setupLoadingStates();
        
        this.render();
    }

    async loadConfig() {
        try {
            const response = await fetch(`/conf/config${this.currentLang}.json`);
            const text = await response.text();
            this.config = JSON.parse(this.cleanJsonString(text));
        } catch (e) {
            const fallback = await fetch('/conf/configES.json');
            const text = await fallback.text();
            this.config = JSON.parse(this.cleanJsonString(text));
        }
    }

    async loadPerfiles() {
        try {
            const response = await fetch('/datos/index.json');
            const text = await response.text();
            this.perfiles = JSON.parse(this.cleanJsonString(text));
        } catch (e) {
            console.error("Error cargando perfiles:", e);
        }
    }

    cleanJsonString(text) {
        return text.replace(/^const\s+\w+\s*=\s*/i, '').replace(/;$/g, '').trim();
    }

    render() {
        this.showLoading();
        
        // Referencias a los elementos
        const header = document.getElementById('main-header');
        const footer = document.getElementById('main-footer');
        const viewHome = document.getElementById('view-home');
        const viewPerfil = document.getElementById('view-perfil');

        if (this.currentCI) {
            // --- VISTA PERFIL ---
            this.updatePerfilView();
            
            // Ocultar elementos comunes
            if (header) header.style.display = 'none';
            if (footer) footer.style.display = 'none';
            
            // Switch de vistas
            viewHome.style.display = 'none';
            viewPerfil.style.display = 'block';
        } else {
            // --- VISTA LISTADO ---
            this.updateHomeView();
            
            // Mostrar elementos comunes
            if (header) header.style.display = 'block';
            if (footer) footer.style.display = 'block';
            
            // Switch de vistas
            viewHome.style.display = 'block';
            viewPerfil.style.display = 'none';
        }
        
        this.updateInterface();
        this.hideLoading();
    }

    async updateHomeView() {
        const contenedor = document.getElementById('contenedor-estudiantes');
        contenedor.innerHTML = ''; // Limpiar previo

        this.perfiles.forEach(perfil => {
            const item = document.createElement('div');
            item.className = 'caja-estudiante';
            
            const isAndreina = perfil.ci === '28309031';
            const imgPath = isAndreina ? `/${perfil.ci}/${perfil.ci}` : (perfil.imagen || `/${perfil.ci}/${perfil.ci}.jpg`);

            item.innerHTML = `
                <a href="?ci=${perfil.ci}&lang=${this.currentLang}">
                    <img src="${isAndreina ? imgPath+'Pequena.jpg' : imgPath}" 
                        class="foto-estudiante ${isAndreina ? 'foto-pequena-responsive' : ''}" 
                        onerror="this.src='/img/default.jpg'">
                    ${isAndreina ? `<img src="${imgPath}Grande.jpg" class="foto-estudiante foto-grande-responsive">` : ''}
                    <span class="nombre-estudiante">${perfil.nombre}</span>
                </a>`;
            contenedor.appendChild(item);
        });
    }

 async updatePerfilView() {
    try {
        const response = await fetch(`/${this.currentCI}/perfil.json`);
        const text = await response.text();
        const perfil = JSON.parse(this.cleanJsonString(text));
        
        document.getElementById('perfil-nombre').textContent = perfil.nombre;
        document.getElementById('perfil-descripcion').textContent = perfil.descripcion;
        
        document.getElementById('label-color').textContent = `${this.config.color}:`;
        document.getElementById('label-libro').textContent = `${this.config.libro}:`;
        document.getElementById('label-musica').textContent = `${this.config.musica}:`; 
        document.getElementById('label-lenguajes').textContent = `${this.config.lenguajes}:`; 
        
        document.getElementById('val-color').textContent = perfil.color;
        document.getElementById('val-libro').textContent = perfil.libro; 
        document.getElementById('val-musica').textContent = perfil.musica; 
        
        const lenguajes = Array.isArray(perfil.lenguajes) ? perfil.lenguajes.join(', ') : perfil.lenguajes;
        document.getElementById('val-lenguajes').textContent = lenguajes;
            
            const fotoCont = document.getElementById('perfil-foto-container');
            if (perfil.ci === '28309031') {
                fotoCont.innerHTML = `
                    <img src="/${perfil.ci}/${perfil.ci}Pequena.jpg" class="foto-perfil foto-pequena-responsive">
                    <img src="/${perfil.ci}/${perfil.ci}Grande.jpg" class="foto-perfil foto-grande-responsive">`;
            } else {
                fotoCont.innerHTML = `<img src="/${perfil.ci}/${perfil.ci}.jpg" class="foto-perfil">`;
            }
            
        } catch (e) {
            this.currentCI = null;
            this.render();
        }
    }
    realizarBusqueda() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;

        const searchTerm = searchInput.value.trim();
        const searchTermLower = searchTerm.toLowerCase();
        
        const mensajeAnterior = document.getElementById('mensaje-no-encontrado');
        if (mensajeAnterior) {
            mensajeAnterior.remove();
        }
        
        let estudiantesEncontrados = 0;
        
        document.querySelectorAll('.caja-estudiante').forEach(estudiante => {
            const nombre = estudiante.querySelector('.nombre-estudiante').textContent.toLowerCase();
            if (nombre.includes(searchTermLower) || searchTerm === '') {
                estudiante.style.display = 'flex';
                estudiantesEncontrados++;
            } else {
                estudiante.style.display = 'none';
            }
        });

        if (estudiantesEncontrados === 0 && searchTerm !== '') {
            const contenedor = document.getElementById('contenedor-estudiantes');
            if (contenedor) {
                const mensajeDiv = document.createElement('div');
                mensajeDiv.id = 'mensaje-no-encontrado';
                mensajeDiv.style.cssText = `
                    text-align: center;
                    font-size: 40px;
                    color: #60add6;
                    grid-column: 1 / -1;
                    margin-top: 35%;
                    margin-bottom: 35%;
                `;
                mensajeDiv.textContent = `${this.config.EstudianteNoEntontrado} ${searchTerm}`;
                contenedor.appendChild(mensajeDiv);
            }
        }
    }

    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                if (this.currentCI) {
                    window.history.pushState({}, '', `?lang=${this.currentLang}`);
                    this.currentCI = null;
                    this.render();
                } else {
                    this.realizarBusqueda();
                }
            });
        }

        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="?"]');
            if (link) {
                e.preventDefault();
                const url = new URL(link.href, window.location.origin);
                window.history.pushState({}, '', url.search);
                this.currentCI = url.searchParams.get('ci');
                this.render();
            }
        });

        window.addEventListener('popstate', () => {
            const urlParams = new URLSearchParams(window.location.search);
            this.currentCI = urlParams.get('ci');
            this.render();
        });
    }

    updateInterface() {
        if (!this.config) return;
        document.getElementById('greeting').innerHTML = `${this.config.saludo} <p>, Andreina Velasquez</p>`;
        document.getElementById('searchInput').placeholder = this.config.nombre;
        document.getElementById('search-button').textContent = this.config.buscar;
        document.getElementById('footer-text').textContent = this.config.copyRight;
    }

    setupLoadingStates() {
        if (!document.getElementById('loading-spinner')) {
            const s = document.createElement('div');
            s.id = 'loading-spinner';
            s.style.cssText = "position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:rgba(0,0,0,0.7); color:white; padding:15px; border-radius:8px; display:none; z-index:1000;";
            s.textContent = '...';
            document.body.appendChild(s);
        }
    }

    showLoading() { document.getElementById('loading-spinner').style.display = 'block'; }
    hideLoading() { document.getElementById('loading-spinner').style.display = 'none'; }
}

document.addEventListener('DOMContentLoaded', () => new ATIApp());