# Состояние «Ссылка для соединения»

Путь: `ctx/composition/client/states/share-link.md`

## Назначение

Фиксирует состояние `waiting`, в котором пользователь взаимодействует с URL-приглашением, но skeleton остаётся прежним, а layout определяется через overlay шаринга.

## Структура

- Наложение описано в `ctx/composition/client/ui/layout/overlays/share-link.md` и располагается поверх базового `screen-card` без перестроения зон.
- Два `big-button` управляют шарингом и копированием, каждый показывает иконку через `icon-wrapper` и остаётся в едином CTA-стиле без дополнительных тонов; `screen-note` поясняет стратегию распространения ссылки.
- `share-link` остаётся видимой до завершения сеанса, ее адрес фиксирован на один `sessionId`.

## Связи

- `ctx/composition/client/ui/layout/overlays/share-link.md` — layout-описание overlay`а.
- `ctx/composition/client/ui/patterns/toast-layer.md` — подтверждения и ошибки по шарингу всегда через тосты.
