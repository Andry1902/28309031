FROM ubuntu:latest

ENV DEBIAN_FRONTEND=noninteractive

# Instalar dependencias
RUN apt-get update -y && apt-get upgrade -y && \
    apt-get install -y \
    apache2 \
    apache2-utils \
    python3 \
    python3-pip \
    python3-venv \
    libapache2-mod-wsgi-py3 \
    curl \
    git \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Habilitar módulos Apache
RUN a2enmod wsgi rewrite headers expires

# Copiar TODO el contenido del repositorio ATI al contenedor
COPY . /var/www/html/

# Configurar permisos
RUN chown -R www-data:www-data /var/www/html && \
    chmod -R 755 /var/www/html

# Configuración Apache directamente en el Dockerfile
RUN echo '<VirtualHost *:80>' > /etc/apache2/sites-available/ati.conf && \
    echo '    ServerName localhost' >> /etc/apache2/sites-available/ati.conf && \
    echo '    DocumentRoot /var/www/html' >> /etc/apache2/sites-available/ati.conf && \
    echo '' >> /etc/apache2/sites-available/ati.conf && \
    echo '    ErrorLog ${APACHE_LOG_DIR}/error.log' >> /etc/apache2/sites-available/ati.conf && \
    echo '    CustomLog ${APACHE_LOG_DIR}/access.log combined' >> /etc/apache2/sites-available/ati.conf && \
    echo '' >> /etc/apache2/sites-available/ati.conf && \
    echo '    # Archivos estáticos' >> /etc/apache2/sites-available/ati.conf && \
    echo '    Alias /css/ "/var/www/css/"' >> /etc/apache2/sites-available/ati.conf && \
    echo '    Alias /js/ "/var/www/js/"' >> /etc/apache2/sites-available/ati.conf && \
    echo '    Alias /conf/ "/var/www/conf/"' >> /etc/apache2/sites-available/ati.conf && \
    echo '    Alias /datos/ "/var/www/datos/"' >> /etc/apache2/sites-available/ati.conf && \
    echo '' >> /etc/apache2/sites-available/ati.conf && \
    echo '    <Directory "/var/www/html">' >> /etc/apache2/sites-available/ati.conf && \
    echo '        Options Indexes FollowSymLinks' >> /etc/apache2/sites-available/ati.conf && \
    echo '        AllowOverride None' >> /etc/apache2/sites-available/ati.conf && \
    echo '        Require all granted' >> /etc/apache2/sites-available/ati.conf && \
    echo '    </Directory>' >> /etc/apache2/sites-available/ati.conf && \
    echo '' >> /etc/apache2/sites-available/ati.conf && \
    echo '    # WSGI Configuration' >> /etc/apache2/sites-available/ati.conf && \
    echo '    WSGIScriptAlias / /var/www/html/index.py' >> /etc/apache2/sites-available/ati.conf && \
    echo '    WSGIDaemonProcess ati python-home=/usr python-path=/var/www/html' >> /etc/apache2/sites-available/ati.conf && \
    echo '    WSGIProcessGroup ati' >> /etc/apache2/sites-available/ati.conf && \
    echo '' >> /etc/apache2/sites-available/ati.conf && \
    echo '    <Directory /var/www/html>' >> /etc/apache2/sites-available/ati.conf && \
    echo '        WSGIApplicationGroup %{GLOBAL}' >> /etc/apache2/sites-available/ati.conf && \
    echo '        <Files index.py>' >> /etc/apache2/sites-available/ati.conf && \
    echo '            Require all granted' >> /etc/apache2/sites-available/ati.conf && \
    echo '        </Files>' >> /etc/apache2/sites-available/ati.conf && \
    echo '    </Directory>' >> /etc/apache2/sites-available/ati.conf && \
    echo '' >> /etc/apache2/sites-available/ati.conf && \
    echo '    # SPA Routing - redirect everything to index.py' >> /etc/apache2/sites-available/ati.conf && \
    echo '    RewriteEngine On' >> /etc/apache2/sites-available/ati.conf && \
    echo '    RewriteCond %{REQUEST_FILENAME} !-f' >> /etc/apache2/sites-available/ati.conf && \
    echo '    RewriteCond %{REQUEST_FILENAME} !-d' >> /etc/apache2/sites-available/ati.conf && \
    echo '    RewriteRule ^(.*)$ / [QSA,L]' >> /etc/apache2/sites-available/ati.conf && \
    echo '</VirtualHost>' >> /etc/apache2/sites-available/ati.conf

# Habilitar sitio
RUN a2dissite 000-default.conf && a2ensite ati.conf

EXPOSE 80

CMD ["apache2ctl", "-D", "FOREGROUND"]