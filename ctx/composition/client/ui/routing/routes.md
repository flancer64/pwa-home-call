# Таблица маршрутов UI
Path: `./ctx/composition/client/ui/routing/routes.md`

## Таблица маршрутов

Маршрут:       #/home  
Экран:         home  
Шаблон:        ui/screens/home/home.html  
Контроллер:    HomeCall_Web_Ui_Screen_Home  
Параметры:     отсутствуют, экран получает только обработчики `onStartCall` и `onOpenSettings`.  
Ограничения:   Показывает только стартовую карточку; навигацию возглавляет Flow при переходе в `ready`.

Маршрут:       #/invite  
Экран:         invite  
Шаблон:        ui/screens/invite/invite.html  
Контроллер:    HomeCall_Web_Ui_Screen_Invite  
Параметры:     `shareUrl` (строка) + обработчики `onShareLink`, `onCopyLink`, `onClose`.  
Ограничения:   Используется только в состоянии ожидания (`waiting`), обновляет ссылку и не инициирует звонок.

Маршрут:       #/call/<sessionId>  
Экран:         call  
Шаблон:        ui/screens/call/call.html  
Контроллер:    HomeCall_Web_Ui_Screen_Call  
Параметры:     `sessionId` (опционально, включается в hash), `remoteStream` (MediaStream), `onEnd`, `onOpenSettings`.  
Ограничения:   Не содержит сигналинг; Flow передаёт `remoteStream` и onEnd/event-обработчики, Router лишь рендерит медиа-слой и обновляет видео.

Маршрут:       #/end  
Экран:         end  
Шаблон:        ui/screens/end/end.html  
Контроллер:    HomeCall_Web_Ui_Screen_End  
Параметры:     `connectionMessage` (текст) и `onReturn`.  
Ограничения:   Страница завершения звонка, всегда предлагает возврат на `home`.

Маршрут:       #/not-found  
Экран:         not-found  
Шаблон:        ui/screens/not-found/not-found.html  
Контроллер:    HomeCall_Web_Ui_Screen_NotFound  
Параметры:     `onReturn` (возврат на `home`).  
Ограничения:   Автономный экран, не взаимодействует с Flow и обслуживает любые неизвестные hash-запросы.

## Правила добавления новых маршрутов

1. Имя маршрута соответствует каталогу `#/screen-name`, добавляется в `routes.md`, а шаблон располагается в `web/ui/screens/screen-name/screen-name.html`.  
2. Каждому шаблону соответствует `HomeCall_Web_Ui_Screen_<ScreenName>` в `web/app/Ui/Screen/`; контроллер реализует `mount({ container, params })`, необязательные `unmount/updateRemoteStream` и не содержит бизнес-логики.
3. Router связывает маршрут с шаблоном и контроллером через `HomeCall_Web_Ui_Router`; новую запись добавляют в мапу `routeConfig` и в этот документ одновременно.
4. Параметры маршрутной строки начинают с `#/call/SESSION_ID`: `sessionId` хранится в `router.resolve`, передаётся в `params.sessionId`, и Flow оставляет за собой состояние, а не Router.
5. Любой неизвестный hash переводится на маршрут `not-found`, маршрут всегда работает без участия Flow и служит гарантом предсказуемости UI.
