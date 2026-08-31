import { createServer } from "node:http";
import { Server } from "colyseus";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { FoodFightRoom } from "./rooms/FoodFightRoom";

const port = Number(process.env.GAME_SERVER_PORT ?? 2567);
const httpServer = createServer((_, response) => {
  response.writeHead(200, { "content-type": "application/json" });
  response.end(JSON.stringify({ service: "food-fight-game-server", ok: true }));
});

const gameServer = new Server({
  transport: new WebSocketTransport({ server: httpServer }),
});

gameServer.define("food_fight", FoodFightRoom);
httpServer.listen(port, "0.0.0.0", () => {
  console.log(`Food Fight game server listening on :${port}`);
});
