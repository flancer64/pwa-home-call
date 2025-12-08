## Резюме изменений
- Привёл шаблоны всех экранов `web/ui/screen` к API нового `<big-button>`, убрав `tone`, `meta` и `icon-wrapper` вставки.
- Добавил атрибуты `icon="..."` там, где требовалось особое изображение, а для `home-call` полагаюсь на дефолтный `circle-check.svg`.
- В `settings.html` вынес состояние `settings-remote-logging-state` из кнопки, сохранил aria-live и обновил локальные стили для выравнивания.

## Детали работ
- `web/ui/screen/home.html`, `end.html`, `not-found.html` теперь рендерят `<big-button>` с минимальным набором атрибутов (`label` + `icon` при необходимости).
- `web/ui/screen/settings.html` перестроил секцию действий: добавил ряд `.settings-remote-logging-row`, убрал `slot="meta"`, выставил `icon="rss"`/`icon="refresh-ccw"` и добавил CSS для нового расположения состояния.
- Проверил текущие e2e-references (по `rg`) — больше нет `tone`/`meta` в `big-button`, и обработчик состояния всё ещё находит `.settings-remote-logging-state`.

## Результаты
- `npm run test:unit`
