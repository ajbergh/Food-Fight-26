import Fastify from "fastify";

const app = Fastify({ logger: true });
const port = Number(process.env.PLATFORM_API_PORT ?? 3000);

app.get("/health", async () => ({ ok: true, service: "food-fight-platform-api" }));
app.get("/api/v1/config", async () => ({
  maxPlayers: 8,
  roundSeconds: 180,
  gameMode: "sundae-control",
}));

await app.listen({ port, host: "0.0.0.0" });
