# 18-56 UI screens update

## Цель итерации
Разделить устаревший `ctx/rules/web/ui/screens.md` на высокоуровневый обзор и четыре специализированных документа, зафиксировать связи с URL-параметрами/`localStorage`, описать уведомления и проверки каждого экрана и оценить итоговую документацию по критериям ADSM.

## Действия
- Переписал `ctx/rules/web/ui/screens.md`, оставив в нём только назначение уровня, последовательность состояний, стартовую инициализацию (`localStorage` + `?room`/`?name`), схему переходов и связи с `app.md`, `ui/contours.md` и страницей о share-функции.
- Создал каталог `ctx/rules/web/ui/screens/` и описал экраны `enter`, `lobby`, `call` и `end`, включая взаимодействия с менеджерами (`Media`, `Rtc`, `Signal`, `Core`), `HomeCall_Web_Ui_Toast` и ссылку на share-сценарий.
- Проверил документы по 7 критериям качества ADSM (см. ниже).

## Качество документации (семь критериев ADSM)
- `ctx/rules/web/ui/screens.md`: Declarative ✅, Complete ✅, Consistent ✅, Connected ✅, Dense ✅, Compact ✅, Non-redundant ✅.
- `ctx/rules/web/ui/screens/enter.md`: Declarative ✅, Complete ✅, Consistent ✅, Connected ✅, Dense ✅, Compact ✅, Non-redundant ✅.
- `ctx/rules/web/ui/screens/lobby.md`: Declarative ✅, Complete ✅, Consistent ✅, Connected ✅, Dense ✅, Compact ✅, Non-redundant ✅.
- `ctx/rules/web/ui/screens/call.md`: Declarative ✅, Complete ✅, Consistent ✅, Connected ✅, Dense ✅, Compact ✅, Non-redundant ✅.
- `ctx/rules/web/ui/screens/end.md`: Declarative ✅, Complete ✅, Consistent ✅, Connected ✅, Dense ✅, Compact ✅, Non-redundant ✅.

## Тесты
- `npm run test:unit` *(fails: Node could not load `test/unit` because the directory/file is missing; the suite aborts immediately with `MODULE_NOT_FOUND`.)*
