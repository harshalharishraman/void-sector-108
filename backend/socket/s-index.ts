
// Helper function to fetch usernames of everyone in a room
const resp=require('../respvo')
const rooms=require('./rooms')
const rm=require('../managers/roomManager')
const pm=require('../managers/playerManager');
import {Server,Socket} from 'socket.io'
import type {CustomSocket, InputPacket, PlayerInput} from '../interfaces'

class s_index{

  static async s_init(io:Server){
    
  io.on("connection",(socket:CustomSocket) =>{
    console.log(`Socket connected: ${socket.id}`);

    socket.on("join-setup", async ({ username }) => {
      const from_pm=await pm.check_userName(io,socket,username)

      if(from_pm.success){
        return socket.emit('error-message', from_pm);
      }
      socket.username = username;

      socket.emit('joined-setup',{username});

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
    socket.emit("error-message",
      new resp(false,"backed error",{"error":error}));
    console.error(error);
}});

socket.on('leave-room',async ()=>{
  try {
    const room_code=socket.currentRoom;

    if(!room_code){
      return socket.emit('error-message', 'cant find room_code');
    }

    const from_rs=await rooms.leave_room(io,socket,room_code);

    if(!from_rs.success){
        return socket.emit('error-message', from_rs)
      }

    socket.emit('left-room',from_rs)

  }
  
  catch (error:any){
    socket.emit("error-message",new resp(false,"backed error",{"error":error}));
    console.error(error);
  }
});


socket.on('player-input',async (input:InputPacket)=>{
  try {
    if (!socket.currentRoom){
      return socket.emit("error-message",
      'player is not in a room');
                }

    if (!socket.username){
      return socket.emit("error-message",
        'username not set',);
                }
    
    pm.updateplayerInput(io,socket,input);
  }
  
  catch(error:any) {
    
    socket.emit("error-message",
      new resp(false,
        "backed error",
        {"error":error}));

    console.error(error);
  }
});

socket.on('change-ready-status', async ()=>{

  try {
    if (!socket.currentRoom){
      return socket.emit("error-message",
      'player is not in a room');
                }

    if (!socket.username){
      return socket.emit("error-message",
        'username not set',);
                }

    const from_rm=await rm.change_player_status(io,socket);

    if(!from_rm.success){
        return socket.emit('error-message', from_rm)
      }

    io.to(socket.currentRoom).emit('changed-ready-status',from_rm)
      
    
  }

  catch (error:unknown) {

    socket.emit("error-message",
      new resp(false,
        "backed error",
        {"error":error}));

    console.error(error);
  }
});

socket.on('kick-out-player',async(kick_out_uname:string)=>{
  try {
    if (!socket.currentRoom){
      return socket.emit("error-message",
      'player is not in a room');
                }

    if (!socket.username){
      return socket.emit("error-message",
        'username not set',);
                }
    
    const from_rm=await rm.to_kick_player(io,socket,kick_out_uname);

    if(!from_rm.success){
        return socket.emit('error-message', from_rm)
      }

    io.to(socket.currentRoom).emit('kicked-out-player',from_rm)
  }
  
  catch(error:unknown) {
    socket.emit("error-message",
      new resp(false,
        "backed error",
        {"error":error}));

    console.error(error);
  }
});

    // Disconnect
    socket.on("disconnect", async () => {
  try {
    const roomCode = socket.currentRoom;
    const user=socket.username;

    if(user){
      await pm.del_userName(io,socket,socket.username);
    }
    if (roomCode) {
      await rm.pyr_leave(io, socket,roomCode);
      await rm.updateRoomUsers(io, roomCode);
    }

    console.log(`Socket disconnected: ${socket.id}`);
  } catch (error: unknown) {
     socket.emit("error-message",
      new resp(false,
        "backed error",
        {"error":error}));

    console.error(error);
  }
});

  });
};
}
module.exports = s_index
