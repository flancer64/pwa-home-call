# Сервис systemd для Node.js-приложения HomeCall (`ctx/rules/arch/env/systemd.md`)

## Назначение

Определяет правила создания и управления systemd-сервисом, обеспечивающим автоматический запуск backend-приложения HomeCall при загрузке Ubuntu.

## Пример юнит-файла

```ini
[Unit]
Description=HomeCall Backend Service
After=network.target

[Service]
Type=simple
Restart=always
User={user}
WorkingDirectory=/home/{user}/inst/app/homecall/prod
Environment="NVM_DIR=/home/{user}/.nvm"
ExecStart=/bin/bash -c 'source $NVM_DIR/nvm.sh && npm start'
StandardOutput=append:/home/{user}/store/homecall/log/out.log
StandardError=append:/home/{user}/store/homecall/log/out.log

[Install]
WantedBy=multi-user.target
```

## Правила настройки

1. Юнит-файлы сервисов проекта размещаются в каталоге:

```text
~/system/
```

где `~` — домашний каталог владельца установки.

2. Для активации сервиса создаётся символьная ссылка:

```bash
sudo ln -s /home/{user}/system/homecall.service /etc/systemd/system/homecall.service
```

3. После добавления ссылки выполняются команды:

```bash
sudo systemctl daemon-reload
sudo systemctl enable homecall
sudo systemctl start homecall
```

4. Логи доступны через `journalctl -u homecall` и по путям, указанным в конфигурации.

5. Для обновления или перезапуска приложения:

```bash
sudo systemctl restart homecall
```

## Связи

- `./node.md` — окружение Node.js.
- `./config.md` — переменные `.env`.
- `../back.md` — архитектура backend-приложения.

## Итог

Документ описывает стандартный способ интеграции backend-приложения HomeCall в систему Ubuntu через systemd.
