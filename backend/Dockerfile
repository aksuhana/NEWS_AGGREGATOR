FROM php:8.3-cli

RUN apt-get update \
 && apt-get install -y git unzip libzip-dev libicu-dev libonig-dev netcat-openbsd \
 && docker-php-ext-install pdo pdo_mysql intl \
 && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1 COMPOSER_MEMORY_LIMIT=-1

WORKDIR /app
COPY . .
RUN composer install --no-interaction --prefer-dist --no-dev

EXPOSE 8000
CMD sh -lc '\
  [ -f vendor/autoload.php ] || composer install --no-interaction --prefer-dist --no-dev; \
  [ -f .env ] || cp .env.example .env; \
  sed -i "s/^DB_CONNECTION=.*/DB_CONNECTION=mysql/" .env || true; \
  sed -i "s/^DB_HOST=.*/DB_HOST=db/"               .env || true; \
  sed -i "s/^DB_PORT=.*/DB_PORT=3306/"             .env || true; \
  sed -i "s/^DB_DATABASE=.*/DB_DATABASE=news/"     .env || true; \
  sed -i "s/^DB_USERNAME=.*/DB_USERNAME=news/"     .env || true; \
  sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=news/"     .env || true; \
  sed -i "s/^SESSION_DRIVER=.*/SESSION_DRIVER=file/" .env || true; \
  sed -i "s/^CACHE_STORE=.*/CACHE_STORE=file/"       .env || true; \
  sed -i "s/^QUEUE_CONNECTION=.*/QUEUE_CONNECTION=sync/" .env || true; \
  grep -qE "^APP_KEY=base64:" .env || php artisan key:generate --force; \
  # wait for MySQL to accept TCP
  until nc -z db 3306; do echo "Waiting for DB..."; sleep 2; done; \
  php artisan optimize:clear; \
  php artisan migrate --force; \
  php artisan serve --host=0.0.0.0 --port=8000 \
'
