import { Schema, type, MapSchema } from "@colyseus/schema";

export class PositionSchema extends Schema {
  @type('number')
  x: number = 0
  @type('number')
  y: number = 0
}

export class InputSchema extends Schema {
  @type('number') // -1 = left / 1 = right
  horizontal = 0
  @type('number') // -1 = down / 1 = up
  vertical = 0
}

export class PlayerSchema extends Schema {
  @type(PositionSchema)
  position: PositionSchema = new PositionSchema()
  @type(InputSchema)
  input: InputSchema = new InputSchema()
  @type('string')
  color: string = 'green'

  moveSpeed: number = 1
}

export class MyRoomState extends Schema {
  @type({ map: PlayerSchema })
  players = new MapSchema<PlayerSchema>()
}