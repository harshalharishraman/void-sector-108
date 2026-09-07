const resp=require('../respvo')
import {Server,Socket} from 'socket.io'
import type {CustomSocket,PlayerInput,InputPacket,PlayerState} from '../interfaces'

import PlayerActions from '../gameLoop/plyr_actions'



class player{

    static player_names=new Set<string>();

    static readonly defaultInput:PlayerInput={
        left: false,
        right: false,
        up: false,
        down: false,
        shoot:false
    };

    static player_states=new Map<string,PlayerState>();

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
                await this.player_states.set(socket.id,
                    {username:uname,
                     input:{...this.defaultInput},
                    });

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

    await this.player_names.delete(user_name);
    await this.player_states.delete(socket.id);


    return new resp(true, 'username deleted', null);
  } catch (error: unknown) {
    throw error;
  }
}

static updateplayerInput
(io: Server, socket: CustomSocket,packet:InputPacket){
const player=this.player_states.get(socket.id);
if(!player)return;

player.input = {
    left: Boolean(packet.input.left),
    right: Boolean(packet.input.right),
    up: Boolean(packet.input.up),
    down: Boolean(packet.input.down),
    shoot:Boolean(packet.input.shoot)
  };

  PlayerActions.move_plyr(socket,player);
}


}

module.exports=player;