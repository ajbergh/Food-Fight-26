# M16 Procedural Chef Finish

This document defines the first M16 shipping-character tranche: a production-facing finish for the existing default procedural chef while the project retains the separate decision about a final authored skeletal character.

## Why this tranche exists

The Food Court environment, lighting, VFX, audited production props, and ambient-life systems have moved beyond the original prototype presentation. The procedural chef remains the default player presentation, however, and its large session-accent torso still reads more like a prototype mascot than a food-service character at the gameplay camera.

This tranche improves that default path without introducing a new binary asset, changing authoritative gameplay, or prematurely enabling the opt-in skeletal pilot.

## Visual contract

The finish layers lightweight geometry over the existing articulated procedural character:

- off-white double-breasted jacket front panels;
- dark jacket piping for stronger shape separation;
- a compact chest pocket with a restrained player-accent lip;
- player-accent neckerchief tails;
- an apron knot and two short apron tails;
- a side towel with a small accent stripe;
- a small accent badge on the front band shared by all three existing headwear styles.

The jacket and apron remain neutral enough that the external team ring and hue-independent team marker remain the primary team-language surfaces. Session accent is used only as character trim and is not authoritative team information.

## Deterministic variation

`proceduralChefFinishCore.ts` derives a small bounded cosmetic variant from the existing player session identifier. It chooses:

- left or right towel placement;
- left or right pocket placement;
- a badge tilt between -4 and +4 degrees;
- a very small neckerchief-tail horizontal bias.

The variation is deterministic for a session and intentionally subtle. It avoids making every chef look cloned while preserving a common silhouette and material language for eight-player readability.

## Runtime and performance contract

This pass is presentation-only:

- no new GLB, texture, audio, or other runtime download;
- no collision, map, spawn, pickup, objective, or protocol changes;
- no network state or replicated cosmetic state;
- no lights, particles, probes, post-process passes, or shadow casters;
- no additional animation scheduler or per-frame callback;
- all added parts inherit the existing procedural character hierarchy and therefore move through the existing locomotion/throw/dodge/slip animation path.

The runtime exposes `data-procedural-chef-finish="ready|fallback"` on the document element so browser validation can confirm that the production-facing default character path was constructed successfully.

## Accessibility and readability

- Team ownership continues to use the external team ring plus the existing diamond/disc shape marker; hue is not the only team cue.
- The neutral jacket increases contrast between the player silhouette and the Food Court's darker environment surfaces.
- The added trim is small enough that it should not be confused with pickups, projectiles, hazards, or objective state.
- The tranche adds no motion, so reduced-motion behavior is unchanged.

## M16 status after this tranche

This is **not** the M16 exit gate. It makes the procedural chef a stronger shipping candidate and creates a fairer visual comparison against a future authored skeletal chef.

M16 still requires a final decision on whether a purpose-built Food Fight skeletal character is materially better than this procedural path. A skeletal-default decision remains gated on provenance/structural audit, the required production animation set, eight simultaneously rendered character measurements, gameplay-camera readability, and color-vision/accessibility review.
