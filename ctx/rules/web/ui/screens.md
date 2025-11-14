# Domozvon screen contour

**Path:** ./ctx/rules/web/ui/screens.md

The app now follows a consistent `home → invite → call → end` flow with only one highlighted action per screen. All transitions rely on the DI-controlled UI controller; there is no routing or toolbar.

## Purpose
The contour ensures that every screen keeps the same typography, spacing, and focus on large CTA elements while also exposing the new invite step and richer media indicators.

## States
1. **home** – collects or reuses the user name, shows the incoming-room message when necessary, and offers quick helpers to reset or change the name. When a name is stored, the action zone consists of the **«Позвонить»** button, a saved-name banner «Используется имя: <name>», **«Изменить имя»**, and **«Сбросить настройки»**. Without a name, the form stays visible with helper text centred and emphasises the need to enter a name before proceeding.
2. **invite** – introduced after **«Позвонить»** is pressed. It displays the generated link, the **«Скопировать ссылку»** button, an optional **«Поделиться»** button (visible when the Share API exists), and the **«Начать звонок»** button. The screen keeps the three-zone layout so the user still sees the Russian headline, the action buttons, and a hint about sharing.
3. **call** – shows the remote stream, a small local preview, the new camera/microphone status indicators, and the **«Завершить звонок»** CTA. A **«Повторить»** button appears inside the overlay whenever the camera permission is blocked, prompting the user to re-request access.
4. **end** – repeats the headline «Звонок завершён», shows a concise summary message, and offers a wide **«Вернуться на главную»** button.

## Transitions
- `home → invite`: triggered by **«Позвонить»** once the user has a saved name; the URL bar is cleared and the new invite screen appears with the shareable link.
- `invite → call`: triggered by **«Начать звонок»**, which begins media preparation and WebRTC setup.
- `call → end`: triggered by any call termination (manual via **«Завершить звонок»** or network failure); all media streams stop and the overlay disappears.
- `end → home`: automatically done after clicking **«Вернуться на главную»**; the saved name persists so the flow can restart immediately.

## Feedback
- Errors about media, signaling, or sharing appear as toast notifications; the screens remain clean with only the relevant CTA.
- The `call` overlay reflects the `MediaManager` status so the user sees whether the camera or microphone is **Готово**, **Приостановлено**, **Заблокировано** или **Не поддерживается**.
