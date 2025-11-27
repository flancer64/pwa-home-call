# Отчёт итерации ui-layer-docs

## Резюме изменений
- Зафиксировал новую архитектуру UI как два параллельных слоя `screen/` и `component/`, обновил карты `AGENTS.md` и связал их с компонентами `screen-card`, `big-button`, `screen-header`, `screen-note`.
- Переписал описание экранов (`home`, `invite`, `call`, `end`, `settings`) и общего `screens.md`, `layout.md`, `style.md`, исключив логические и стильные дубли, оставив статусы и переходы только в `notifications.md` и `screens.md`.
- Добавил каталог `component/` с новыми документами, чтобы компоненты оставались визуальными атомами без логики.

## Детали работ
- Привёл `ctx/rules/web/ui/AGENTS.md` и `ctx/rules/web/ui/screens/AGENTS.md` в соответствие с целевой архитектурой и избавился от ссылок на отдельные экраны на уровне UI.
- Создал `ctx/rules/web/ui/component/AGENTS.md` и описал `screen-card`, `big-button`, `screen-header`, `screen-note`, `icon-wrapper`, включая API, слоты и ограничения по логике и атрибутам.
- Обновил `layout.md`, `style.md`, `screens.md` и все файлы в `ctx/rules/web/ui/screens/`, чтобы экраны опирались на компоненты и не описывали собственные стили, переходы или добаляющую логику.

## Результаты
- База документации отражает целевую архитектуру: два слоя (`screens/` и `component/`), компоненты описаны отдельно и не влияют на логику. Все изменения находятся под `ctx/rules/web/ui/` и `ctx/rules/web/ui/component/`.
