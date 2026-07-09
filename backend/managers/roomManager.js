const resp=require('../respvo')

class room_actions{
    
    static room_sets=new Map()

    static async create_room_set(io,socket,roomCode){
        try {
            await socket.join(roomCode);

        room_sets.set(roomCode,{
            host:socket.id,
            game_mode:'none'
        
        })
         return} 
        
        catch(error){
            throw error
        }
    }
}

module.exports=room_actions