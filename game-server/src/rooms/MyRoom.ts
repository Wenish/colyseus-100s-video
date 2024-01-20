import { Room, Client } from "@colyseus/core";
import { MyRoomState, PlayerSchema } from "./schema/MyRoomState";

export class MyRoom extends Room<MyRoomState> {
  maxClients = 4;

  onCreate (options: any) {
    console.log("room", this.roomId, "creating...");
    this.setState(new MyRoomState());

    this.onMessage<number>("input.horizontal", (client, message) => {
      if(!isNumber(message)) return
      const player = this.state.players.get(client.id)
      player.input.horizontal = clamp(message, -1, 1)
    });
    this.onMessage<number>("input.vertical", (client, message) => {
      if(!isNumber(message)) return
      const player = this.state.players.get(client.id)
      player.input.vertical = clamp(message, -1, 1)
    });

    this.setSimulationInterval((deltaTime) => this.update(deltaTime));
  }

  onJoin (client: Client, options: { color: string }) {
    this.state.players.set(
      client.id,
      new PlayerSchema().assign({
        color: options.color || 'green'
      })
    )
  }

  onLeave (client: Client, consented: boolean) {
    this.state.players.delete(client.id)
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

  update (deltaTime: number) {
    for(let [index, player] of this.state.players) {
      player.update(deltaTime)
    }
  }

}

function clamp(number: number, min: number, max: number) {
  return Math.min(Math.max(number, min), max);
}

function isNumber(value: any) {
  return typeof value === 'number' && !isNaN(value);
}