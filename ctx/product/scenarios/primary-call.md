# Scenario: Outgoing call (initiator)

## Purpose
Explains how the initiator creates a session, shares the invite link, and launches the call with a single tap.

## Participants
- The initiator (the person starting the call).

## Preconditions
- A name is stored locally.

## Main flow
1. The initiator taps the large **Позвонить** button on the home screen. The saved name stays visible and helper buttons for changing the name or resetting the settings remain reachable.
2. Domozvon generates a fresh UUID-сеанса, clears the URL from query parameters, and displays the invite screen. The link `https://<домен>/?session=<uuid>` is shown in plain text; the **Скопировать ссылку** button writes it to the clipboard, and the **Поделиться** button (if supported) opens the native share sheet.
3. The invite screen also states which подготовленный сеанс (prepared session) ожидает, keeps the controls large enough for senior hands, and shows a **Начать звонок** button; when the initiator is ready, tapping it enters the call screen.
4. The call screen shows the remote video, a mini local preview, and newly added camera/microphone indicators plus a **Повторить** button in case a permission was blocked.

## Alternative flows
- A1. The Share API is missing; the invite screen still exposes the link so the initiator can paste it into their favorite communication channel.

## Postconditions
- The invite link is live and can be shared however the user prefers.
- The actual WebRTC session starts only after the **Начать звонок** button is pressed, so the user always sees the sharing controls first for clarity.
