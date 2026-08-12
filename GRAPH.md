# Void Sector 108 Graph

Generated from project source notes.

## Module Dependency Graph

```mermaid
flowchart TD
  Browser["frontend/index.html"]
  FrontendApp["frontend/app.ts"]
  FrontendBundle["frontend/app.js"]
  Utils["frontend/utils.ts"]

  BackendIndex["backend/index.ts"]
  SocketIndex["backend/socket/s-index.ts"]
  Rooms["backend/socket/rooms.ts"]
  RoomManager["backend/managers/roomManager.ts"]
  Resp["backend/respvo.ts"]
  Interfaces["backend/interfaces.ts"]

  Browser --> FrontendBundle
  FrontendApp --> FrontendBundle
  FrontendApp --> Utils

  BackendIndex --> SocketIndex
  SocketIndex --> Rooms
  SocketIndex --> RoomManager
  SocketIndex --> Resp
  SocketIndex --> Interfaces
  Rooms --> RoomManager
  Rooms --> Resp
  Rooms --> Interfaces
  RoomManager --> Resp
  RoomManager --> Interfaces
```

## Socket Flow

```mermaid
sequenceDiagram
  participant UI as frontend/app.ts
  participant S as Socket.IO
  participant SI as backend/socket/s-index.ts
  participant R as backend/socket/rooms.ts
  participant RM as backend/managers/roomManager.ts

  UI->>S: join-setup { username }
  S->>SI: join-setup
  SI->>UI: joined-setup username

  UI->>S: create-room
  S->>SI: create-room
  SI->>R: create_room(io, socket)
  R->>RM: create_room_set(...)
  R->>RM: updateRoomUsers(...)
  SI->>UI: room-created

  UI->>S: join-room roomCode
  S->>SI: join-room
  SI->>R: join_room(...)
  R->>RM: add_pyr(...)
  R->>RM: updateRoomUsers(...)
  SI->>UI: room-joined

  UI->>S: leave-room
  S->>SI: leave-room
  SI->>R: leave_room(...)
  R->>RM: pyr_leave(...)
  R->>RM: updateRoomUsers(...)
  SI->>UI: left-room
```

## Source Files

- `backend/index.ts`
- `backend/socket/s-index.ts`
- `backend/socket/rooms.ts`
- `backend/managers/roomManager.ts`
- `backend/respvo.ts`
- `backend/interfaces.ts`
- `frontend/index.html`
- `frontend/app.ts`
- `frontend/utils.ts`
