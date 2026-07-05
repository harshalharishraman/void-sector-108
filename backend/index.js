const path = require("path");
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const router = require("./view/router");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const app = express();
const port = process.env.PORT || 4000;
const publicPath = path.join(__dirname, "../frontend");

const httpServer = http.createServer(app);
const io = new Server(httpServer);

app.use(express.static(publicPath));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

io.on("connection", (socket) => {
  // Track user data locally on the socket instance
  socket.on("join-setup", ({ username }) => {
    socket.username = username;
  });

  // 1. CREATE ROOM
  socket.on("create-room", () => {
    // Generate a random 5-character room code
    const roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();

    socket.join(roomCode);
    socket.currentRoom = roomCode;

    // Send the code back to the creator
    socket.emit("room-created", roomCode);

    // Send updated user list for this room
    updateRoomUsers(io, roomCode);
  });

  // 2. JOIN EXISTING ROOM
  socket.on("join-room", (roomCode) => {
    const code = roomCode.toUpperCase().trim();
    const roomExists = io.sockets.adapter.rooms.has(code);

    if (roomExists) {
      socket.join(code);
      socket.currentRoom = code;

      socket.emit("room-joined", code);

      // Notify everyone in the room to refresh their user list
      updateRoomUsers(io, code);
    } else {
      socket.emit("error-message", "Room code does not exist!");
    }
  });

  // 3. HANDLE DISCONNECTS & CLEANUP
  socket.on("disconnect", () => {
    if (socket.currentRoom) {
      updateRoomUsers(io, socket.currentRoom);
    }
    console.log(`socket disconnected: ${socket.id}`);
  });

  // Helper function to fetch usernames of everyone in a room
  function updateRoomUsers(io, roomCode) {
    const clients = io.sockets.adapter.rooms.get(roomCode);
    const users = [];

    if (clients) {
      for (const clientId of clients) {
        const clientSocket = io.sockets.sockets.get(clientId);
        if (clientSocket && clientSocket.username) {
          users.push(clientSocket.username);
        }
      }
    }
    // Broadcast the list to everyone in that specific room
    io.to(roomCode).emit("room-users", users);
  }
});

httpServer.listen(port, () => {
  console.log(`server started and listening at port: ${port}`);
});
