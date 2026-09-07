import {Server} from 'socket.io'
import type { CustomSocket, InputPacket,PlayerState } from "../interfaces.js";

class PlayerActions {
  static move_plyr(
    socket: CustomSocket,
    packet: PlayerState
  ): void {
    const input = packet.input;

    if (input.left) {
      console.log(`${socket.id} moved left`);
    }

    if (input.right) {
      console.log(`${socket.id} moved right`);
    }

    if (input.up) {
      console.log(`${socket.id} moved up`);
    }

    if (input.down) {
      console.log(`${socket.id} moved down`);
    }

    if (input.shoot) {
      console.log(`${socket.id} shooting`);
    }
  }
}

export default PlayerActions;

