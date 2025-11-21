document.addEventListener('DOMContentLoaded', function() { 
    setTimeout(function() {
        iniciarAplicacion();
    }, 100);
});

function iniciarAplicacion() {
    cargarEstudiantes();
}

function cargarEstudiantes() {
    
    const contenedor = document.getElementById('contenedor-estudiantes');
    contenedor.innerHTML = '';
    
    perfiles.forEach(perfil => {
        const estudianteDiv = document.createElement('div');
        estudianteDiv.className = 'caja-estudiante';
        estudianteDiv.id = `student-${perfil.ci}`;
        
        // Andreina con responsive
        if (perfil.ci === '28309031') {
            estudianteDiv.innerHTML = `
                <a href="perfil.html?ci=${perfil.ci}">
                    <img src="${perfil.ci}/${perfil.ci}Pequena.jpg" alt="${perfil.nombre}" class="foto-estudiante foto-pequena-responsive">
                    <img src="${perfil.ci}/${perfil.ci}Grande.jpg" alt="${perfil.nombre}" class="foto-estudiante foto-grande-responsive">
                    <span class="nombre-estudiante">${perfil.nombre}</span>
                </a>
            `;
        } else {
            estudianteDiv.innerHTML = 
            `<a href="perfil.html?ci=${perfil.ci}">
            <img src="${perfil.imagen}" alt="${perfil.nombre}" class="foto-estudiante" onerror="this.src='dummies/dummy1/dummy.jpg'"> <span class="nombre-estudiante">${perfil.nombre}</span>
            </a>`;
        }
        
        contenedor.appendChild(estudianteDiv);
    });
    
}
