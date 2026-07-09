# Void Sector 108 - Realtime Room Backend Notes

This project has been refactored from a single socket/router experiment into a small realtime room service. The current backend shape is closer to what we would use as the first pass of a multiplayer lobby layer: the HTTP server owns process startup, Socket.IO owns transport/session events, and room-specific behavior has been pushed into dedicated socket and room modules.

## Current Runtime Shape

```txt
backend/
|-- index.js                 # Express + HTTP + Socket.IO bootstrap
|-- respvo.js                # Shared response envelope for socket replies
|-- socket/
|   |-- s-index.js           # Socket connection/event registration
|   `-- rooms.js             # Room creation, joining support, user sync
`-- managers/
    `-- roomManager.js       # Early room-state manager draft, not wired yet

frontend/
|-- index.html               # Minimal lobby/client test surface
|-- app.js                   # Socket.IO client events and UI transitions
`-- css/style.css
```

## What Changed

- The backend entrypoint now serves `frontend/` as static content instead of the earlier `public/` test page.
- Socket initialization was moved out of `backend/index.js` into `backend/socket/s-index.js`.
- Room operations were moved into `backend/socket/rooms.js`.
- A response wrapper was added in `backend/respvo.js` so socket responses have a consistent shape: `sucess`, `msg`, and `data`.
- The frontend now has a basic lobby flow: set username, create room, join room, view room code, and receive the active room user list.
- The older experimental files `backend/socketHandler.js` and `backend/view/router.js` have been removed from the active design.

## Socket Contract

Client to server:

```txt
join-setup     { username }
create-room    no payload
join-room      roomCode
```

Server to client:

```txt
room-created   resp(true, "room created", { room_code })
room-joined    resp(true, "room joined", { room_code })
room-users     [username, username, ...]
error-message  resp(false, message, data)
```

## Room Lifecycle

1. A client connects through Socket.IO.
2. The client sends `join-setup` with a username.
3. The client can create a room.
4. The server generates a short uppercase room code and joins the socket to that Socket.IO room.
5. The host socket is marked with `currentRoom`, `ready`, `host`, and `loadout`.
6. The server emits `room-created` back to the host.
7. The server broadcasts `room-users` to everyone in the room.
8. Other clients can send `join-room` with the code.
9. If the room exists, the joining socket is added to the room and the user list is refreshed.

This is the right direction for a game lobby backend: connection state stays on the socket, room membership stays in Socket.IO, and gameplay-facing modules can later consume a cleaner room/session model.

## Current Issues To Fix Next

- `respvo.js` uses the property name `sucess`; this should become `success` before more code depends on the typo.
- `join-room` returns the original `roomCode` instead of the normalized uppercase `code`, so the UI may display lowercase input even though the server room is uppercase.
- `rooms.create_room` only retries once on room-code collision. A production lobby should loop until a free code is found or fail after a small retry budget.
- `roomManager.js` is not currently wired into the socket flow.
- `roomManager.js` references `room_sets` directly inside a static method, but the static field is declared as `room_actions.room_sets`. As written, that method would throw if called.
- Disconnect handling refreshes room users but does not remove or migrate host ownership. For a game lobby, host migration or room teardown needs to be explicit.
- The frontend uses the Socket.IO CDN. Since the backend already serves Socket.IO at `/socket.io/socket.io.js`, using the local served client would keep local testing independent of network access.
- There is no `start` or `dev` script in `package.json`, so running the project still depends on remembering the direct Node command.

## Recommended Next Backend Steps

1. Rename `respvo.js` to something like `response.js` and fix `sucess` to `success`.
2. Move long-lived room state into `backend/managers/roomManager.js` and make `rooms.js` call that manager instead of storing all state on sockets.
3. Add explicit events for `leave-room`, `player-ready`, `select-loadout`, and `start-match`.
4. Add server-side validation for username and room code payloads.
5. Add a dev script so the backend starts consistently from the project root.

The important architectural improvement is already in place: `index.js` is no longer doing game-room work directly. It starts the server, hands `io` to the socket layer, and lets dedicated modules own room behavior. That separation is exactly what we want before the lobby grows into match setup, readiness checks, matchmaking, or authoritative game-state handling.
