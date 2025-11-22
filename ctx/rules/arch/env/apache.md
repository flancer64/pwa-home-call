# Компонент: Apache HTTP Server

## Назначение

Apache используется как внешний HTTP-сервер в архитектуре проекта **Связист**: раздаёт статику фронтенда и проксирует API-запросы к Node.js-приложению, построенному на `@flancer32/teq-web` поверх `@teqfw/di`.

## Минимальная конфигурация

```apache
<VirtualHost *:80>
    ServerName svyazist.local
    DocumentRoot /var/www/svyazist/web

    <Directory /var/www/svyazist/web>
        Options -Indexes +FollowSymLinks
        AllowOverride None
        Require all granted
    </Directory>

    ProxyPreserveHost On
    ProxyRequests Off
    ProxyPass /api http://127.0.0.1:3000/api
    ProxyPassReverse /api http://127.0.0.1:3000/api

    ProxyPass /signal ws://127.0.0.1:${WS_PORT}/signal
    ProxyPassReverse /signal ws://127.0.0.1:${WS_PORT}/signal

    ErrorLog ${APACHE_LOG_DIR}/svyazist-error.log
    CustomLog ${APACHE_LOG_DIR}/svyazist-access.log combined
</VirtualHost>
```

Конфигурация разделяет статику (`/web/`) и API (`/api/*`), сохраняя Node.js-сервис доступным только локально.

## Ссылки

- `../architecture.md` — архитектурный обзор и связи окружений.
- `../linkage.md` — подробная схема взаимодействия архитектуры и окружений.
- `./node.md` — описание Node.js-окружения (обратная ссылка).

## Конфигурационные параметры

Apache использует значения из `.env`, в частности `HOST_PUBLIC`, для корректной маршрутизации и формирования SSL-сертификатов.  
Описание всех переменных среды приведено в документе `./config.md`.

## Итог

Документ фиксирует роль Apache как внешнего слоя развёртывания и поддерживает связь с архитектурными декларациями Связист.
