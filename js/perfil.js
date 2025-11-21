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
        console.log('Idioma cargado correctamente:', config);
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
            console.log('Perfil cargado correctamente:', perfil.nombre);
            renderizarPerfil(perfil);
        } else {
            mostrarError('No se pudo cargar el perfil. Verifica que el archivo exista.');
        }
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
                    onerror="this.src='dummies/dummy1/dummy.jpg'">
            `;
        }
    }

    const nombreElement = document.getElementById('profile-name');
    if (nombreElement) {
        nombreElement.textContent = data.nombre;
    }
    const infoElement = document.getElementById('info-student');
    if (infoElement) {
        infoElement.textContent = data.descripcion;
    }

    const misDatosLista = document.getElementById('mis-datos-lista');
    if (misDatosLista) {
        const color = Array.isArray(data.color) ? data.color.join(', ') : data.color;
        const libro = Array.isArray(data.libro) ? data.libro.join(', ') : data.libro;
        const musica = Array.isArray(data.musica) ? data.musica.join(', ') : data.musica;
        const videojuego = Array.isArray(data.video_juego) ? data.video_juego.join(', ') : data.video_juego;
        const lenguajes = Array.isArray(data.lenguajes) ? data.lenguajes.join(', ') : data.lenguajes;
        
        misDatosLista.innerHTML = `
            <li>${color}</li>
            <li>${libro}</li>
            <li>${musica}</li>
            <li>${videojuego}</li>
            <li><b>${lenguajes}</b></li>
        `;
    }

    // Cargar para dispositivos pequeños
    const misDatosMovil = document.getElementById('mis-datos-movil');
    if (misDatosMovil && config) {
        const color = Array.isArray(data.color) ? data.color.join(', ') : data.color;
        const libro = Array.isArray(data.libro) ? data.libro.join(', ') : data.libro;
        const musica = Array.isArray(data.musica) ? data.musica.join(', ') : data.musica;
        const videojuego = Array.isArray(data.video_juego) ? data.video_juego.join(', ') : data.video_juego;
        const lenguajes = Array.isArray(data.lenguajes) ? data.lenguajes.join(', ') : data.lenguajes;
        
        misDatosMovil.innerHTML = `
            ${config.color}: ${color} <br />
            ${config.libro}: ${libro} <br />
            ${config.musica}: ${musica} <br />
            ${config.video_juego}: ${videojuego} <br />
            <b>${config.lenguajes}: ${lenguajes}</b>
        `;
    }

    const emailLink = document.getElementById('email-link');
    if (emailLink) {
        emailLink.href = `mailto:${data.email}`;
        emailLink.textContent = data.email;
    }
}