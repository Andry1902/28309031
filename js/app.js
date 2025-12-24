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

    async render() {
        this.showLoading();
        if (this.currentCI) {
            await this.updatePerfilView();
        } else {
            await this.updateHomeView();
        }
        this.updateInterface();
        this.hideLoading();
    }

    async updateHomeView() {
        const container = document.getElementById('app-content');
        if (!container) return;

        container.innerHTML = `
            <section>
                <div class="listado-estudiantes">
                    <div class="contenedor-cajas" id="contenedor-estudiantes"></div>
                </div>
            </section>
        `;

        const contenedor = document.getElementById('contenedor-estudiantes');

        this.perfiles.forEach(perfil => {
            const estudianteDiv = document.createElement('div');
            estudianteDiv.className = 'caja-estudiante';
            estudianteDiv.id = `student-${perfil.ci}`;

            if (perfil.ci === '28309031') {
                // Lógica Andreina Responsive
                estudianteDiv.innerHTML = `
                    <a href="?ci=${perfil.ci}&lang=${this.currentLang}">
                        <img src="/${perfil.ci}/${perfil.ci}Pequena.jpg" alt="${perfil.nombre}" class="foto-estudiante foto-pequena-responsive">
                        <img src="/${perfil.ci}/${perfil.ci}Grande.jpg" alt="${perfil.nombre}" class="foto-estudiante foto-grande-responsive">
                        <span class="nombre-estudiante">${perfil.nombre}</span>
                    </a>`;
            } else {
                // Lógica General
                const imgSrc = perfil.imagen || `/${perfil.ci}/${perfil.ci}.jpg`;
                estudianteDiv.innerHTML = `
                    <a href="?ci=${perfil.ci}&lang=${this.currentLang}">
                        <img src="${imgSrc}" alt="${perfil.nombre}" class="foto-estudiante" onerror="this.src='/img/default.jpg'"> 
                        <span class="nombre-estudiante">${perfil.nombre}</span>
                    </a>`;
            }
            contenedor.appendChild(estudianteDiv);
        });

        this.realizarBusqueda();
    }

    async updatePerfilView() {
        try {
            const response = await fetch(`/${this.currentCI}/perfil.json`);
            const text = await response.text();
            const perfil = JSON.parse(this.cleanJsonString(text));
            
            const container = document.getElementById('app-content');
            
            let imagenHTML = `<img src="/${perfil.ci}/${perfil.ci}.jpg" class="foto-perfil">`;
            if (perfil.ci === '28309031') {
                imagenHTML = `
                    <img src="/${perfil.ci}/${perfil.ci}Pequena.jpg" class="foto-perfil foto-pequena-responsive">
                    <img src="/${perfil.ci}/${perfil.ci}Grande.jpg" class="foto-perfil foto-grande-responsive">
                `;
            }

            container.innerHTML = `
                <div class="contenedor-principal">
                    <div class="foto">${imagenHTML}</div>
                    <div class="ficha">
                        <h1>${perfil.nombre}</h1>
                        <p>${perfil.descripcion}</p>
                        <div class="contenedor-datos">
                            <div class="datos">
                                <ul class="lista-datos">
                                    <li>${this.config.color}:</li>
                                    <li>${this.config.libro}:</li>
                                    <li>${this.config.musica}:</li>
                                    <li><b>${this.config.lenguajes}:</b></li>
                                </ul>
                            </div>
                            <div class="MisDatos">
                                <ul>
                                    <li>${perfil.color}</li>
                                    <li>${perfil.libro}</li>
                                    <li>${perfil.musica}</li>
                                    <li><b>${Array.isArray(perfil.lenguajes) ? perfil.lenguajes.join(', ') : perfil.lenguajes}</b></li>
                                </ul>
                            </div>
                        </div>
                        <p>${this.config.email.replace('[email]', '')} <a href="mailto:${perfil.email}" class="correo">${perfil.email}</a></p>
                        <br>
                        <a href="?lang=${this.currentLang}" class="volver-link">← Volver al listado</a>
                    </div>
                </div>
            `;
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
                // Aquí usamos la variable del idioma desde el config cargado
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