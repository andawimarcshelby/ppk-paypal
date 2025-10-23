# backend/Dockerfile — PHP 8.3 CLI (dev) for Laravel 12
# Multi-stage: pull Composer for dependency installs
FROM composer:2 AS composer

FROM php:8.3-cli-alpine

# Install system packages & PHP extensions needed by Laravel + PostgreSQL
RUN apk add --no-cache git unzip bash libpq-dev oniguruma-dev libzip-dev $PHPIZE_DEPS \
    && docker-php-ext-install pdo pdo_pgsql bcmath

# Copy composer binary from the composer image
COPY --from=composer /usr/bin/composer /usr/bin/composer

# Set workdir
WORKDIR /var/www/html

# Default command for local dev; will work once Laravel exists
# Prefer artisan serve; fallback to PHP built-in server if artisan not found
CMD ["sh", "-lc", "if [ -f artisan ]; then php artisan serve --host 0.0.0.0 --port 8000; else php -S 0.0.0.0:8000 -t public; fi"]
