# big-button-docs

## Резюме изменений
- Переписал `web/ui/component/big-button` и его стили, чтобы компонент соответствовал одному CTA-контракту с иконкой, текстом и единственным `action`-событием.
- Обновил документацию в `ctx/composition` (screens, layouts, states и style) для описания новой модели `big-button` без параметров `tone`, `disabled` или `meta`.
- Поднял `web/version.json` согласно правилу о версионировании `web/` после локальных правок.

## Детали работ
- `big-button.js` теперь монтирует только шаблон с glyph/label, добавляет дефолтную SVG-иконку и выдаёт одно `CustomEvent('action')` при клике; `big-button.css` содержит только CTA-специфику.
- Документы `ctx/composition/client/ui/screens/{home,settings,not-found}.md`, `layout/overlays/share-link.md`, `states/share-link.md` и `components/style.md` больше не упоминают устаревший атрибут `tone`, уточняют один CTA-стиль и связывают его с актуальной темой.
- Провёл проверку `ctx/composition` на наличие старых `tone`-референций для `big-button` и убедился, что остался только один META-запись, описывающая отсутствие `tone`.

## Результаты
- Контекст и реализация согласованы: документация `ctx/composition` отражает то, что делает компонент, и больше не описывает несуществующие API-параметры.
- Сервисный слой обновлён (новая дата в `web/version.json`), а компоненты готовы к повторной сборке с тем же `ui/` API.
