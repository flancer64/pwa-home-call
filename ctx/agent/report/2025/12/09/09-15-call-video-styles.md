# Отчёт агента

## Резюме изменений
- выделил все правила видеослотов `call-stage` в `web/ui/screen/call.css`, добавив `#main-video`, обобщённое `call-stage video` и `call-local`/`overlay-video` с указанной геометрией и object-fit-инвариантами;
- убрал из других слоёв любые дублирующие свойства и подтвердил, что `style.css` всё ещё импортирует `call.css` как единственный источник конструкций видеопотоков;
- обновил `ctx/docs/composition/client/ui/layout/call.md` и `ctx/docs/composition/client/ui/screens/call.md`, чтобы зафиксировать расположение этих стилей в `web/ui/screen/call.css` и явно описать инварианты absolute/cover для `main-video` и `call-local`.

## Детали работ
1. Перенёс позиционирование `#main-video` и `call-local`/`overlay-video` в `web/ui/screen/call.css`, оставив в этом файле геометрию слоёв и object-fit, а также удалив градиенты, границы и фоны, которые ранее мешали чистой специализации видеослотов; `call-stage video` теперь задаёт только `object-fit: cover`, а `#main-video` — абсолютный слой с `background: #000`.
2. Дополнил документацию layout- и screen-уровней (`layout/call.md`, `screens/call.md`), указывая, что единственный источник стилей видеопотоков — `web/ui/screen/call.css`, и описал invariants: `#main-video` всегда absolute/inset с `object-fit: cover`, а `call-local` накладывает safe-area смещения и контролирует `overlay-video` также с `object-fit: cover`.

## Результаты
- Визуальная логика видеослотов сосредоточена в одном файле, что исключает дублирующие фоновые и позиционные стили в других слоях.
- Документация фиксирует новую привязку стилей `call` к `web/ui/screen/call.css` и декларирует необходимые инварианты.
- Тесты не запускались (изменения касаются только CSS и documentation).
