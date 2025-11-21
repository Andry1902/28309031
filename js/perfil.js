const urlParams = new URLSearchParams(window.location.search);
const ci = urlParams.get('ci');

// Si no hay CI mostramos un error
if (!ci) {
    document.body.innerHTML = '<h1>Error: No se ha especificado la Cédula de Identidad del perfil.</h1>';
    document.title = 'Perfil no encontrado';
    throw new Error('CI no especificada en la URL.'); 
}

const perfilJsonPath = `${ci}/perfil.json`;

const script = document.createElement('script');
script.src = perfilJsonPath;
script.type = 'text/javascript';

script.onload = function() {
    if (typeof perfil !== 'undefined' && perfil.ci === ci) {
        renderizarPerfil(perfil);
    } else {
        mostrarError('No se pudo cargar el perfil. Verifica que el archivo exista.');
    }
};

script.onerror = function() {
    mostrarError(`Error al cargar el perfil: ${perfilJsonPath}`);
};

document.head.appendChild(script);

function renderizarPerfil(data) {
    document.title = data.nombre;

    const fotoContainer = document.querySelector('.foto');
    if (fotoContainer) {
        if(data.ci === '28309031') {
            fotoContainer.innerHTML = `
                <img src="${data.ci}/${data.ci}Pequena.jpg" 
                    alt="${data.nombre}"
                    class="foto-perfil foto-pequena-responsive">
                <img src="${data.ci}/${data.ci}Grande.jpg" 
                    alt="${data.nombre}"
                    class="foto-perfil foto-grande-responsive">
            `;
        } else {
            // Otros estudiantes - una imagen normal
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

    // Cargar los datos para dispositivos pequeños
    const misDatosMovil = document.getElementById('mis-datos-movil');
    if (misDatosMovil) {
        const color = Array.isArray(data.color) ? data.color.join(', ') : data.color;
        const libro = Array.isArray(data.libro) ? data.libro.join(', ') : data.libro;
        const musica = Array.isArray(data.musica) ? data.musica.join(', ') : data.musica;
        const videojuego = Array.isArray(data.video_juego) ? data.video_juego.join(', ') : data.video_juego;
        const lenguajes = Array.isArray(data.lenguajes) ? data.lenguajes.join(', ') : data.lenguajes;
        
        misDatosMovil.innerHTML = `
            Mi color favorito es: ${color} <br />
            Mi libro favorito es: ${libro} <br />
            Mi estilo de musica preferida es: ${musica} <br />
            Video juegos favoritos: ${videojuego} <br />
            <b>Lenguajes aprendidos: ${lenguajes}</b>
        `;
    }

    const emailLink = document.getElementById('email-link');
    if (emailLink) {
        emailLink.href = `mailto:${data.email}`;
        emailLink.textContent = data.email;
    }
}