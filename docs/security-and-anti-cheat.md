# Security and anti-cheat

## Principle

Assume the browser client is fully inspectable and modifiable. Security comes from server authority and validation, not obfuscation.

## Match validation

Server validates:

- input numeric ranges and finiteness;
- input sequence monotonicity/rate;
- movement speed and collision;
- inventory ownership;
- item cooldowns;
- projectile origin and timing;
- pickup availability;
- objective occupancy;
- score transitions.

Never accept client messages equivalent to `I hit player X`, `give me item Y`, or `add score`.

## Abuse limits

- Cap messages per client/time window.
- Bound payload sizes.
- Disconnect malformed/flooding clients after telemetry/logging thresholds.
- Sanitize display names and future user-generated text.
- Apply HTTP rate limits to auth/profile/matchmaking endpoints.

## Session handoff

Production matchmaking should issue a short-lived room admission token signed or otherwise verifiable by the match server. Room join options from the browser are not trusted identity claims.

## Secrets

- No private keys or service credentials in Vite/browser environment variables.
- Use runtime secrets for server deployments.
- Rotate credentials and scope service permissions narrowly.
- Do not log auth tokens.

## Supply chain

- Lock dependency versions once initial package graph is validated.
- Enable automated dependency/security scanning.
- Review high-impact runtime dependencies before adoption.
- Generate SBOM/build provenance if deployment requirements justify it.

## Cheat response strategy

Do not overbuild invasive anti-cheat for the prototype. Instrument impossible movement, message spam, cooldown violations, and abnormal accuracy. Server authority should make common browser tampering ineffective; add specialized detection only when real abuse appears.
