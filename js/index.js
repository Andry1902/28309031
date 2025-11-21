document.addEventListener('DOMContentLoaded', function() {

    setTimeout(function() {
        iniciarAplicacion();
    }, 100);
});

function iniciarAplicacion() {
    const urlParams = new URLSearchParams(window.location.search);
    let language = urlParams.get('lang');
    
    if (!language) {
        const newUrl = window.location.href + (window.location.href.includes('?') ? '&' : '?') + 'lang=ES';
        window.location.href = newUrl;
        return;
    }

    cargarIdioma(language);
}

function cargarIdioma(language) {
    
    const confLanguage = document.createElement('script');
    confLanguage.src = `conf/config${language}.json`;
    
    confLanguage.onload = function() {

        actualizarInterfaz();
        cargarEstudiantes();
        configurarBusqueda();
    };
    
    confLanguage.onerror = function() {
        console.error('Error cargando el archivo de idioma:', language);

        const fallback = document.createElement('script');
        fallback.src = 'conf/configES.json';
        fallback.onload = function() {
            actualizarInterfaz();
            cargarEstudiantes();
            configurarBusqueda();
        };
        document.head.appendChild(fallback);
    };
    
    document.head.appendChild(confLanguage);
}


function actualizarInterfaz() {
    
    const tituloSitio = document.querySelector('nav ul li:first-child');
    if (tituloSitio && config && config.sitio) {
        tituloSitio.innerHTML = `${config.sitio[0]}<span class="UCV">[${config.sitio[1]}]</span> ${config.sitio[2]}`;
    }
    
    const greeting = document.querySelector('#greeting');
    if (greeting && config && perfiles && perfiles[0]) {
        greeting.innerHTML = `${config.saludo} <p>, Andreina Velasquez</p>`;
    }
    
    const searchInput = document.querySelector('#searchInput');
    if (searchInput && config) {
        searchInput.placeholder = config.nombre;
    }
    
    const searchButton = document.querySelector('#search-button');
    if (searchButton && config) {
        searchButton.textContent = config.buscar;
    }
    
    const footerText = document.querySelector('#footer-text');
    if (footerText && config) {
        footerText.textContent = config.copyRight;
    }
}

function cargarEstudiantes() {
    const contenedor = document.getElementById('contenedor-estudiantes');
    contenedor.innerHTML = '';

    const urlParams = new URLSearchParams(window.location.search);
    const currentLang = urlParams.get('lang') || 'ES';
    
    perfiles.forEach(perfil => {
        const estudianteDiv = document.createElement('div');
        estudianteDiv.className = 'caja-estudiante';
        estudianteDiv.id = `student-${perfil.ci}`;
        
        if (perfil.ci === '28309031') {
            // Andreina responsive
            estudianteDiv.innerHTML = `
                  <a href="perfil.html?ci=${perfil.ci}&lang=${currentLang}">
                    <img src="${perfil.ci}/${perfil.ci}Pequena.jpg" alt="${perfil.nombre}" class="foto-estudiante foto-pequena-responsive">
                    <img src="${perfil.ci}/${perfil.ci}Grande.jpg" alt="${perfil.nombre}" class="foto-estudiante foto-grande-responsive">
                    <span class="nombre-estudiante">${perfil.nombre}</span>
                </a>`;
        } else {
            estudianteDiv.innerHTML = 
            `<a href="perfil.html?ci=${perfil.ci}&lang=${currentLang}">
            <img src="${perfil.imagen}" alt="${perfil.nombre}" class="foto-estudiante" onerror="this.src='dummies/dummy1/dummy.jpg'"> <span class="nombre-estudiante">${perfil.nombre}</span>
            </a>`;
        }
        
        contenedor.appendChild(estudianteDiv);
    });
}

function configurarBusqueda() {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('searchInput');
    
    
    function realizarBusqueda() {
        const searchTerm = searchInput.value.trim();
        const searchTermLower = searchTerm.toLowerCase();
        
        const mensajeAnterior = document.getElementById('mensaje-no-encontrado');
        if (mensajeAnterior) {
            mensajeAnterior.remove();
        }
        
        let estudiantesEncontrados = 0;
        
        // Filtra estudiantes
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
            mensajeDiv.textContent = `No hay alumnos que tengan en su nombre: ${searchTerm}`;
            contenedor.appendChild(mensajeDiv);
        }
    }

    searchInput.addEventListener('input', function() {
        realizarBusqueda();
    });
    
    
}