# Feature: Invite

**Path:** ./ctx/product/features/invite.md

## Purpose
The invite feature explains how one tap turns into a shareable URL so that the other participant can join without choosing rooms or typing IDs.

## Participants
- **Initiator** — taps **Call**, sees the invite screen, and shares the link.
- **Recipient** — opens the link, Domozvon reads the `room` parameter, and the call begins automatically.

## Flow
1. The initiator hits the **Call** button on the home screen. The app generates a UUID room, removes the query parameter from the address bar, and renders the invite screen with the link displayed in plain text.
2. The invite screen always exposes a **Copy link** button; a **Share** button is also rendered when the Share API is available, but the visible link ensures the user can still copy it manually if the platform lacks a sharing sheet.
3. The card highlights the reserved room number and includes a **Start call** button; only after this button is pressed does the call screen appear and the WebRTC session begin.
4. The recipient opens the shared URL (`https://<domain>/?room=<uuid>`), Domozvon reads the room and saved name, and the call starts automatically; if the name is missing, the home screen clearly explains that the user needs to enter a name to join.

## Benefits
- Seniors see the link before the call starts, so they can choose how to share it based on their familiarity.
- Share failures fall back gracefully to the copy button and visible link.
- The new invite screen keeps the action area large, uncluttered, and consistent with the `home → invite → call` path.
