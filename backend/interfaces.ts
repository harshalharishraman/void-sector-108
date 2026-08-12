import {Server,Socket} from 'socket.io'

export interface CustomSocket extends Socket{
  username?:string,
  currentRoom?:string,
  ready?:boolean;
  host?:boolean;
  loadout?:{[key:string]:number};
}

export interface RoomSet{
  
}