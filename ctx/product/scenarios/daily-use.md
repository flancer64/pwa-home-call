# Scenario: Daily use

## Purpose
Describes the smooth, every-day experience for a senior who already saved their name in Domozvon.

## Participants
- The senior user.
- Family members or carers who join the call via the generated link.

## Preconditions
- The user already stored their name in the browser.

## Main flow
1. When the app opens, the home screen shows the saved name, a clear **Позвонить** button, and two helper actions: **Изменить имя** (which clears the stored name but keeps other data) and **Сбросить настройки** (which clears everything). The layout uses the new three-zone flow, so the action area stays large and spaced apart.
2. If the app is launched with a `session=<uuid>` parameter and no name, the home screen displays the message «Вас пригласили в сеанс связи <uuid>. Введите имя, чтобы подключиться» прямо в заголовке, пока форма остаётся видимой, чтобы пользователь понимал, зачем он на этом шаге.
3. When the user taps **Позвонить**, Domozvon переходит на экран приглашения. Большая копируемая ссылка, кнопки **Скопировать ссылку** и **Поделиться**, а также сообщение «Ссылка готова. Отправьте её собеседнику» делают понятным, как пригласить собеседника, даже если Share API недоступен.
4. Кнопка **Начать звонок** на экране приглашения запускает WebRTC-сеанс; во время разговора накладывается оверлей с индикаторами камеры и микрофона и кнопкой **Повторить**, если доступ был заблокирован.
5. Если пользователь открывает приложение по чужой ссылке и его имя сохранено, приложение автоматически подключается к сеансу без дополнительных нажатий; экран звонка по-прежнему показывает индикаторы, чтобы любые ошибки были заметны.

## Alternative flows
- A1. The user taps **Изменить имя** and the name field reappears; they enter a new name and continue.
- A2. The user taps **Сбросить настройки**, which clears the stored name and session and displays a toast that settings were cleared, letting them start fresh.

## Postconditions
- The link for the next call is always visible before the actual media session starts.
- Media statuses stay visible via the new icons, and errors are surfaced even when no toast is shown.
