# Home Screen

**Path:** ./ctx/rules/web/ui/home.md

## Purpose
The home screen collects the user’s name once, assures them the app remembers it, and anchors the single-entry flow in a gentle, Russian-language experience. All guidance and hints on this screen are phrased in Russian so that seniors understand the actions immediately.

## Structure
Following the three-zone layout, `home` renders:
- **Header** – the brand label «ДомоЗвон», the headline «Один тап — и звонок готов.», and the status text that either says «Используется имя: <name>» (when a name is stored) or «Вас пригласили в комнату <room>. Введите имя, чтобы присоединиться» (when the URL carries a `room` parameter).
- **Action** – either the name input form with label «Ваше имя» and the **«Сохранить и позвонить»** button or the saved-state view with the single **«Позвонить»** button plus helper buttons **«Изменить имя»** and **«Очистить кэш»**.
- **Hint** – a short reassuring sentence («Настройки и кэш хранятся локально. Очистите кэш в любой момент, чтобы вернуть приложение к первому запуску.») that keeps the tone calm and confirms local state.

All elemental text on this screen remains in Russian; there are no English labels or help phrases.

## States
1. **Fresh name input** – no saved name exists yet, so the form stays visible with the label «Ваше имя» and the **«Сохранить и позвонить»** button. If the URL contains `room=<uuid>` and the user has not entered a name, the header shows «Вас пригласили в комнату …», making it clear why the form is still present.
2. **Saved name** – once a name is available, the form hides, the saved-name banner reads «Используется имя: <name>», and the action zone exposes **«Позвонить»**, **«Изменить имя»** and **«Очистить кэш»**.
3. **Invite ready** – pressing **«Позвонить»** hands control to the invite screen, keeping `home` aware of the stored name while the user previews the link.

## Actions
- **«Сохранить и позвонить»** validates the field, stores the name with `storage.setMyName()`, shows the banner, and opens `invite`. A success toast («Имя сохранено.») acknowledges the save before the link appears.
- **«Позвонить»** becomes available once a name exists; it generates a UUID, remembers the room, and renders the invite screen instead of dialing immediately.
- **«Изменить имя»** clears the stored name, switches back to the form, and triggers `toast.info('Имя очищено. Введите новое имя, чтобы продолжить.')`.
- **«Очистить кэш»** calls `storage.resetMyData()`, resets the local `pendingRoom` and name, shows `toast.info('Очистка кэша и локального хранилища...')`, invokes `HomeCall_Web_Pwa_CacheCleaner$` to delete CacheStorage, unregister service workers and reload the app, and if cleaning fails displays `toast.error('Не удалось очистить кэш. Обновите страницу вручную.')`.

## Notes
- Guidance text stays declarative and terse to reduce cognitive load; everything the user reads on `home` is Russian, including the headline, hints, banner and helper buttons.
- The screen never emits English strings: toasts, banners and hints are in Russian, while any developer-facing logs remain English inside `log.error`/`console` calls.
