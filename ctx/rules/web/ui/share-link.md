# Share Link Mechanism

**Path:** ./ctx/rules/web/ui/share-link.md

## Purpose
This document describes how Domozvon turns one tap into a shareable URL and how the UI stays clear even when sharing APIs are missing.

## URL template
- Links always follow `https://<domain>/?room=<uuid>`.
- UUIDs are generated inside the app (either when the user taps **Call** or when the system prepares to share an incoming room).
- The link never includes the name; the recipient’s name comes from `localStorage`.

## Invite screen flow
1. After the home screen creates a room, Domozvon renders the invite screen. The header now says “Ссылка готова. Отправьте её собеседнику.”, and the action zone shows the link text, the **«Скопировать ссылку»** button, the **«Поделиться»** button (only shown when `navigator.share` exists) and the **«Начать звонок»** button.
2. The link text (`#invite-link`) is selectable so that even if nothing is copied automatically, the user can tap it, copy it manually, and paste it into a messenger.
3. When Share is available, the button opens the native share sheet and falls back to the clipboard if the user cancels or the API throws → the invite screen keeps the link visible so the same URL is always reachable.
4. **«Скопировать ссылку»** always tries to write the URL to the clipboard and shows a friendly toast when it succeeds (`toast.success('Ссылка скопирована в буфер обмена.')`) or a warning (`toast.warn('Не удалось скопировать автоматически. Выделите ссылку вручную.')`) when manual copying is needed.

## Recipient flow
- When the recipient opens a shared link, Domozvon reads the `room` parameter and checks for the stored name.
- If a name exists, the app initiates the call immediately (no extra buttons) and jumps to the call screen.
- If no name exists, the home screen stays visible with the incoming-room message and the name form so the recipient understands what to do.

## Status feedback
- Any issues with sharing (Share API failure, clipboard rejection) show toasts that say “Ссылка отправлена.”, “Ссылка скопирована в буфер обмена.”, or “Не удалось скопировать автоматически. Выделите ссылку вручную.”, keeping the UI consistent.
- The invite screen itself never shows warnings; it only contains the link and big buttons.
