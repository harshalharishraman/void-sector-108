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
  io.to(roomCode).emit("room-users", users);
}

// Export the socket event architecture
module.exports = function (io) {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("join-setup", ({ username }) => {
      socket.username = username;
    });

    // Create Room
    socket.on("create-room", () => {
      const roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
      socket.join(roomCode);
      socket.currentRoom = roomCode;

      socket.emit("room-created", roomCode);
      updateRoomUsers(io, roomCode);
    });

    // Join Room
    socket.on("join-room", (roomCode) => {
      const code = roomCode.toUpperCase().trim();
      const roomExists = io.sockets.adapter.rooms.has(code);

      if (roomExists) {
        socket.join(code);
        socket.currentRoom = code;

        socket.emit("room-joined", code);
        updateRoomUsers(io, code);
      } else {
        socket.emit("error-message", "Room code does not exist!");
      }
    });

    // Disconnect
    socket.on("disconnect", () => {
      if (socket.currentRoom) {
        updateRoomUsers(io, socket.currentRoom);
      }
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
