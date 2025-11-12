# Enter Screen

**Путь**: ./rules/web/ui/screens/enter.md

## Назначение

Экран `enter` задаёт первую точку взаимодействия пользователя с ДомоЗвон: он погружает в контекст подключения, объясняет назначение устройств и готовит все зависимости для перехода в комнату.

## Основные этапы взаимодействия

1. `HomeCall_Web_Core_App` очищает предыдущую комнату, грузит `userName` и `roomName` из `HomeCall_Web_Infra_Storage` и дополняет их `room`/`name` из URL (сценарий совместного подключения `ctx/product/scenarios/share-and-join.md`). Загрузившиеся значения попадают в форму и через `HomeCall_Web_Ui_Toast` уведомляют пользователя, что сохранённые данные готовы к подтверждению или редактированию.
2. `HomeCall_Web_Ui_Screen_Enter` применяет шаблон `enter`, связывает блок статуса с `HomeCall_Web_Media_Manager`, предоставляет кнопку «Подготовить камеру»/«Проверить устройства» и запускает `media.prepare()` по клику — любые проблемы с доступом отображаются как текстовый статус и дублируются в `toast`.
3. При сабмите форма валидирует поля; если имя или комната пусты, `HomeCall_Web_Ui_Toast` показывает ошибку. При заполнении запускается `HomeCall_Web_Net_SignalClient.connect`, затем `signal.join`, а `HomeCall_Web_Infra_Storage.setUserData` сохраняет выбор (успех/ошибка транслируются в `toast` и `storage:saved`/`storage:failed` через `HomeCall_Web_Shared_EventBus`).
4. После удачного подключения экран сообщает `HomeCall_Web_Core_App` через коллбэк `onEnter`, `HomeCall_Web_Ui_Toast` отображает «Подключение установлено», и переход идёт в `lobby`.
5. При сбоях сигнализации или сохранения пользователь остаётся на экране с текстовыми подсказками и видимым сообщением об ошибке.

## Особенности и уведомления

- `HomeCall_Web_Media_Manager` держит локальный статус камеры/микрофона, обновляет индикатор `#media-status`, прячет или показывает retry-кнопку и сообщает об состояниях через `media:state` и `media:status`.
- `HomeCall_Web_Ui_Toast` служит основным каналом для сообщений: загрузка сохранённых данных, отказ доступа, сбой соединения, успешное сохранение (`Data saved`) и любые сообщения от Core о том, что `room`/`name` были дозаполнены по ссылке.
- `HomeCall_Web_Net_SignalClient` отвечает за `connect`/`join`, `HomeCall_Web_Infra_Storage` — за упаковку `userName`/`roomName` в `localStorage`, `HomeCall_Web_Shared_EventBus` рассылает события о сохранении, а `HomeCall_Web_Core_App` фиксирует текущее состояние и обновляет toolbar.

## Связи

- `ctx/rules/web/ui/screens.md` — родительский документ, фиксирующий сценарную последовательность.
- `ctx/product/scenarios/share-and-join.md` — описывает поток URL-параметров `room`/`name`, который активирует часть логики этого экрана.
