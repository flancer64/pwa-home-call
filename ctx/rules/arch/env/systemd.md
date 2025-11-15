# Сервис systemd для Node.js-приложения Колобок (`ctx/rules/arch/env/systemd.md`)

## Назначение

Фиксирует состояние, при котором backend-приложение **Колобок** автоматически запускается при загрузке Ubuntu и управляется пользователем через `systemd` с ограниченными правами `sudo` без запроса пароля.

---

## 1. Состояние системы

- В системе присутствует юнит-файл `kolobok.service`.
- Сервис активирован, запускается при старте системы и перезапускается при сбое.
- Пользователь `{user}` имеет право запускать и останавливать этот сервис без ввода пароля.
- Все логи сервиса записываются в `/home/{user}/store/kolobok/log/out.log` и ротируются согласно `logrotate`.

---

## 2. Пример юнит-файла

```ini
[Unit]
Description=Колобок Backend Service
After=network.target

[Service]
Type=simple
Restart=always
User={user}
WorkingDirectory=/home/{user}/inst/app/kolobok/prod
Environment="NVM_DIR=/home/{user}/.nvm"
ExecStart=/bin/bash -c 'source $NVM_DIR/nvm.sh && npm start'
StandardOutput=append:/home/{user}/store/kolobok/log/out.log
StandardError=append:/home/{user}/store/kolobok/log/out.log

[Install]
WantedBy=multi-user.target
```

---

## 3. Правила настройки

| Цель                    | Команда или действие                                                                   |
| ----------------------- | -------------------------------------------------------------------------------------- |
| зарегистрировать сервис | `sudo ln -s /home/{user}/system/kolobok.service /etc/systemd/system/kolobok.service` |
| обновить список юнитов  | `sudo systemctl daemon-reload`                                                         |
| включить автозапуск     | `sudo systemctl enable kolobok`                                                       |
| запустить сервис        | `sudo systemctl start kolobok`                                                        |
| просмотреть логи        | `journalctl -u kolobok`                                                               |
| выполнить перезапуск    | `sudo systemctl restart kolobok`                                                      |

Эти команды фиксируют требуемое состояние системы; они приведены для справки и не являются инструкцией.

---

## 4. Настройка прав sudo

Для возможности безопасного управления сервисом пользователем без запроса пароля в файл `/etc/sudoers` добавляются строки (через `visudo`):

```text
{user} ALL=(ALL) NOPASSWD: /bin/systemctl start kolobok.service
{user} ALL=(ALL) NOPASSWD: /bin/systemctl stop kolobok.service
```

Эта конфигурация разрешает выполнение только указанных команд.
Настройка сохраняется при обновлениях системы и может быть проверена командой:

```bash
sudo -l | grep kolobok
```

---

## 5. Связи

- `./node.md` — окружение Node.js
- `./config.md` — переменные `.env`
- `../back.md` — архитектура backend-приложения
- `./logrotate.md` — правила ротации логов

---

## Итог

Документ фиксирует требуемое состояние интеграции backend-приложения Колобок в систему Ubuntu:
сервис `kolobok` присутствует, активирован, управляется через `systemd`, а пользователь `{user}` имеет ограниченные права `sudo` для его запуска и остановки без пароля.
