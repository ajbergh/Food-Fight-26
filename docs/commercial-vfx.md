# M8 Commercial Gameplay VFX

## Goal

Make moment-to-moment play read as a shipped arcade brawler rather than a synchronized prototype, without increasing authoritative network state or relying on expensive dynamic lighting.

## Runtime effects

The commercial VFX controller is entirely client-side presentation. One authoritative event can expand into richer local feedback without changing bandwidth or game rules.

Current effects:

- tomato projectile glow plus short history-based motion trail
- pulsing tomato/banana pickup auras
- pulsing banana hazard warning ring
- tomato and banana impact burst particles layered over the existing floor splat ring
- dodge dust bursts on dodge-state transitions
- team-colored objective celebration bursts for round start, overtime and control changes
- hard cap of 96 transient particles to prevent runaway effect density

## Accessibility

Reduced-motion mode intentionally lowers or removes high-motion secondary effects:

- projectile trail count is reduced
- dodge dust is removed
- impact and objective particle counts are reduced
- gameplay-significant geometry, pickups, hazards and objective ownership remain fully visible

## Performance constraints

- no new dynamic lights
- no shadow casting or receiving on effect renderers
- shared materials are reused across effects
- transient particles are destroyed after short bounded lifetimes
- projectile trail nodes are destroyed when their authoritative visual disappears
- pickup/hazard pulses are lightweight transform animation only

## Networking rule

VFX never owns gameplay truth. It responds to existing authoritative snapshots and events:

- projectile snapshots create projectile presentation
- banana snapshots create hazard presentation
- impact messages create splat/burst feedback
- match events create objective celebration feedback
- player dodge state creates local dust feedback

No particle, trail, glow, ring or screen effect is replicated over the network.

## Acceptance criteria

- tomato travel is readable during an eight-player fight
- impacts are visually obvious without obscuring nearby players
- banana hazards remain unmistakable against the arena floor
- objective control changes produce an immediate center-screen/world response
- reduced-motion mode preserves state readability
- the complete CI, browser E2E, bundle budget, room benchmark and container smoke suites remain green
