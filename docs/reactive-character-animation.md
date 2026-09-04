# M12 Reactive Character Animation Pass

## Goal

Make combat states read through the character itself, not only through HUD text, labels, VFX, or root-scale deformation. This pass remains presentation-only: authoritative movement, collision, projectile ownership, dodge timing, stun timing, prediction, and reconciliation are unchanged.

## Delivered presentation states

The existing animation layer already covered `idle`, `walk`, `run`, and `throw_food`. M12 adds bounded secondary poses for:

- **Dodge** — forward athletic lean, crouch, compressed silhouette, bent knees, lifted arms, and a controlled lateral roll.
- **Slip/stun** — unstable side-to-side wobble, raised recovery arms, knee bend, stronger facial reaction, and a slightly compressed silhouette.

The presentation layer derives these states from the player root transform already applied by the authoritative client presentation. No new replicated state or protocol fields are introduced.

## Procedural chef

The default procedural chef now layers action poses over locomotion and throw animation instead of treating dodge as only a root squash. Action posing affects:

- torso pitch/roll;
- head counter-motion;
- scarf response;
- arm recovery/flail posture;
- leg stride suppression and knee bend;
- facial expression;
- controlled squash/stretch.

Throw animation remains authoritative-owner driven and can layer over the action pose without changing projectile timing.

## Skeletal pilot

The opt-in KayKit-derived pilot still requires only the canonical `idle`, `walk`, `run`, and `throw_food` clips. M12 adds a presentation-only secondary transform layer for dodge and slip so the pilot reacts immediately without weakening the GLB clip contract or requiring placeholder binary clips.

A later final character asset may replace these transform-layer reactions with authored `dodge`, `slip`, `hit`, `celebrate`, and `defeat` clips. The adapter should retain bounded transform fallback for incomplete or low-quality tiers.

## Performance contract

- No additional model downloads.
- No additional skins, skeletons, textures, materials, lights, or particle systems.
- Constant-time pose math per visible player.
- Existing quality tiers and reduced-motion behavior remain unchanged.
- Eight-player authoritative simulation and collision behavior remain untouched.

## Validation

Unit coverage verifies:

- locomotion thresholds remain stable;
- action-state inference distinguishes normal, slip, and dodge root transforms;
- action poses stay bounded;
- dodge and slip remain visually distinct in their pose parameters;
- throw windup/release/recovery behavior remains intact.

Browser/playtest validation should confirm the new silhouettes remain readable at the normal gameplay camera with eight simultaneous players.
