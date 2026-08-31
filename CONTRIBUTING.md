# Contributing

## Workflow

1. Branch from `main`.
2. Keep gameplay rules data-driven and deterministic where practical.
3. Never trust client-authored outcomes; clients submit inputs/intents.
4. Add or update design docs when changing player-facing rules or architecture.
5. Run `pnpm check`, `pnpm test`, and `pnpm build` before opening a pull request.

## Code conventions

- TypeScript strict mode is mandatory.
- Prefer pure functions in `packages/game-core`.
- Protocol changes must be backward-conscious and documented.
- Keep rendering/VFX out of authoritative simulation code.
- Avoid adding runtime dependencies without a documented reason.

## Art conventions

- Source assets live outside runtime bundles until approved/optimized.
- Runtime meshes are GLB/glTF.
- Runtime textures should target KTX2/Basis compression.
- Every gameplay-critical item must remain identifiable by silhouette, not color alone.
