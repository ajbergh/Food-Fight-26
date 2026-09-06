# M16 Character Reactions

This document defines the second M16 character-production tranche: presentation-only hit, victory, and defeat reactions driven directly by existing authoritative game events.

## Goal

The current character systems already cover locomotion, food throws, dodge, and slip/stun. Combat impacts and round results were visible through VFX and HUD presentation, but the player characters themselves did not react to those authoritative events. This tranche closes that presentation gap for both the default procedural chef and the opt-in skeletal pilot without changing gameplay state or introducing new runtime assets.

## Authoritative event contract

Character reactions are triggered only from data that the game server already owns:

- **Hit:** an existing `impact` message with `targetSessionId` triggers `hit` on that exact player.
- **Victory/defeat:** an existing `round_finished` match event with the winning `team` triggers `celebrate` for players on the winning team and `defeat` for players on the losing team.

No client-side hit inference, score inference, proximity test, or result prediction is added. The protocol and server simulation are unchanged.

## Reaction timing and pose contract

| Reaction | Duration | Presentation intent |
| --- | ---: | --- |
| `hit` | 0.34 s | Short recoil with bounded body/head response and expression change. |
| `celebrate` | 1.40 s | Two-beat raised-arm celebration with a small vertical hop and restrained roll. |
| `defeat` | 1.45 s | Readable forward slump with crouch/head drop, then a complete recovery. |

All reactions are transient. Their pose functions return to an exact neutral transform at completion so they cannot permanently deform a character or accumulate transform drift across rounds.

## Procedural chef path

The procedural chef layers reactions over the existing articulated hierarchy:

- body translation/rotation;
- head and scarf response;
- bounded squash/stretch;
- arm and leg articulation;
- eyebrow/mouth expression;
- reduced locomotion stride while a result reaction is dominant.

The existing locomotion, throw, dodge, and slip code remains the base presentation path. Reactions use the same per-character update and do not create another scheduler.

## Skeletal pilot path

The skeletal pilot receives the same authoritative reaction semantics through a bounded root transform layer over its existing authored `idle`, `walk`, `run`, and `throw_food` clips.

This is intentionally a fallback-quality production path rather than an assertion that transform reactions are the final skeletal animation solution. If a purpose-built Food Fight skeletal chef is authored later, dedicated `hit`, `celebrate`, and `defeat` clips may replace these transforms only when they materially improve timing, readability, and visual quality while staying within the M16/M18 performance budget.

## Performance and gameplay boundaries

This tranche adds:

- no protocol fields or messages;
- no server simulation or scoring changes;
- no collision, map, spawn, pickup, objective, or input changes;
- no GLB, texture, audio, or other runtime download;
- no new light, particle system, probe, render target, or post-process pass;
- no additional frame/update subscription.

The only new runtime work is bounded arithmetic and transform application inside character presentation that already updates each frame.

## Accessibility and readability

- Reactions do not change the team ring or diamond/disc team marker, so team identity remains available without relying on hue.
- The hit recoil is intentionally short so it does not obscure the longer authoritative slip/stun state.
- Victory/defeat motion is bounded and does not change collision or player position in the simulation.
- These character-result reactions are not required for understanding who won; the existing match banner and HUD remain authoritative redundant cues.

## Validation

Automated coverage verifies:

- reaction durations and bounds;
- hit recoil magnitude;
- celebration arm/hop behavior;
- defeat slump magnitude;
- exact neutral recovery at the end of every reaction;
- full repository type/check, build, asset, budget, authoritative-room, container, and browser regression gates.

Representative eight-player rendered-client performance and formal readability/accessibility review remain M18 requirements and are not replaced by CI.

## M16 status after this tranche

This tranche supplies functional presentation fallbacks for the remaining `hit`, `celebrate`, and `defeat` semantics. M16 remains open because the project still needs an evidence-backed decision between the improved procedural shipping candidate and any purpose-built skeletal Food Fight chef. M18 representative-client measurements and gameplay-camera review remain part of that decision gate.
