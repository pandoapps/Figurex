FROM php:8.4-fpm

# Dependências de sistema necessárias para as extensões PHP usadas pelo Laravel.
RUN apt-get update && apt-get install -y \
    git \
    curl \
    zip \
    unzip \
    libzip-dev \
    libpng-dev \
    libonig-dev \
    && docker-php-ext-install pdo_mysql mbstring bcmath zip gd \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Composer (copiado da imagem oficial).
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

EXPOSE 9000
CMD ["php-fpm"]
