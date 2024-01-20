import { Room, Client } from "@colyseus/core";
import { MyRoomState, PlayerSchema } from "./schema/MyRoomState";

export class MyRoom extends Room<MyRoomState> {
  maxClients = 4;

  onCreate (options: any) {
    this.setState(new MyRoomState());

    this.onMessage("type", (client, message) => {
      //
      // handle "type" message
      //
    });
  }

  onJoin (client: Client, options: { color: string }) {
    this.state.players.set(
      client.id,
      new PlayerSchema().assign({
        color: options.color
      })
    )
  }

  onLeave (client: Client, consented: boolean) {
    this.state.players.delete(client.id)
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
