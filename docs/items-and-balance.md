# Items and balance

Balance data begins in `packages/game-core/src/items.ts`. The table below defines intent; values change through playtests.

| Item | Role | Initial behavior | Counterplay |
|---|---|---|---|
| Tomato | Baseline skill shot | Fast straight/soft-arc projectile, short cooldown | Strafe/dodge, use cover |
| Banana | Space-control trap | Persistent peel that causes a slip/stun | See bright silhouette, route around, trigger deliberately |
| Pie | Heavy disruption | Slower/larger projectile with cream burst and stronger flinch | Long travel time, obvious windup |
| Watermelon | Lane denial | Rolls and bounces predictably along floor | Step aside, use obstacles |
| Milkshake | Area slow | Creates short-lived sticky patch | Avoid zone, force opponent away from objective |

## Balance principles

1. Every powerful food needs readable anticipation.
2. Randomness may vary presentation, not decide whether an aimed hit connects.
3. No item should invalidate movement fundamentals.
4. Crowd control must remain short; repeated loss of control is frustrating.
5. Dominant strategies should be fixed by geometry, timing, or availability before adding complex counters.

## Pickup economy

- Pickups appear at authored spawn points.
- Spawn points should have contestable risk rather than being safely behind a team spawn.
- Avoid simultaneous high-power item spawns unless intentionally creating a match event.
- The server owns pickup availability and inventory state.

## Telemetry required for balancing

Per match collect at least:

- item pickups;
- throws/uses;
- hits;
- hit rate;
- average time held;
- objective displacement following item use;
- stun/slow seconds inflicted;
- item-associated score swing within a short window.

Balance changes should state the problem, hypothesis, changed values, and measured result.
