import Fastify, { type FastifyReply } from "fastify";
import { ClientTelemetryStore, parseClientTelemetry } from "./clientTelemetry";

const app = Fastify({ logger: true });
const port = Number(process.env.PLATFORM_API_PORT ?? 3000);
const telemetry = new ClientTelemetryStore();

function allowTelemetryCors(reply: FastifyReply) {
  reply.header("access-control-allow-origin", "*");
  reply.header("access-control-allow-methods", "GET,POST,OPTIONS");
  reply.header("access-control-allow-headers", "content-type");
  reply.header("cache-control", "no-store");
}

app.get("/health", async () => ({ ok: true, service: "food-fight-platform-api" }));
app.get("/api/v1/config", async () => ({
  maxPlayers: 8,
  roundSeconds: 180,
  gameMode: "sundae-control",
}));

app.options("/api/v1/telemetry/client", async (_request, reply) => {
  allowTelemetryCors(reply);
  return reply.code(204).send();
});

app.post("/api/v1/telemetry/client", { bodyLimit: 8 * 1024 }, async (request, reply) => {
  allowTelemetryCors(reply);

  let raw: unknown = request.body;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return reply.code(400).send({ accepted: false, error: "invalid_json" });
    }
  }

  const event = parseClientTelemetry(raw);
  if (!event) return reply.code(400).send({ accepted: false, error: "invalid_event" });

  telemetry.record(event);
  const logContext = { kind: event.kind, route: event.route };
  if (event.kind === "client_error" || event.kind === "unhandled_rejection") {
    app.log.warn(logContext, "client telemetry error event");
  } else {
    app.log.info(logContext, "client telemetry event");
  }
  return reply.code(202).send({ accepted: true });
});

app.get("/api/v1/telemetry/summary", async (_request, reply) => {
  allowTelemetryCors(reply);
  return telemetry.summary();
});

await app.listen({ port, host: "0.0.0.0" });
