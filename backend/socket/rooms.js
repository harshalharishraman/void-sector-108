const resp=require('../respvo');

function updateRoomUsers(io,roomCode) {
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

class rooms{
    static async updateRoomUsers(io,roomCode){
      updateRoomUsers(io,roomCode);
    }

    static async create_room(io,socket){
        
    try{
      let rCode = await Math.random().toString(36).substring(2, 7).toUpperCase();
      
      if(io.sockets.adapter.rooms.has(rCode)){
        rCode=await Math.random().toString(36).substring(2, 7).toUpperCase();

      }
      
      const roomCode=rCode;
      
      await socket.join(roomCode);

      socket.currentRoom=roomCode;
      socket.ready=false;
      socket.host=true;
      socket.loadout={}

      await updateRoomUsers(io, roomCode);

      return new resp(true,'room created',{'room_code':roomCode})
    }
      catch(error){
        throw error
      }
    }
}

module.exports=rooms
