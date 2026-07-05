

class router{
    static async create_room(io,socket)
{console.log('created room')}

static async join_room(io,socket,room_id,uname){
    console.log(`soceket:${socket.id} ,name:${uname}joined room:${room_id}`)
}}


module.exports=router
