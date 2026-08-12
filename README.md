# Void Sector 108 - Realtime Lobby Backend Notes

Void Sector 108 is currently a TypeScript Socket.IO room/lobby prototype. The project has moved from an early single-file socket experiment into a cleaner multiplayer lobby shape: the HTTP server boots the process, Socket.IO owns realtime transport, socket handlers own event registration, and room-state operations now live behind a room manager.

This is the right first layer for a backend game flow: players connect, identify themselves, create or join a room, and receive synchronized room-user state before later systems such as ready checks, loadouts, host migration, and match start are added.

## Current Runtime Shape

```txt
backend/
|-- index.ts                 # Express + HTTP + Socket.IO bootstrap
|-- respvo.ts                # Generic socket response envelope
|-- interfaces.ts            # CustomSocket and future room interfaces
|-- tsconfig.json            # Backend TypeScript compiler settings
|-- socket/
|   |-- s-index.ts           # Socket connection/event registration
|   `-- rooms.ts             # Create/join room orchestration
`-- managers/
    `-- roomManager.ts       # Room set storage, player count, user-list sync

frontend/
|-- index.html               # Lobby UI loaded by the Express static server
|-- app.ts                   # TypeScript Socket.IO client and UI transitions
|-- app.js                   # Browser bundle generated from app.ts
|-- utils.ts                 # Typed DOM helper utilities
`-- css/style.css            # Lobby styling

public/
`-- index.html               # Older standalone Socket.IO test page, not served by backend/index.ts
```

The backend serves `frontend/`:

```ts
const publicPath = path.join(__dirname, "../frontend");
app.use(express.static(publicPath));
```

That means the active browser entrypoint is `frontend/index.html`, not `public/index.html`.

## What Changed Since The Earlier Notes

- The active source is now TypeScript (`.ts`) rather than the older `.js` layout described previously.
- `roomManager.ts` is now wired into room creation, room joining, user-list synchronization, and disconnect handling.
- `roomManager.updateRoomUsers` emits the `room-users` event to every socket in a room.
- `CustomSocket` was added to carry lobby state on each connected socket: `username`, `currentRoom`, `ready`, `host`, and `loadout`.
- `respvo.ts` is now generic, so socket responses can carry typed `data` payloads later.
- The frontend has been converted to TypeScript with typed DOM selectors via `getEl<T>()` and typed element creation via `createEl<T>()`.
- `frontend/app.js` is now required as the browser bundle generated from `frontend/app.ts`.
- `package.json` now includes `dev`, `build`, and `start` scripts.
- The old README claim that no scripts exist is no longer true.

## Scripts

```txt
npm run dev      # Run backend/index.ts with tsx watch
npm run build    # Compile TypeScript
npm run start    # Run dist/backend/index.js after build
```

For frontend TypeScript changes, regenerate the browser bundle:

```txt
npx esbuild frontend/app.ts --bundle --outfile=frontend/app.js --format=iife --platform=browser
```

The browser cannot execute `app.ts` directly. `frontend/index.html` must load `app.js`.

## Socket Contract

Client to server:

```txt
join-setup     { username: string }
create-room    no payload
join-room      roomCode: string
leave-room     no payload, currently stubbed
```

Server to client:

```txt
room-created   resp(true, "room created", { room_code: string })
room-joined    resp(true, "room joined", { room_code: string })
room-users     resp(true, "updated room userslist", { users: string[] })
error-message  resp(false, message, data)
```

Important correction: `room-users` does not send a raw array. It sends the standard response envelope, and the frontend reads the usernames from:

```ts
resp.data.users
```

## Room Lifecycle

1. A browser client connects through Socket.IO.
2. The frontend sends `join-setup` with the chosen username.
3. The server stores that username on the connected `CustomSocket`.
4. The client can emit `create-room`.
5. `rooms.create_room` generates an uppercase short room code.
6. `roomManager.create_room_set` joins the socket to the Socket.IO room and creates the initial room state.
7. The host socket is marked with `currentRoom`, `ready`, `host`, and `loadout`.
8. `roomManager.updateRoomUsers` broadcasts `room-users` to every socket in that room.
9. The server emits `room-created` back to the host.
10. Other clients can emit `join-room` with the room code.
11. `rooms.join_room` normalizes the code, validates that the Socket.IO room exists, and calls `roomManager.add_pyr`.
12. The joining socket gets its room state, the room-user list is refreshed, and the joining client receives `room-joined`.
13. On disconnect, the backend currently refreshes the visible user list for the socket's last known room.

## Active Backend Responsibilities

- `backend/index.ts`
  Boots Express, HTTP, and Socket.IO. It serves the frontend and delegates socket setup to `s-index`.

- `backend/socket/s-index.ts`
  Registers connection-level events: `join-setup`, `create-room`, `join-room`, `leave-room`, and `disconnect`.

- `backend/socket/rooms.ts`
  Coordinates create/join operations and applies per-socket lobby state after successful room operations.

- `backend/managers/roomManager.ts`
  Owns the in-memory `room_sets` map, room joining, player count increments, and `room-users` broadcasts.

- `backend/respvo.ts`
  Provides a consistent response object with `success`, `msg`, and `data`.

## Current Issues To Fix Next

- `leave-room` is registered but not implemented.
- Disconnect refreshes room users but does not decrement `room_sets.players`, remove empty rooms, or migrate host ownership.
- `join-room` returns the original `roomCode` in the response instead of the normalized uppercase `code`.
- Room code generation only retries once on collision. A game lobby should retry in a bounded loop.
- `room_sets` is currently an untyped `Map`; it should become `Map<string, RoomSet>`.
- `RoomSet` exists but is empty. It should describe host id, game mode, player count, and future match setup fields.
- Socket responses are structurally consistent, but event payload types are not yet shared between backend and frontend.
- `CustomSocket` works for backend socket state, but fetched sockets must still be cast when pulled from `io.sockets.sockets`.
- The frontend bundle is generated manually with esbuild. A project script should be added for repeatable frontend builds.
- The frontend currently imports `socket.io-client` into the bundle while also loading the Socket.IO CDN in HTML. Pick one client-loading strategy.

## Recommended Next Backend Steps

1. Define `RoomSet` properly:

```ts
export interface RoomSet {
  host: string;
  game_mode: string;
  players: number;
}
```

2. Type the room map:

```ts
static room_sets = new Map<string, RoomSet>();
```

3. Add shared socket payload types for both backend and frontend:

```txt
shared/socket-contract.ts
```

4. Implement `leave-room` as a real lobby operation:

```txt
leave Socket.IO room
clear socket.currentRoom
decrement player count
delete empty room
migrate host if needed
broadcast room-users
```

5. Add explicit gameplay lobby events:

```txt
player-ready
select-loadout
start-match
host-changed
room-closed
```

6. Add validation for usernames and room codes before mutating room state.

7. Add a frontend build script so `app.ts` and `app.js` do not drift:

```json
"build:frontend": "esbuild frontend/app.ts --bundle --outfile=frontend/app.js --format=iife --platform=browser"
```

## Backend Game Dev Notes

The project is now in a good early lobby architecture phase. The key improvement is that `backend/index.ts` is not doing gameplay work directly. It starts the server, mounts static content, creates Socket.IO, and hands realtime behavior to the socket layer.

The next professional step is to make room state authoritative and typed. A multiplayer backend should not rely only on browser state or loose socket properties once match flow begins. The server should own room membership, host status, readiness, selected loadouts, and match-start eligibility. Socket properties are fine for quick session metadata, but the room manager should become the source of truth for the lobby.

Once `RoomSet`, `leave-room`, host migration, and shared event contracts are in place, this lobby layer will be ready to support actual game-session setup instead of just room discovery.
