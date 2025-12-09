# Клиентская файловая структура PWA

Путь: `ctx/docs/composition/client/file-structure.md`

## Назначение

Файл фиксирует фактическую организацию клиентского PWA, которая лежит в папке `web/` и непосредственно отражает UI/UX-артефакты, описанные на уровне композиции.

## Основные каталоги

```text
web/
├── app/                  # модули Core, Ui, Media, Net, Rtc, Pwa, Env
├── assets/               # статические ресурсы (иконки, логотипы, шрифты, цветовые схемы)
├── ui/                   # визуальные фрагменты и helper’ы компоновки
│   ├── component/        # компоненты типа `screen-card`, `big-button`, `screen-note`
│   ├── screen/           # фрагменты экранов и overlay внутри `screen-card`
│   └── ui.css            # глобальные переменные темы и сбросы для компонентов
├── index.html            # точка входа, монтирующая корневой контейнер `#app`
├── app.js                # стартовый файл, собирающий DI-контейнер и запускающий `HomeCall_Web_Core_App$`
├── manifest.json         # манифест PWA (название, цвета, scope)
├── service-worker.js     # скрипт кеширования, обновлений и переустановки
└── version.json          # метаданные сборки (номер, дата)
```

## Связь с композицией

- `web/ui/component/` повторяет визуальные атомы, описанные в `ctx/docs/composition/client/ui/components/`.
- `web/ui/screen/` содержит шаблоны экранов, использующие те же зоны, что и документы в `ctx/docs/composition/client/ui/screens/`.
- `app.js` и `web/app/` запускают рантайм-модули, которые вносят данные в описанные состояния `ctx/docs/composition/client/states/`.
