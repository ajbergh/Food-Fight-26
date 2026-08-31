import { createServer } from "node:http";
import { Server } from "colyseus";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { FoodFightRoom } from "./rooms/FoodFightRoom";

const port = Number(process.env.GAME_SERVER_PORT ?? 2567);
const httpServer = createServer();
const gameServer = new Server({
  transport: new WebSocketTransport({ server: httpServer }),
});

gameServer.define("food_fight", FoodFightRoom);
await gameServer.listen(port);
console.log(`Food Fight game server listening on :${port}`);
