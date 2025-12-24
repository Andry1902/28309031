FROM ubuntu:latest

ENV DEBIAN_FRONTEND=noninteractive

# Instalar dependencias
RUN apt-get update -y && apt-get upgrade -y && \
    apt-get install -y \
    apache2 \
    apache2-utils \
    python3 \
    libapache2-mod-wsgi-py3 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Habilitar módulos Apache
RUN a2enmod wsgi

# Copiar TODO el contenido al contenedor
COPY . /var/www/html/

# Configurar permisos
RUN chown -R www-data:www-data /var/www && \
    chmod -R 755 /var/www && \
    find /var/www/html -type f -exec chmod 644 {} \; && \
    find /var/www/html -type d -exec chmod 755 {} \;

# Configuración Apache
RUN echo 'ServerName localhost' >> /etc/apache2/apache2.conf

RUN echo '<VirtualHost *:80>' > /etc/apache2/sites-available/ati.conf && \
    echo '    ServerName localhost' >> /etc/apache2/sites-available/ati.conf && \
    echo '    DocumentRoot /var/www/html' >> /etc/apache2/sites-available/ati.conf && \
    echo '' >> /etc/apache2/sites-available/ati.conf && \
    echo '    ErrorLog ${APACHE_LOG_DIR}/error.log' >> /etc/apache2/sites-available/ati.conf && \
    echo '    CustomLog ${APACHE_LOG_DIR}/access.log combined' >> /etc/apache2/sites-available/ati.conf && \
    echo '' >> /etc/apache2/sites-available/ati.conf && \
    echo '    # PERMITIR acceso a archivos .json directamente' >> /etc/apache2/sites-available/ati.conf && \
    echo '    <FilesMatch "\.json$">' >> /etc/apache2/sites-available/ati.conf && \
    echo '        Require all granted' >> /etc/apache2/sites-available/ati.conf && \
    echo '    </FilesMatch>' >> /etc/apache2/sites-available/ati.conf && \
    echo '' >> /etc/apache2/sites-available/ati.conf && \
    echo '    <Directory /var/www/html>' >> /etc/apache2/sites-available/ati.conf && \
    echo '        Options Indexes FollowSymLinks' >> /etc/apache2/sites-available/ati.conf && \
    echo '        AllowOverride None' >> /etc/apache2/sites-available/ati.conf && \
    echo '        Require all granted' >> /etc/apache2/sites-available/ati.conf && \
    echo '    </Directory>' >> /etc/apache2/sites-available/ati.conf && \
    echo '' >> /etc/apache2/sites-available/ati.conf && \
    echo '    # WSGI Configuration - solo para rutas principales' >> /etc/apache2/sites-available/ati.conf && \
    echo '    WSGIScriptAliasMatch ^/(?!.*\.(css|js|jpg|jpeg|png|gif|ico|json|txt|py)$) /var/www/html/index.py' >> /etc/apache2/sites-available/ati.conf && \
    echo '    WSGIDaemonProcess ati python-path=/var/www/html python-home=/usr' >> /etc/apache2/sites-available/ati.conf && \
    echo '    WSGIProcessGroup ati' >> /etc/apache2/sites-available/ati.conf && \
    echo '    WSGIScriptReloading On' >> /etc/apache2/sites-available/ati.conf && \
    echo '' >> /etc/apache2/sites-available/ati.conf && \
    echo '    <Directory /var/www/html>' >> /etc/apache2/sites-available/ati.conf && \
    echo '        <Files index.py>' >> /etc/apache2/sites-available/ati.conf && \
    echo '            Require all granted' >> /etc/apache2/sites-available/ati.conf && \
    echo '        </Files>' >> /etc/apache2/sites-available/ati.conf && \
    echo '    </Directory>' >> /etc/apache2/sites-available/ati.conf && \
    echo '' >> /etc/apache2/sites-available/ati.conf && \
    echo '    # Alias para archivos estáticos' >> /etc/apache2/sites-available/ati.conf && \
    echo '    Alias /css /var/www/html/css' >> /etc/apache2/sites-available/ati.conf && \
    echo '    <Directory /var/www/html/css>' >> /etc/apache2/sites-available/ati.conf && \
    echo '        Options Indexes FollowSymLinks' >> /etc/apache2/sites-available/ati.conf && \
    echo '        Require all granted' >> /etc/apache2/sites-available/ati.conf && \
    echo '    </Directory>' >> /etc/apache2/sites-available/ati.conf && \
    echo '' >> /etc/apache2/sites-available/ati.conf && \
    echo '    Alias /js /var/www/html/js' >> /etc/apache2/sites-available/ati.conf && \
    echo '    <Directory /var/www/html/js>' >> /etc/apache2/sites-available/ati.conf && \
    echo '        Options Indexes FollowSymLinks' >> /etc/apache2/sites-available/ati.conf && \
    echo '        Require all granted' >> /etc/apache2/sites-available/ati.conf && \
    echo '    </Directory>' >> /etc/apache2/sites-available/ati.conf && \
    echo '' >> /etc/apache2/sites-available/ati.conf && \
    echo '    # Permitir acceso COMPLETO a directorios de estudiantes' >> /etc/apache2/sites-available/ati.conf && \
    echo '    <DirectoryMatch "/var/www/html/(19|18|14|20|28)[0-9]+">' >> /etc/apache2/sites-available/ati.conf && \
    echo '        Options Indexes FollowSymLinks' >> /etc/apache2/sites-available/ati.conf && \
    echo '        Require all granted' >> /etc/apache2/sites-available/ati.conf && \
    echo '    </DirectoryMatch>' >> /etc/apache2/sites-available/ati.conf && \
    echo '</VirtualHost>' >> /etc/apache2/sites-available/ati.conf

RUN a2dissite 000-default.conf && a2ensite ati.conf

EXPOSE 80

CMD ["apache2ctl", "-D", "FOREGROUND"]