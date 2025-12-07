const urlParams = new URLSearchParams(window.location.search);
const ci = urlParams.get('ci');

// Si no hay CI mostramos un error
if (!ci) {
    document.body.innerHTML = '<h1>Error: No se ha especificado la Cédula de Identidad del perfil.</h1>';
    document.title = 'Perfil no encontrado';
    throw new Error('CI no especificada en la URL.'); 
}

// Cargar idioma 
iniciarAplicacion();

function iniciarAplicacion() {
    const urlParams = new URLSearchParams(window.location.search);
    let language = urlParams.get('lang');
    cargarIdioma(language);
}

function cargarIdioma(language) {
    
    const confLanguage = document.createElement('script');
    confLanguage.src = `conf/config${language}.json`;
    
    confLanguage.onload = function() {
        console.log('this:', this);
        actualizarInterfaz();
        //cargamos el perfil
        cargarPerfil();
    };
    
    confLanguage.onerror = function() {
        console.error('Error cargando el archivo de idioma:', language);

        const fallback = document.createElement('script');
        fallback.src = 'conf/configES.json';
        fallback.onload = function() {
            actualizarInterfaz();
            cargarPerfil();
        };
        document.head.appendChild(fallback);
    };
    
    document.head.appendChild(confLanguage);
}

function actualizarInterfaz() {

    const datosContainer = document.querySelector('.datos ul');
    if (datosContainer && config) {
        datosContainer.innerHTML = `
            <li>${config.color}:</li>
            <li>${config.libro}:</li>
            <li>${config.musica}: </li>
            <li>${config.video_juego}:</li>
            <li><b>${config.lenguajes}:</b></li>
        `;
    }

    const textEmail = document.querySelector('#ParaComunicarse');
    if (textEmail && config) {
        const emailPlaceholder = '<a href="#" id="email-link" class="correo"></a>';
        textEmail.innerHTML = `${config.email} <a href="#" id="email-link" class="correo"></a>`;
    }
}

function cargarPerfil() {
    const perfilJsonPath = `${ci}/perfil.json`;
    console.log('Cargando perfil desde:', perfilJsonPath);

    const script = document.createElement('script');
    script.src = perfilJsonPath;
    script.type = 'text/javascript';

    script.onload = function() {
        if (typeof perfil !== 'undefined' && perfil.ci === ci) {
            console.log('this:', this);
            renderizarPerfil(perfil);
        } 
    };

    script.onerror = function() {
        mostrarError(`Error al cargar el perfil: ${this.src}`);
        document.body.innerHTML = `<h1>Ups, no pudimos encontrar el perfil solicitado </h1>`;
    };

    document.head.appendChild(script);
}

function renderizarPerfil(data) {
    document.title = data.nombre;

    const fotoContainer = document.querySelector('.foto');
    if (fotoContainer) {
        if(data.ci === '28309031') {
            // Andreina responsive
            fotoContainer.innerHTML = `
                <img src="${data.ci}/${data.ci}Pequena.jpg" 
                    alt="${data.nombre}"
                    class="foto-perfil foto-pequena-responsive">
                <img src="${data.ci}/${data.ci}Grande.jpg" 
                    alt="${data.nombre}"
                    class="foto-perfil foto-grande-responsive">
            `;
        } else {
            // Otros estudiantes
            fotoContainer.innerHTML = `
                <img src="${data.ci}/${data.ci}.jpg"
                    alt="${data.nombre}" 
                    class="foto-perfil"
                    onerror="manejarErrorImagen(this, '${data.ci}')">
            `;
        }
    }

    // this para elementos
    const elementos = [
        { selector: '#profile-name', prop: 'nombre', action: 'textContent' },
        { selector: '#info-student', prop: 'descripcion', action: 'textContent' }
    ];
    
    elementos.forEach(item => {
        const elemento = document.querySelector(item.selector);
        console.log('this:', this);
        if (elemento) {
            elemento[item.action] = data[item.prop];
        }
    });

    const misDatosLista = document.getElementById('mis-datos-lista');
    if (misDatosLista) {
        
        const datos = ['color', 'libro', 'musica', 'video_juego', 'lenguajes'].map(function(prop) {
            const valor = data[prop];
            const esArray = Array.isArray(valor);
            const contenido = esArray ? valor.join(', ') : valor;
            const esLenguaje = prop === 'lenguajes';
            
            return esLenguaje ? `<b>${contenido}</b>` : contenido;
        });
        
        misDatosLista.innerHTML = datos.map(dato => `<li>${dato}</li>`).join('');
    }

    // Cargar para dispositivos pequeños
    const emailLink = document.getElementById('email-link');
    if (emailLink) {
        emailLink.href = `mailto:${data.email}`;
        emailLink.textContent = data.email;
    }
}