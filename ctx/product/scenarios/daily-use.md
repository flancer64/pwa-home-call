# Scenario: Daily use

## Purpose
Describes the smooth, every-day experience for a senior who already saved their name in Domozvon.

## Participants
- The senior user.
- Family members or carers who join the call via the generated link.

## Preconditions
- The user already stored their name in the browser.

## Main flow
1. When the app opens, the home screen shows the saved name, a clear **Call** button, and two helper actions: **Change name** (which clears the stored name but keeps other data) and **Reset settings** (which clears everything). The layout uses the new three-zone flow, so the action area stays large and spaced apart.
2. If the app is launched with a `room=<uuid>` parameter and no name, the home screen displays the message “You are invited to room <uuid>. Enter your name to join” right in the header area while the form remains visible so the user understands why they are still on the name step.
3. When the user taps **Call**, Domozvon switches to the invite screen. A large copyable link, **Copy link** and **Share** buttons, and the message “Link ready. Send it to your contact” make it obvious how to invite someone, even if Share API is unavailable.
4. The **Start call** button on the invite screen begins the WebRTC session; during the call, the overlay with camera and microphone indicators keeps the user informed and offers a **Retry** button if an access permission was blocked.
5. If the user opens the app via someone else’s link and their name is saved, the app automatically connects to the room without extra taps; the call screen still shows the media-state overlay so any errors are visible.

## Alternative flows
- A1. The user taps **Change name** and the name field reappears; they enter a new name and continue.
- A2. The user taps **Reset settings**, which clears the stored name and room and displays a toast that settings were cleared, letting them start fresh.

## Postconditions
- The link for the next call is always visible before the actual media session starts.
- Media statuses stay visible via the new icons, and errors are surfaced even when no toast is shown.
