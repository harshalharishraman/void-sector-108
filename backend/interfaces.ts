import {Server,Socket} from 'socket.io'

export interface CustomSocket extends Socket{
  username?:string,
  currentRoom?:string,
  ready?:boolean;
  host?:boolean;
  loadout?:{[key:string]:number};
}

export interface PlayerInput{
    left:boolean,
    right:boolean,
    up:boolean,
    down:boolean,
    shoot:boolean
};

export interface InputPacket{
  seq:number,
  input:PlayerInput
};

export interface PlayerState{
    username:string,
    input:PlayerInput
    };