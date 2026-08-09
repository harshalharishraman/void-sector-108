const resp=require('../respvo');
const rm=require('../managers/roomManager')
import {Server,Socket} from 'socket.io'
import type {CustomSocket} from '../interfaces'

class rooms{

    static async create_room(io:Server,socket:Socket){
        
    try{
      let rCode:string= await Math.random().toString(36).substring(2, 7).toUpperCase();
      
      if(io.sockets.adapter.rooms.has(rCode)){
        rCode=await Math.random().toString(36).substring(2, 7).toUpperCase();

      }
      
      const roomCode:string=rCode;
      
      const from_rm=await rm.create_room_set(io,socket,roomCode);

      if(!from_rm.success){
        return new resp(false,'cant create room',null)}

        socket.currentRoom=roomCode;
        socket.ready=false;
        socket.host=true;
        socket.loadout={};
        await rm.updateRoomUsers(io,roomCode);
        return new resp(true,'room created',{'room_code':roomCode})
    
    }
      catch(error){
        throw error
      }
    }

    static async join_room(io,socket,roomCode){
      try{
      const code = roomCode.toUpperCase().trim();
      const roomExists = await io.sockets.adapter.rooms.has(code);

      if (roomExists) {

        const from_rm=await rm.add_pyr(io,socket,code);

        if(!from_rm.success){
            return new resp(false,
            "cant add player",
            null); }

          socket.currentRoom = code;
          socket.ready=false;
          socket.host=false
          socket.loadout={}

          await rm.updateRoomUsers(io,code);

          return new resp(true,
            "room joined",
            {"room_code":roomCode});
          
        
        }
        return new resp(false,
            "no such room found",
            null);}


      catch(error){

        throw error
      }

      
    }
  
}

module.exports=rooms
