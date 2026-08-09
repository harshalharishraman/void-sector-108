const resp=require('../respvo')

class room_actions{
    
    static room_sets=new Map()

    static async create_room_set(io,socket,roomCode){
        try {
            await socket.join(roomCode);

        this.room_sets.set(roomCode,{
            host:socket.id,
            game_mode:'none',
            players:1
        
        })
         return new resp(true,
            `socket:${socket.id} created room set:${roomCode}`,
            null)} 
        
        catch(error){
            throw error
        }
    }

    static async updateRoomUsers(io,roomCode) {

    try {
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
  io.to(roomCode).emit("room-users",
    new resp(true,'updated room userslist',{'users':users}));
   
}
    catch (error) {
        throw error;
    }
     
}

static async add_pyr(io,socket,roomCode){
    try {

        if(this.room_sets.has(roomCode) && !socket.currentRoom){
            const room=this.room_sets.get(roomCode);
            room.players++;
            await socket.join(roomCode);
            return new resp(true,
                `socket:${socket.id} added room set:${roomCode}`,
                null)
            }
       
        return new resp(false,`no such room set found`,null)
        
            }
    
    catch(error){
        throw error
        
    }
}
}

module.exports=room_actions