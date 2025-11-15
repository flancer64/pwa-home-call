# WebSocket signaling in ДомоЗвон (`ctx/rules/arch/back/signal.md`)

## Purpose

The document complements `ctx/rules/arch/back.md` by explaining how the embedded WebSocket channel `/signal` orchestrates SDP/ICE exchange between PWA peers. The implementation abandons rooms in favor of single-use `sessionId` values that keep the signaling path deterministic and stateless.

## 1. Role in the architecture

The signaling endpoint remains part of `HomeCall_Back_App`. It handles `/signal`, accepts JSON over WebSocket, and routes messages between participants who share the same `sessionId`. The server does not persist any user identities; all routing decisions rely on the current session registry.

## 2. Core responsibilities

| Task                   | Description                                                                                               |
| ---------------------- | --------------------------------------------------------------------------------------------------------- |
| Accept connections     | Register every socket via `HomeCall_Back_Service_Signal_SessionManager$` and remember the active `sessionId`. |
| Route signaling        | Deliver `offer`, `answer`, and `candidate` messages to all peers registered for the same session, buffering events until a counterpart arrives. |
| Session cleanup       | Remove sockets on `leave` or disconnect and drop empty sessions from the registry.                         |
| Error handling         | Respond with `{type:"error",message:"..."}` when the client violates the expected schema.              |

## 3. Message formats

| Type         | Direction                 | Fields                                                 | Purpose                                       |
| ------------ | ------------------------- | ------------------------------------------------------ | --------------------------------------------- |
| `join`       | client → server           | `sessionId`                                            | Register socket inside a new or existing session. |
| `leave`      | client → server           | `sessionId`                                            | Explicitly leave a session before closing the socket. |
| `offer`      | client → server → peers   | `sessionId`, `sdp`                                     | Send SDP offer to every peer in the session.  |
| `answer`     | client → server → peers   | `sessionId`, `sdp`                                     | Send SDP answer to every peer in the session. |
| `candidate`  | client ↔ server ↔ peers   | `sessionId`, `candidate`                               | Share ICE candidates inside the session scope. |
| `error`      | server → client            | `message`                                              | Communicate validation or routing problems.   |

When a peer sends an `offer`/`candidate` before anybody else has joined, the server queues the message and delivers it to the first socket that registers for the same `sessionId`. The queue preserves the type and session metadata but never stores names or user IDs.

## 4. Module structure

```text
src/Back/
├── Service/
│   └── Signal/
│       ├── Server.js        # WebSocket server: start/stop lifecycle and JSON routing
│       └── SessionManager.js # Tracks sockets per `sessionId`, exposes peers, and manages registrations
└── App.js                   # Application entry point dialing up the signaling server
```

- `HomeCall_Back_Service_Signal_Server` wires the server into Node.js, validates payloads, invokes the session registry, and manages the pending queue.
- `HomeCall_Back_Service_Signal_SessionManager` keeps a map of active `sessionId`s and the connected sockets for each session, exposing helpers such as `register`, `deregister`, `getPeers`, and `getSessionId`.

## 5. Integration and deployment

- `HomeCall_Back_App.run()` instantiates the session manager, passes it to the signal server, and starts the WebSocket endpoint at `/signal`.
- Clients connect via `wss://<host>/signal`, send `join` with `sessionId`, and remain until the call ends or the socket closes.
- Pending messages survive only for the life of the process; once delivered, the server discards them and only re-queues if another peer disconnects and later reconnects to the same session.
- Sessions stay active while at least one socket claims the `sessionId`; they disappear automatically when every participant disconnects.
- The `WS_PORT`/`WS_HOST` environment variables continue to configure the listening address documented in `ctx/rules/arch/back.md`.

## 6. Security considerations

- The signaling channel relies on `wss://`; the backend never exposes plain-text learnings about participants.
- Routing occurs solely by `sessionId` — no user names or room codes travel over the wire.
- The server does not persist state between restarts, so sessions expire immediately when the process shuts down.
- Messages use JSON/UTF-8 and are validated before forwarding; malformed payloads receive `{type:"error"}` responses and do not crash the process.

## Summary

Signaling stays a minimal part of the backend: `HomeCall_Back_Service_Signal_Server` wires the WebSocket handler and routes offers/answers/candidates based on `sessionId`, and `HomeCall_Back_Service_Signal_SessionManager` keeps track of who belongs to which session. No new entities such as rooms or usernames are introduced, so the entire flow is compatible with the updated single-use session model.
