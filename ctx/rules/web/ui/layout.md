# Domozvon: Layout and large UI rhythm

## Purpose
This document captures the new high-contrast, senior-friendly layout that runs through every screen of Domozvon (`home`, `invite`, `call`, `end`). The goal is to keep the interface readable, the actions obvious, and the spacing generous so the user can focus on a single CTA at a time.

## Structure
Each screen now follows the same three-zone rhythm: **header** (brand, status or guidance), **action** (large input/buttons), and **hint** (extra reassurance or instructions). This keeps the layout consistent whether we render the home screen, the invite page with a copyable link, the call player with status badges, or the final summary card.

All labels, helper lines, and toast messages on these screens are Russian phrases, while logging stays in English so developers can parse the trace output without translating the UI copy.

### Header zone
- Contains the screen title, a short description, and any contextual message (for example the incoming-room text “Вас пригласили в комнату…” on `home` or “Ссылка готова. Отправьте её собеседнику.” on `invite`).
- Text is bold, left-to-center-aligned, and sized at least `2rem` so elder eyes can read it without squinting.

### Action zone
- Hosts the interactive controls (`home` form, `invite` link actions, `call` controls, `end` return) in a vertically stacked column with 1.25–1.5rem gaps.
- Buttons and inputs use the shared `ui-large` utility to guarantee a 56px+ tap target, a consistent border radius, and a strong accent color.
- Primary actions (**«Сохранить и позвонить»**, **«Позвонить»**, **«Скопировать ссылку»**, **«Начать звонок»**, **«Завершить звонок»**) use the accent background; secondary actions (**«Изменить имя»**, **«Очистить кэш»**, **«Повторить»**) stay light with a border, keeping the Cyrillic labels bold and legible.

### Hint zone
- Provides helper text or reassurance: “Мы запоминаем имя и храним его локально”, “Нажмите на ссылку, чтобы выделить её и вставить в мессенджер”, “Нажмите снова, чтобы начать новый звонок”.
- Hints have muted color and a smaller font, but remain visible thanks to the generous spacing above them.

## `ui-large` utility
- Applies to every button, input, and interactive display that needs emphasis.
- Sets font-size to 1.25rem+, padding of at least 1rem, and a 1rem border radius.
- Keeps interactions consistent across screens so seniors always know where to tap.

-## Call overlay and status badges
- The `call` screen now shows what the `MediaManager` reports: two large indicators for camera and microphone, a textual status line with Russian labels (Готово, Приостановлено, Заблокировано и т.п.), and a **«Повторить»** button when permissions were blocked.
- These indicators draw from the new `mediaState` tracking and change border colors (`green` for ready, `orange` for paused, `pink` for blocked) so that the user sees the health of each device without needing to read a toast.

-## Invite screen note
- The invite screen repeats the same three-zone layout but focuses the action zone on the link display, **«Скопировать ссылку»**, **«Поделиться»**, and **«Начать звонок»**.
- Even if the Share API is absent, the large link block and the copy button keep the interaction predictable.

## Spacing and contrast
- All screens apply a minimum 2rem of padding and 1.5rem between high-level regions.
- Backgrounds stay light with dark text; `primary` buttons use a deep blue accent with white text, while hints and secondary buttons stay soft to avoid overwhelming the user.
- The layout stays centered, with the card never exceeding 640px so the text never stretches too wide.
