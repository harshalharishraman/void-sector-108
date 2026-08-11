const resp=require('../respvo');
const rm=require('../managers/roomManager')
import {Server,Socket} from 'socket.io'
import type {CustomSocket} from '../interfaces'


class rooms{

    static async create_room(io:Server,socket:CustomSocket){
        
    try{
      let rCode:string= await Math.random().toString(36).
      substring(2, 7).toUpperCase();
      
      if(io.sockets.adapter.rooms.has(rCode)){
        rCode=await Math.random().
        toString(36).substring(2, 7).toUpperCase();

      }
      
      const roomCode:string=rCode;
      
      const from_rm=await rm.create_room_set(io,socket,roomCode);

      if(!from_rm.success){
        return new resp(false,
          'cant create room',
          {
            room_code: roomCode,
            reason: from_rm.msg
            })
          }

        socket.currentRoom=roomCode;
        socket.ready=false;
        socket.host=true;
        socket.loadout={};

        await rm.updateRoomUsers(io,roomCode);

        return new resp(true,
          'room created',
          {'room_code':roomCode})
    
    }
      catch(error:any){
        throw error
      }
    }

    static async join_room(
      io:Server,socket:CustomSocket,roomCode:string){

      try{
      const code = roomCode.toUpperCase().trim();
      const roomExists = await io.sockets.adapter.rooms.has(code);

      if (roomExists) {

        const from_rm=await rm.add_pyr(io,socket,code);

        if(!from_rm.success){
            return new resp(false,
            "cant add player",
            {
              room_code: roomCode,
              reason: from_rm.msg
            }); }

          socket.currentRoom = code;
          socket.ready=false;
          socket.host=false
          socket.loadout={}

          await rm.updateRoomUsers(io,code);

          return new resp(true,
            "room joined",
            {"room_code":roomCode});
        }
      }

      catch(error:any){
        throw error
      } 
    }

  static async leave_room(
    io:Server,socket:CustomSocket,roomCode:string){
      try {
        const code = roomCode.toUpperCase().trim();
      const roomExists:boolean= await io.sockets.adapter.rooms.has(code);

      if (!roomExists) {
         return new resp(false,
          "no such room found",
          { room_code: code });
        }

        const from_rm=await rm.pyr_leave(io,socket,code);
        
        if(!from_rm.success){
            return new resp(false,
            "cant remove player",
            {
              room_code: roomCode,
              reason: from_rm.msg
            }); }

          socket.currentRoom=undefined;
          socket.ready=false;
          socket.host=false
          socket.loadout={}

          await rm.updateRoomUsers(io,code);

          return new resp(true,
            "left room",
            {"room_code":roomCode});
      
      }
      catch (error:any) {
        throw error;
      }
    }
  
}

module.exports=rooms
