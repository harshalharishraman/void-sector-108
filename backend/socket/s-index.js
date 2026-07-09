// Helper function to fetch usernames of everyone in a room
const resp=require('../respvo')
const rooms=require('./rooms')
class s_index{

  static async s_init(io) {
    
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("join-setup", ({ username }) => {
      socket.username = username;
    });

    // Create Room
    socket.on("create-room", async () => {
    try{
      const room=await rooms.create_room(io,socket)

      if(room.sucess==true){
        socket.emit("room-created",room);
      }
    }
      catch(error){
        socket.emit("error-message","backend error");
        console.error(error);
      }
    });

    // Join Room
    socket.on("join-room", async (roomCode) => {
    try{
      const code = roomCode.toUpperCase().trim();
      const roomExists = await io.sockets.adapter.rooms.has(code);

      if (roomExists) {

        await socket.join(code);

        socket.currentRoom = code;
        socket.ready=false;
        socket.host=false
        socket.loadout={}

        socket.emit("room-joined", new resp(true,"room joined",{"room_code":roomCode}));
        await rooms.updateRoomUsers(io, code);
      } else {
        socket.emit("error-message",new resp(false,"no such room",null));
      }
  }
catch(error){
    socket.emit("error-message",new resp(false,"backed error",{"error":error}));
    console.error(error);
}});

    // Disconnect
    socket.on("disconnect", async () => {
      if (socket.currentRoom) {
        await rooms.updateRoomUsers(io, socket.currentRoom);
      }
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
}
// Export the socket event architecture
module.exports = s_index
