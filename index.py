#!/usr/bin/env python3
import os
import json
import urllib.parse

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONF_DIR = os.path.join(BASE_DIR, 'conf')
DATA_DIR = os.path.join(BASE_DIR, 'datos')

def cargar_json(archivo):
    try:
        with open(archivo, 'r', encoding='utf-8') as f:
            contenido = f.read()
            if contenido.strip().startswith('const'):
                inicio = contenido.find('{')
                if inicio != -1: contenido = contenido[inicio:]
                if contenido.strip().endswith(';'): contenido = contenido.rstrip(';')
            return json.loads(contenido)
    except Exception:
        return None

def servir_json(contenido, start_response, cache_control='no-cache'):
    json_str = json.dumps(contenido, ensure_ascii=False)
    headers = [
        ('Content-Type', 'application/json; charset=utf-8'),
        ('Content-Length', str(len(json_str.encode('utf-8')))),
        ('Cache-Control', cache_control),
        ('Access-Control-Allow-Origin', '*'),
    ]
    start_response('200 OK', headers)
    return [json_str.encode('utf-8')]

def generar_shell_html(config, lang='ES'):
    """Genera la estructura base (Shell) que la SPA usará para inyectar contenido"""
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

    <main id="app-content">
        <div class="listado-estudiantes">
            <div class="contenedor-cajas" id="contenedor-estudiantes">
                </div>
        </div>
    </main>

    <footer>
        <p id="footer-text">{config['copyRight']}</p>
    </footer>
    
    <script type="module" src="/js/app.js"></script>
</body>
</html>'''

def application(environ, start_response):
    path_info = environ.get('PATH_INFO', '')
    
    # Manejo de solicitudes de datos JSON
    if path_info.endswith('.json'):
        parts = path_info.strip('/').split('/')
        if len(parts) == 2 and parts[1] == 'perfil.json':
            perfil_path = os.path.join(BASE_DIR, parts[0], 'perfil.json')
            if os.path.exists(perfil_path):
                return servir_json(cargar_json(perfil_path), start_response)
        elif path_info == '/datos/index.json':
            return servir_json(cargar_json(os.path.join(DATA_DIR, 'index.json')), start_response)
        elif path_info.startswith('/conf/'):
            return servir_json(cargar_json(os.path.join(CONF_DIR, os.path.basename(path_info))), start_response)

    # Para cualquier otra ruta, servimos la base HTML
    params = urllib.parse.parse_qs(environ.get('QUERY_STRING', ''))
    lang = params.get('lang', ['ES'])[0].upper()
    config = cargar_json(os.path.join(CONF_DIR, f'config{lang}.json')) or cargar_json(os.path.join(CONF_DIR, 'configES.json'))
    
    html = generar_shell_html(config, lang)
    headers = [('Content-Type', 'text/html; charset=utf-8'), ('Content-Length', str(len(html.encode('utf-8'))))]
    start_response('200 OK', headers)
    return [html.encode('utf-8')]