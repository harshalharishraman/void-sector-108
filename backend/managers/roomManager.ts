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
        const room=this.room_sets.get(roomCode);
  if(!room){
    return new resp(false,'invalid room code',null);
  }
    const clients = io.sockets.adapter.rooms.get(roomCode);
     const users:{username:string,ready:boolean}[]= [];

  if (clients) {
    for (const clientId of clients) {
      const clientSocket= io.sockets.sockets.get(clientId) as 
                          CustomSocket| undefined;

      if (clientSocket && clientSocket.username) {
        users.push({username:clientSocket.username,
            ready:clientSocket.ready??false});
      }
    }
  }
  const host=await io.sockets.sockets.get(room.host) as 
            CustomSocket|undefined;
if(!host){
    return new resp(false,'host detail unobtainable',null);
}
  
  io.to(roomCode).emit("room-users",
    new resp(true,
        'updated room userslist',
        {'users':users,host_id:host.id,host_uname:host.username
        }));
   
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

                console.log(socket.ready);
                
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

    static async getSocketById(
        io:Server,uname:string){
                for(const maybe_socket of io.sockets.sockets.values()){
                    const if_socket=maybe_socket as CustomSocket;
                    if(if_socket.username===uname){
                        return new resp(true,
                            `found socket of user:${uname}`,
                        if_socket);
                    }
                }
                return  new resp(false,
                            `not found socket of user:${uname}`,
                        null);;
        }

    static async to_kick_player(
        io:Server,socket:CustomSocket,to_kick_out:string){
            try {
                const room=this.room_sets.get(socket.currentRoom);
                if(!(socket.host!=room.host)){
                    return new resp(false,
                        `user:${socket.username} not host of room:${socket.currentRoom}
                        ,permission denied`,
                        null);
                }

                if(!room.pnames.includes(to_kick_out)){
                    return new resp(false,
                        `user:${to_kick_out} to be kicked out not in room`,
                        null);
                }

                if(to_kick_out===socket.username){
                    return new resp(false,
                        `cant kick out host itself`,
                        null);
                }

                const to_kick_out_socket=await this.getSocketById
                                               (io,to_kick_out);

                

                if(!to_kick_out_socket.success){
                    return new resp(false,`cant get user:${to_kick_out} socket`,
                        null
                    );}

                const from_rm=await this.pyr_leave(io,
                    to_kick_out_socket.data,
                    to_kick_out_socket.data.currentRoom);


                if(!from_rm.success){
                    return new resp(false,
                        `cant remove user:${to_kick_out}`,
                        from_rm.data
                    );}

                await this.updateRoomUsers(io,socket.currentRoom??'error');

                to_kick_out_socket.data.emit('left-room',from_rm);



                return new resp(true,
                    `kicked out user:${to_kick_out}
                    from room:${to_kick_out_socket.data.currentRoom}
                    by host:${socket.username}`,
                    {kicked_out_uname:to_kick_out,
                     kicked_out_id:to_kick_out_socket.id,
                     by_id:socket.id}
                );

            }
            catch (error:unknown){
                throw error;
            }
        }
}

module.exports=room_actions