# Game design document

## Core loop

1. Spawn with a team on opposite sides of a compact arena.
2. Move toward food pickups and the central objective.
3. Pick up or generate food weapons.
4. Aim and throw at opponents or place hazards.
5. Dodge incoming food and route around hazards.
6. Contest the central sundae zone to accumulate team score.
7. Recover quickly after hits and re-enter the fight.
8. Round ends at the score cap or time limit; show a short result and offer rematch.

## Match format

- Players: 8, normally 4v4.
- Initial mode: Sundae Control.
- Round clock: 180 seconds.
- Overtime: if tied and both teams are contesting the objective at zero, continue until one team owns the zone uncontested for 3 seconds.
- Respawn: no permanent elimination; short recovery/respawn keeps everyone engaged.
- Target total match cycle including results/rematch: under 5 minutes.

## Controls

Keyboard/mouse default:

- WASD / arrows: move.
- Mouse: aim.
- Primary mouse / Space: throw/use held food.
- Shift / secondary mouse: dodge.
- E: pickup/interact if contextual auto-pickup proves insufficient.

Gamepad:

- Left stick: move.
- Right stick: aim.
- Right trigger: throw/use.
- Left trigger / bumper: dodge.

Input should be remappable. Do not require color perception to understand state.

## Player movement

Movement is planar and responsive. The game is not a physics-platformer. Players use capsule/circle collision against simplified arena shapes. Acceleration can be visually eased while the gameplay model remains direct enough for competitive input.

Initial tuning:

- Base speed: 7.5 world units/s.
- Collision radius: 0.55 units.
- Dodge: short burst with a clear cooldown and brief collision/knockback resistance; not invulnerability to every hazard unless later playtests demand it.

## Aiming and throwing

A held item should be visually obvious. Projectiles use exaggerated arcs/trails and ground shadows so depth is readable from the elevated camera.

Rules:

- Client displays immediate windup/throw feedback.
- Server validates item ownership, cooldown, spawn position, and authoritative hit.
- A throw should be predictable enough to lead a moving target.
- Heavy items trade speed for area control or stronger displacement.

## Hit model

Avoid a traditional health-bar shooter model in the first slice. Hits create temporary disadvantage rather than long attrition:

- light hit: brief flinch and momentum interruption;
- strong hit: knockback/spin;
- hazard: slip/stun/slow;
- repeated hits can cause a short knockout/respawn if playtests need stronger payoff.

The goal is continuous participation with clear scoring opportunities.

## Pickups

Pickups spawn from authored points with readable anticipation. Avoid random drops that decide a match without counterplay. Spawn logic should use weighted tables but respect map-control balance.

Initial item pool:

- Tomato: baseline projectile.
- Banana: static trap.
- Pie: slower, larger, disruptive projectile.

Watermelon and milkshake are stretch items after the first three are stable.

## Sundae Control scoring

A circular center zone surrounds the sundae pedestal.

- A team owns the zone when it has at least one player inside and the other team has none.
- Contested zone yields no score.
- Ownership earns continuous score at a fixed rate.
- UI displays ownership, contest state, and progress clearly.
- The physical sundae is scenery/objective identity, not a fragile escort object in the first mode.

## Camera

Use a pulled-back fixed/soft-follow isometric camera that always shows enough arena context for eight-player play. Avoid camera rotation in the initial version; orientation consistency improves competitive readability.

## Feel targets

- Input feedback begins in the same rendered frame when possible.
- Throws have a clear anticipation, release, travel, and impact sequence.
- Hit effects should be large for 150–300 ms, then rapidly declutter.
- Sauce decals fade or simplify before they become navigation noise.
- Characters recover quickly enough that comedy does not become loss of control.

## Match-end presentation

Freeze authoritative scoring, let active VFX finish briefly, then show:

- winning team;
- team score;
- one or two readable personal stats such as hits landed and objective time;
- rematch button;
- leave/lobby action.

Do not make results longer than the match's social energy can sustain.
