
// Helper function to fetch usernames of everyone in a room
const resp=require('../respvo')
const rooms=require('./rooms')
const rm=require('../managers/roomManager')
import {Server,Socket} from 'socket.io'
import type {CustomSocket} from '../interfaces'

class s_index{

  static async s_init(io:Server) {
    
  io.on("connection", (socket:CustomSocket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("join-setup", ({ username }) => {
      socket.username = username;
    });

    // Create Room
    socket.on("create-room", async () => {
    try{
      const from_rs=await rooms.create_room(io,socket)

      if(!from_rs.success){
        return socket.emit('error-message', from_rs)
      }
      socket.emit('room-created',from_rs )
    }
      catch(error:any){
        socket.emit("error-message","backend error");
        console.error(error);
      }
    });

    // Join Room
    socket.on("join-room", async (roomCode:string) => {
    try{
      const from_rs=await rooms.join_room(io,socket,roomCode);

      if(!from_rs.success){
        return socket.emit('error-message', from_rs)
      }

      socket.emit('room-joined',from_rs)

    }
    
    catch(error:any){
    socket.emit("error-message",new resp(false,"backed error",{"error":error}));
    console.error(error);
}});

socket.on('leave-room',async ()=>{
  try {
    const room_code=socket.currentRoom;

    if(room_code){
      
    }
  }
  
  catch (error:any){
    
  }
})

    // Disconnect
    socket.on("disconnect", async () => {
      if (socket.currentRoom) {
        await rm.updateRoomUsers(io, socket.currentRoom);
      }
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
}
module.exports = s_index
