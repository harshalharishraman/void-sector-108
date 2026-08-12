const resp=require('../respvo')
import {Server,Socket} from 'socket.io'
import type {CustomSocket} from '../interfaces'

class room_actions{
    
    static room_sets=new Map()

    static async create_room_set(
        io:Server,socket:CustomSocket,roomCode:string)
        {
        try {
            await socket.join(roomCode);

        this.room_sets.set(roomCode,{
            host:socket.id,
            game_mode:'none',
            players:1,
            left_to_join:3,
            pnames:[socket.username],
            ready_players:0
        });

         return new resp(true,
            `socket:${socket.id} created room set:${roomCode}`,
            null)} 
        
        catch(error){
            throw error
        }
    }

    static async updateRoomUsers(io:Server,roomCode:string) {

    try {
    const clients = io.sockets.adapter.rooms.get(roomCode);
     const users:string[]= [];

  if (clients) {
    for (const clientId of clients) {
      const clientSocket= io.sockets.sockets.get(clientId) as 
                          CustomSocket| undefined;

      if (clientSocket && clientSocket.username) {
        users.push(clientSocket.username);
      }
    }
  }
  io.to(roomCode).emit("room-users",
    new resp(true,'updated room userslist',{'users':users}));
   
}
    catch (error:any) {
        throw error;
    }
     
}

static async add_pyr
(io:Server,socket:CustomSocket,roomCode:string)
{
    try {

        if(this.room_sets.has(roomCode) && !socket.currentRoom){
            
            const room=this.room_sets.get(roomCode);

            if(room.left_to_join>0){
            
            await socket.join(roomCode);

            room.players++;
            room.left_to_join--;
            room.pnames.push(socket.username);

            return new resp(true,
                `socket:${socket.id} added room set:${roomCode}`,
                null);}

            else{
                return new resp(false,
                `room limit reached`,
                null);

            }
            }
       
        return new resp(false,
            `no such room set found`,
            null)
        
            }
    
    catch(error:any){
        throw error
        
    }
}

static async pyr_leave
(io:Server,socket:CustomSocket,roomCode:string){

    try{
        const room = this.room_sets.get(roomCode);

        if (!room) {
            return new resp(false, "room set not found", {
                room_code: roomCode});
    }

    if(socket.currentRoom===roomCode){

            await socket.leave(roomCode);

            room.players--;
            room.left_to_join++;
            const index = room.pnames.indexOf(socket.username);

            if (index !== -1) {
                room.pnames.splice(index, 1);}


            if (room.players <= 0) {
                this.room_sets.delete(roomCode);
            }

            return new resp(true,
                `socket:${socket.id} removed from room set:${roomCode}`,
                null)
            }
       
        return new resp(false,`no such room set found`,null);
        
            }

    catch (error:any) {
        throw error;
    }
}

static async change_player_status(
    io:Server,socket:CustomSocket)
    {
        try {
            
            const room=this.room_sets.get(socket.currentRoom);

            if (!room){
                return new resp(false, 
                    'room not found', 
                    {room_code: socket.currentRoom});
                }

            if(!room.pnames.includes(socket.username)){
                return new resp(false,
                    'player is not in this room', 
                    {username: socket.username,
                    room_code: socket.currentRoom});
                }
                
                socket.ready = !(socket.ready ?? false);
                
                if (socket.ready) {
                    room.ready_players =
                    Math.min(room.players, room.ready_players + 1);
                }
                else {
                    room.ready_players =
                    Math.max(0, room.ready_players - 1);}

                console.log(socket.ready)
                
                return new resp(true,
                    `user:${socket.username} status changed`,
                    {username:socket.username,
                     ready:socket.ready
                    });   
        }
        catch (error:any){
         throw error;   
        }
    }
}

module.exports=room_actions