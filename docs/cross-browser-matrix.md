# Cross-browser guest-onboarding validation

The primary gameplay CI remains Chromium + PlayCanvas + a real Colyseus room. The separate `Cross-Browser Guest Shell` workflow runs **Firefox and WebKit** smoke tests covering guest onboarding accessibility, room-code validation, and mobile-width layout. It triggers on changed web-shell paths, manual dispatch, and weekly scheduling.

Locally:

```bash
corepack pnpm install
corepack pnpm exec playwright install --with-deps firefox webkit
corepack pnpm exec playwright test --config playwright.cross-browser.config.ts
```

This deliberately does **not** assert Firefox/WebKit gameplay readiness. Before alpha release, validate the actual PlayCanvas game, user input, GPU startup, color-safe UI, audio, and WebSocket sessions in Firefox/WebKit on supported physical platforms. Do not interpret successful web-shell smoke results as a complete compatibility claim.

The cross-browser workflow enforces the same frozen pnpm lockfile used by normal CI and container builds.
