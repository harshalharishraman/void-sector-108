const resp=require('../respvo')
import {Server,Socket} from 'socket.io'
import type {CustomSocket} from '../interfaces'

class player{

    static player_names=new Set<string>();

    static async check_userName(
        io:Server,socket:CustomSocket,uname:string){
            try {

                const user_name:string=uname.trim().toUpperCase();
                if(this.player_names.has(user_name)){
                    
                    return new resp(true,
                        'username already taken',
                         null);
                }

                await this.player_names.add(user_name);

                return new resp(false,
                        'username not taken',
                         null);
                
            } catch (error:any) {
                throw error;
            }
        }

    static async del_userName
    (io: Server, socket: CustomSocket, uname: string) {
        try {
    const user_name = uname.trim().toUpperCase();

    if (!this.player_names.has(user_name)) {
      return new resp(false, 'username not found', null);
    }

    this.player_names.delete(user_name);


    return new resp(true, 'username deleted', null);
  } catch (error: unknown) {
    throw error;
  }
}

}

module.exports=player;