# Компонент: Apache HTTP Server

## Назначение

Apache используется как внешний HTTP-сервер в архитектуре проекта **HomeCall**: раздаёт статику фронтенда и проксирует API-запросы к Node.js-приложению, построенному на `@flancer32/teq-web` поверх `@teqfw/di`.

## Минимальная конфигурация

```apache
<VirtualHost *:80>
    ServerName homecall.local
    DocumentRoot /var/www/homecall/web

    <Directory /var/www/homecall/web>
        Options -Indexes +FollowSymLinks
        AllowOverride None
        Require all granted
    </Directory>

    ProxyPreserveHost On
    ProxyRequests Off
    ProxyPass /api http://127.0.0.1:3000/api
    ProxyPassReverse /api http://127.0.0.1:3000/api

    ErrorLog ${APACHE_LOG_DIR}/homecall-error.log
    CustomLog ${APACHE_LOG_DIR}/homecall-access.log combined
</VirtualHost>
```

Конфигурация разделяет статику (`/web/`) и API (`/api/*`), сохраняя Node.js-сервис доступным только локально.

## Ссылки

- `../architecture.md` — архитектурный обзор и связи окружений.
- `../linkage.md` — подробная схема взаимодействия архитектуры и окружений.
- `./node.md` — описание Node.js-окружения (обратная ссылка).

## Итог

Документ фиксирует роль Apache как внешнего слоя развёртывания и поддерживает связь с архитектурными декларациями HomeCall.
