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
    return f'''<!DOCTYPE html>
<html lang="{lang.lower()}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{config['sitio'][0]} - {config['sitio'][2]}</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <header id="main-header"> <nav>
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
        <section id="view-home" class="view">
            <div class="listado-estudiantes">
                <div class="contenedor-cajas" id="contenedor-estudiantes"></div>
            </div>
        </section>

        <section id="view-perfil" class="view" style="display: none;">
            <div class="contenedor-principal">
                <div class="foto" id="perfil-foto-container"></div>
                <div class="ficha">
                    <h1 id="perfil-nombre"></h1>
                    <p id="perfil-descripcion"></p>
                    <div class="contenedor-datos">
                        <div class="datos">
                            <ul class="lista-datos">
                                <li id="label-color"></li>
                                <li id="label-libro"></li>
                                <li id="label-musica"></li>
                                <li><b id="label-lenguajes"></b></li>
                            </ul>
                        </div>
                        <div class="MisDatos">
                            <ul>
                                <li id="val-color"></li>
                                <li id="val-libro"></li>
                                <li id="val-musica"></li>
                                <li><b id="val-lenguajes"></b></li>
                            </ul>
                        </div>
                    </div>
                    <p id="perfil-email-box"></p>
                    <br>
                    <a href="?lang={lang}" class="volver-link">← Volver al listado</a>
                </div>
            </div>
        </section>
    </main>

    <footer id="main-footer"> <p id="footer-text">{config['copyRight']}</p>
    </footer>
    
    <script type="module" src="/js/app.js"></script>
</body>
</html>'''

def application(environ, start_response):
    path_info = environ.get('PATH_INFO', '')
    
    # Manejo de JSON
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


    params = urllib.parse.parse_qs(environ.get('QUERY_STRING', ''))
    lang = params.get('lang', ['ES'])[0].upper()
    config = cargar_json(os.path.join(CONF_DIR, f'config{lang}.json')) or cargar_json(os.path.join(CONF_DIR, 'configES.json'))
    
    html = generar_shell_html(config, lang)
    headers = [('Content-Type', 'text/html; charset=utf-8'), ('Content-Length', str(len(html.encode('utf-8'))))]
    start_response('200 OK', headers)
    return [html.encode('utf-8')]