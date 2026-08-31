import * as pc from "playcanvas";
import { GAME } from "@foodfight/game-core";
import { foodCourtMap } from "@foodfight/maps";
import { connectToMatch } from "./network";
import "./styles.css";

const canvas = document.querySelector<HTMLCanvasElement>("#game")!;
const networkLabel = document.querySelector<HTMLDivElement>("#network")!;

const app = new pc.Application(canvas, {
  mouse: new pc.Mouse(canvas),
  touch: new pc.TouchDevice(canvas),
  keyboard: new pc.Keyboard(window),
});
app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
app.setCanvasResolution(pc.RESOLUTION_AUTO);
app.scene.ambientLight = new pc.Color(0.42, 0.38, 0.48);
app.start();

const camera = new pc.Entity("camera");
camera.addComponent("camera", { clearColor: new pc.Color(0.08, 0.07, 0.1) });
camera.setPosition(0, 22, 19);
camera.lookAt(0, 0, 0);
app.root.addChild(camera);

const light = new pc.Entity("key-light");
light.addComponent("light", { type: "directional", intensity: 1.5, castShadows: true });
light.setEulerAngles(50, -35, 0);
app.root.addChild(light);

function material(color: pc.Color) {
  const value = new pc.StandardMaterial();
  value.diffuse = color;
  value.metalness = 0.05;
  value.gloss = 0.45;
  value.update();
  return value;
}

const floor = new pc.Entity("arena-floor");
floor.addComponent("render", { type: "box", material: material(new pc.Color(0.36, 0.3, 0.39)) });
floor.setLocalScale(foodCourtMap.width, 0.5, foodCourtMap.height);
floor.setPosition(0, -0.3, 0);
app.root.addChild(floor);

for (const obstacle of foodCourtMap.obstacles) {
  const entity = new pc.Entity(obstacle.id);
  entity.addComponent("render", { type: "box", material: material(new pc.Color(0.38, 0.31, 0.72)) });
  entity.setLocalScale(obstacle.width, 0.75, obstacle.height);
  entity.setPosition(obstacle.x, 0.36, obstacle.y);
  app.root.addChild(entity);
}

const sundae = new pc.Entity("sundae-objective");
sundae.addComponent("render", { type: "cylinder", material: material(new pc.Color(0.95, 0.87, 0.7)) });
sundae.setLocalScale(2.2, 3.2, 2.2);
sundae.setPosition(foodCourtMap.objective.x, 1.6, foodCourtMap.objective.y);
app.root.addChild(sundae);

const playerColors = [
  new pc.Color(0.2, 0.55, 1), new pc.Color(0.35, 0.85, 0.35),
  new pc.Color(0.65, 0.35, 0.95), new pc.Color(1, 0.8, 0.2),
  new pc.Color(1, 0.45, 0.15), new pc.Color(0.95, 0.2, 0.2),
  new pc.Color(0.1, 0.85, 0.85), new pc.Color(1, 0.35, 0.7),
];

foodCourtMap.spawns.slice(0, GAME.maxPlayers).forEach((spawn, index) => {
  const player = new pc.Entity(`player-${index + 1}`);
  player.addComponent("render", { type: "capsule", material: material(playerColors[index]!) });
  player.setLocalScale(0.85, 1.2, 0.85);
  player.setPosition(spawn.x, 0.9, spawn.y);
  app.root.addChild(player);
});

window.addEventListener("resize", () => app.resizeCanvas());

connectToMatch(`Guest-${Math.floor(Math.random() * 9000 + 1000)}`)
  .then((connection) => {
    networkLabel.textContent = `connected · ${connection.room.sessionId.slice(0, 6)}`;
  })
  .catch(() => {
    networkLabel.textContent = "server unavailable · visual prototype only";
  });
