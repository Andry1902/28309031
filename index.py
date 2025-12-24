#!/usr/bin/env python3
"""
Aplicación WSGI principal que actúa como controlador frontal
para la aplicación SPA de perfiles de estudiantes
"""

import os
import json
import urllib.parse

# Rutas base - CORREGIDAS para coincidir con tu estructura
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONF_DIR = os.path.join(BASE_DIR, 'conf')
DATA_DIR = os.path.join(BASE_DIR, 'datos')

def cargar_json(archivo):
    """Carga un archivo JSON ignorando la primera línea con 'const'"""
    try:
        with open(archivo, 'r', encoding='utf-8') as f:
            contenido = f.read()
            # Eliminar 'const variable = ' si existe
            if contenido.strip().startswith('const'):
                inicio = contenido.find('{')
                if inicio != -1:
                    contenido = contenido[inicio:]
                # También eliminar el punto y coma final si existe
                if contenido.strip().endswith(';'):
                    contenido = contenido.rstrip(';')
            return json.loads(contenido)
    except Exception as e:
        print(f"Error cargando {archivo}: {e}")
        return None

def obtener_parametros(environ):
    """Extrae parámetros de la query string"""
    query_string = environ.get('QUERY_STRING', '')
    return urllib.parse.parse_qs(query_string)

def generar_template_html(tipo='home', datos=None, config=None, lang='ES'):
    """Genera el HTML según el tipo de página"""
    
    if tipo == 'home':
        return f'''<!DOCTYPE html>
<html lang="{lang.lower()}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" href="/img/favicon.ico" type="image/x-icon">
    <title>{config['sitio'][0]}[{config['sitio'][1]}] {config['sitio'][2]}</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <header>
        <nav>
            <ul>
                <li class="encabezado">{config['sitio'][0]}<span class="UCV">[{config['sitio'][1]}]</span> {config['sitio'][2]}</li>
                <li class="encabezado" id="greeting">{config['saludo']} <p>, Andreina Velasquez</p></li>
                <li class="encabezado">
                    <form id="search-form">
                        <input type="text" id="searchInput" class="busqueda-input" placeholder="{config['nombre']}">
                        <button type="button" id="search-button" class="busqueda-boton">{config['buscar']}</button>
                    </form>
                </li>
            </ul>
        </nav>
    </header>

    <section>
        <div class="listado-estudiantes">
            <div class="contenedor-cajas" id="contenedor-estudiantes">
                <!-- Los estudiantes se cargarán dinámicamente con JavaScript -->
            </div>
        </div>
    </section>

    <footer>
        <p id="footer-text">{config['copyRight']}</p>
    </footer>
    
    <script type="module" src="/ATI/js/app.js"></script>
</body>
</html>'''
    
    elif tipo == 'perfil' and datos:
        # Determinar qué imagen mostrar basado en el estudiante
        if datos['ci'] == '28309031':
            img_html = f'''
            <img src="/ATI/{datos['ci']}/{datos['ci']}Pequena.jpg" alt="{datos['nombre']}" class="foto-perfil foto-pequena-responsive">
            <img src="/ATI/{datos['ci']}/{datos['ci']}Grande.jpg" alt="{datos['nombre']}" class="foto-perfil foto-grande-responsive">
            '''
        else:
            img_html = f'<img src="/ATI/{datos["ci"]}/{datos["ci"]}.jpg" alt="{datos["nombre"]}" class="foto-perfil">'
        
        return f'''<!DOCTYPE html>
<html lang="{lang.lower()}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" href="/ATI/img/favicon.ico" type="image/x-icon">
    <title>{datos['nombre']}</title>
    <link rel="stylesheet" href="/ATI/css/style.css">
</head>
<body>
    <div class="contenedor-principal">
        <div class="foto">
            {img_html}
        </div>

        <div class="ficha">
            <div>
                <h1 id="profile-name">{datos['nombre']}</h1>
                <p id="info-student">{datos['descripcion']}</p>

                <div class="contenedor-datos">
                    <div class="datos">
                        <ul class="lista-datos" id="lista-etiquetas">
                            <!-- Las etiquetas se cargarán dinámicamente -->
                        </ul>
                    </div>

                    <div class="MisDatos">
                        <ul id="mis-datos-lista">
                            <!-- Los datos se cargarán dinámicamente -->
                        </ul>
                    </div>
                </div>

                <p id="ParaComunicarse">{config['email'].replace('[email]', '')} <a href="mailto:{datos['email']}" id="email-link" class="correo">{datos['email']}</a></p>
            </div>
        </div>
    </div>
    
    <script type="module" src="/ATI/js/app.js"></script>
</body>
</html>'''

def application(environ, start_response):
    """Función principal WSGI - Controlador Frontal"""
    
    # 1. Obtener parámetros de la URL
    params = obtener_parametros(environ)
    ci = params.get('ci', [None])[0]
    lang = params.get('lang', ['ES'])[0].upper()
    
    # 2. Cargar configuración de idioma
    config_path = os.path.join(CONF_DIR, f'config{lang}.json')
    config = cargar_json(config_path)
    
    if not config:
        # Fallback a español
        config_path = os.path.join(CONF_DIR, 'configES.json')
        config = cargar_json(config_path)
        lang = 'ES'
    
    # 3. Decidir qué mostrar basado en parámetros (?ci=...)
    if ci:
        # Modo PERFIL - cargar datos del estudiante específico
        perfil_path = os.path.join(BASE_DIR, ci, 'perfil.json')
        perfil = cargar_json(perfil_path)
        
        if perfil:
            html = generar_template_html('perfil', perfil, config, lang)
        else:
            # Si no existe el perfil, mostrar home
            html = generar_template_html('home', config=config, lang=lang)
    else:
        # Modo HOME - página principal
        html = generar_template_html('home', config=config, lang=lang)
    
    # 4. Enviar respuesta
    headers = [
        ('Content-Type', 'text/html; charset=utf-8'),
        ('Content-Length', str(len(html.encode('utf-8')))),
        ('Cache-Control', 'no-cache'),
    ]
    
    start_response('200 OK', headers)
    return [html.encode('utf-8')]

# Para ejecución directa (testing)
if __name__ == '__main__':
    from wsgiref.simple_server import make_server
    print("Servidor WSGI iniciando en http://localhost:8000")
    make_server('localhost', 8000, application).serve_forever()