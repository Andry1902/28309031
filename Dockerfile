FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Variables de entorno
ENV APP_NAME=28309031
ENV APP_DIR=/var/www/${APP_NAME}

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

RUN a2enmod wsgi
RUN a2enmod rewrite
RUN a2enmod headers
RUN a2enmod expires

# Python
RUN pip3 install --no-cache-dir flask flask-cors
RUN mkdir -p ${APP_DIR}

# Configurar Apache para la aplicación
COPY ati_app.conf /etc/apache2/sites-available/
COPY ati_app.wsgi ${APP_DIR}/

# Habilitar el sitio y deshabilitar el default
RUN a2dissite 000-default.conf
RUN a2ensite ati_app.conf

# Exponer puerto
EXPOSE 80

# Comando para iniciar
CMD ["apache2ctl", "-D", "FOREGROUND"]