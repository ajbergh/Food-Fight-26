# Immutable single-host guest alpha (reference only)

The existing `compose.staging.yml` and `compose.published.yml` expose multiple developer-facing ports and use local/test database configuration. They are **not a publicly hardened edge deployment**.

For an early invite-only **guest-only** alpha, `infra/compose.alpha.yml` provides four immutable GHCR service images behind a single Caddy TLS edge. Only 80/443 are published; Caddy proxies WebSockets to the Colyseus server. Hostnames are separate to avoid rewriting matcher and WebSocket paths.

## Before deploying

- Use a Linux host with Docker Compose, suitable CPU/RAM, a publicly reachable IP, and inbound ports 80/443. Set A/AAAA DNS for **four distinct actual hostnames**: WEB_HOST, PLAY_HOST, MATCH_HOST and API_HOST.
- Confirm whether GHCR images are publicly readable; authenticate to GHCR on the host if they are private.
- Select an immutable SHA with successful PR and main-branch CI, container publishing and an explicit rollback SHA. Never deploy the `main` moving image tag for this flow.
- Copy `infra/alpha.env.example` to an untracked private environment file and replace the `.example.com` hostnames and all-zero commit SHA. Do not commit deployment credentials.
- Plan outbound firewall rules, host patching, backup/restore (if using a database elsewhere), logging/retention, incident response, and a way to roll back by tag. Gate alpha access with an appropriate external control if invitation privacy is required; room links themselves are not authorization.

## Validate and deploy

From repository root, after saving deployment values to `infra/alpha.env`:

```bash
set -a; source infra/alpha.env; set +a
bash infra/validate-alpha-config.sh

docker compose --env-file infra/alpha.env -f infra/compose.alpha.yml pull
docker compose --env-file infra/alpha.env -f infra/compose.alpha.yml up -d
```

Do not deploy with the example `sha-000...` image. Inspect running containers and smoke actual `https://WEB_HOST`, `https://PLAY_HOST/healthz`, `https://API_HOST/health` and real guest WebSocket joins through `https://MATCH_HOST`. Verify Caddy-issued certificates and HTTPS-only browser networking, then run eight-player and disconnect/reconnect tests on external devices.

For rollback, update the private env file to the **previous validated SHA** and redeploy after confirming protocol/client compatibility. Retain the prior images in GHCR.

## Explicit non-goals / blockers

This Compose graph deliberately omits Postgres and Redis because the current guest-match API does not yet persist user accounts/match history or implement distributed matchmaking. It also does **not** constitute durable observability, scalable regional hosting, infrastructure backups, private invite authorization, or a completed M18 hardware/visual acceptance. The platform API's in-process telemetry summary is not a production metrics store. Require a separately measured external alpha, ingress abuse controls, and issue #58 acceptance before calling the service production-ready.

The accompanying CI job validates **configuration syntax only**. It does not provision DNS, TLS certificates, a server, or public access.
