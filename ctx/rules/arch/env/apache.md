# Компонент: Apache HTTP Server

## Назначение

Apache используется как внешний HTTP-сервер в архитектуре проекта **HomeCall**.  
Он выполняет две функции:

1. Раздача статических файлов фронтенда из каталога `./web/`.
2. Проксирование API-запросов к Node.js-приложению, работающему через `@flancer32/teq-web`.

Apache не входит в состав кодовой базы и рассматривается как часть окружения развертывания.

---

## 1. Раздача статики

### Роль

Обслуживает все запросы, не начинающиеся с `/api`, напрямую из каталога `./web/`, без участия Node.js.

### Пример конфигурации

```apache
<VirtualHost *:80>
    ServerName homecall.local
    DocumentRoot /var/www/homecall/web

    <Directory /var/www/homecall/web>
        Options -Indexes +FollowSymLinks
        AllowOverride None
        Require all granted
    </Directory>

    # Кеширование статики
    <IfModule mod_expires.c>
        ExpiresActive On
        ExpiresByType text/html "access plus 0 seconds"
        ExpiresByType text/css "access plus 7 days"
        ExpiresByType application/javascript "access plus 7 days"
        ExpiresByType image/* "access plus 30 days"
    </IfModule>

    ErrorLog ${APACHE_LOG_DIR}/homecall-error.log
    CustomLog ${APACHE_LOG_DIR}/homecall-access.log combined
</VirtualHost>
```

### Комментарии

- Фронтенд размещается в `/var/www/homecall/web`, что соответствует локальному каталогу `./web/` в репозитории.
- Права доступа должны позволять только чтение.
- При необходимости можно добавить HTTPS и редирект с HTTP на HTTPS.

---

## 2. Проксирование API к Node.js

### Роль

Передаёт все запросы к `/api/*` во внутренний Node.js-сервер, запущенный на `127.0.0.1:3000`.
Используется стандартный механизм `mod_proxy` и `mod_proxy_http`.

### Пример конфигурации

```apache
<VirtualHost *:80>
    ServerName homecall.local
    DocumentRoot /var/www/homecall/web

    # Раздача статики (см. выше)
    <Directory /var/www/homecall/web>
        Options -Indexes +FollowSymLinks
        AllowOverride None
        Require all granted
    </Directory>

    # Проксирование API
    ProxyPreserveHost On
    ProxyRequests Off
    ProxyPass /api http://127.0.0.1:3000/api
    ProxyPassReverse /api http://127.0.0.1:3000/api

    ErrorLog ${APACHE_LOG_DIR}/homecall-error.log
    CustomLog ${APACHE_LOG_DIR}/homecall-access.log combined
</VirtualHost>
```

### Комментарии

- Node.js-приложение должно слушать `127.0.0.1:3000`, чтобы быть недоступным извне.
- Apache обеспечивает публичную точку входа, сохраняя контроль над доступом и логированием.
- Параметр `ProxyPreserveHost On` передаёт исходный `Host`-заголовок, что важно для корректной работы приложения.

---

## 3. Итоговая схема

```text
Клиент (браузер)
      │
      ▼
  Apache HTTP Server
   ├── /web/* → статические файлы (PWA)
   └── /api/* → Node.js @flancer32/teq-web (127.0.0.1:3000)
```

Apache формирует внешний слой архитектуры, обеспечивая безопасное разделение между фронтендом и API-сервисом.
