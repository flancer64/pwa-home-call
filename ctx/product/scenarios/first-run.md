# Scenario: First run

## Purpose
Describes how Domozvon behaves the very first time it runs or after the local data is cleared.

## Participants
- The user opening Domozvon for the first time.

## Preconditions
- The browser has no saved name and no session identifier stored.

## Main flow
1. The home screen renders with large typography and a single name field, explaining that the app remembers the name and will build an invite automatically.
2. The user types their name and taps **Сохранить и позвонить**; the name is stored locally and a short toast «Готово» confirms the save.
3. Domozvon transitions to the invite screen. The newly generated invite link is shown in plain text with **Скопировать ссылку** and **Поделиться** buttons so the user can send it the way they prefer.
4. When the user taps **Начать звонок**, the call screen appears; the first remote stream is awaited while camera and microphone indicators show their status.

## Alternative flows
- A1. The user dismisses the name input; the form stays visible with the same friendly help text until a valid name is entered.
- A2. The share button is unavailable (no Share API) — the manual link is still visible and the **Скопировать ссылку** button copies it to the clipboard.

## Postconditions
- A name is stored for automatic reuse.
- An invite link is ready and visibly shareable.
- The outbound call is ready once the remote party joins.
