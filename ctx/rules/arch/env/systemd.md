# Сервис systemd для Node.js-приложения ДомоЗвон (`ctx/rules/arch/env/systemd.md`)

## Назначение

Фиксирует состояние, при котором backend-приложение **ДомоЗвон** автоматически запускается при загрузке Ubuntu и управляется пользователем через `systemd` с ограниченными правами `sudo` без запроса пароля.

---

## 1. Состояние системы

- В системе присутствует юнит-файл `homecall.service`.
- Сервис активирован, запускается при старте системы и перезапускается при сбое.
- Пользователь `{user}` имеет право запускать и останавливать этот сервис без ввода пароля.
- Все логи сервиса записываются в `/home/{user}/store/homecall/log/out.log` и ротируются согласно `logrotate`.

---

## 2. Пример юнит-файла

```ini
[Unit]
Description=ДомоЗвон Backend Service
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

---

## 3. Правила настройки

| Цель                    | Команда или действие                                                                   |
| ----------------------- | -------------------------------------------------------------------------------------- |
| зарегистрировать сервис | `sudo ln -s /home/{user}/system/homecall.service /etc/systemd/system/homecall.service` |
| обновить список юнитов  | `sudo systemctl daemon-reload`                                                         |
| включить автозапуск     | `sudo systemctl enable homecall`                                                       |
| запустить сервис        | `sudo systemctl start homecall`                                                        |
| просмотреть логи        | `journalctl -u homecall`                                                               |
| выполнить перезапуск    | `sudo systemctl restart homecall`                                                      |

Эти команды фиксируют требуемое состояние системы; они приведены для справки и не являются инструкцией.

---

## 4. Настройка прав sudo

Для возможности безопасного управления сервисом пользователем без запроса пароля в файл `/etc/sudoers` добавляются строки (через `visudo`):

```text
{user} ALL=(ALL) NOPASSWD: /bin/systemctl start homecall.service
{user} ALL=(ALL) NOPASSWD: /bin/systemctl stop homecall.service
```

Эта конфигурация разрешает выполнение только указанных команд.
Настройка сохраняется при обновлениях системы и может быть проверена командой:

```bash
sudo -l | grep homecall
```

---

## 5. Связи

- `./node.md` — окружение Node.js
- `./config.md` — переменные `.env`
- `../back.md` — архитектура backend-приложения
- `./logrotate.md` — правила ротации логов

---

## Итог

Документ фиксирует требуемое состояние интеграции backend-приложения ДомоЗвон в систему Ubuntu:
сервис `homecall` присутствует, активирован, управляется через `systemd`, а пользователь `{user}` имеет ограниченные права `sudo` для его запуска и остановки без пароля.
