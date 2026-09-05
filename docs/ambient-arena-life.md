# M17 Ambient Arena Life

## Goal

Make the Food Court feel occupied and operational without adding gameplay ambiguity or turning peripheral decoration into a frame-time liability.

M17 is presentation-only. Ambient motion must never change collision, authoritative map topology, item state, objective state, projectile behavior, networking, or player reconciliation.

## First tranche — merged in PR #37

The first ambient-life pass animates only existing scene nodes:

- the eight steps in each M13 escalator bank circulate slowly in opposite directions;
- the three M6 hanging wayfinding signs receive a restrained independent sway;
- the M13 pizza-oven fire bed and burger-grill heat line receive a subtle scale pulse;
- the M13 shake-machine handles rock slowly and out of phase.

No new meshes, textures, particles, lights, audio assets, or network state are added.

## Second tranche — vendor menu screens, PR #39

The second bounded graphics pass reuses the four existing M6 vendor menu boards:

- `menu-pizza`
- `menu-burger`
- `menu-shake`
- `menu-dessert`

Each board's existing accent bar and three menu-line primitives receive a very slow, out-of-phase horizontal scale variation. The effect reads as subtle digital/menu activity from the gameplay camera without flashing, content swaps, texture uploads, new materials, or a screen-rendering subsystem.

The scale bounds are deliberately small:

- menu accent bars: ±1.8 percent;
- menu text-line stand-ins: ±1.2 percent.

The four boards use different phase offsets so the north wall does not pulse as a synchronized block.

## Third tranche — mezzanine patron silhouettes, PR #40

The next arena-life pass adds eight deliberately simple spectators to the High-detail mezzanines:

- four silhouettes behind the north rail and four behind the south rail;
- two render primitives per patron: one cylindrical body and one spherical head;
- shared dark/desaturated environment materials rather than team/player colors;
- no player rings, chef hats, held food, name markers, gameplay VFX, or collision;
- slight height variation so the group does not read as duplicated gameplay avatars;
- slow root bob capped at ±0.025 world units and yaw sway capped at ±2.2 degrees.

The silhouettes sit above and behind the authoritative combat plane. Their scale, palette, placement, and lack of gameplay markers are intentionally different from player characters so they read as distant spectators rather than combatants.

This tranche adds 16 non-shadow-casting renderers and no textures, downloads, particles, lights, skeletal animation, or network state.

## Motion budget

Ambient life uses one existing presentation update path and samples at 30 Hz rather than registering another render-frame callback.

With the mezzanine crowd enabled on High, the fixed transform budget is:

- 16 escalator-step positions;
- 3 wayfinding rotations;
- 2 equipment scale cues;
- 3 shake-handle rotations;
- 4 menu accent scales;
- 12 menu-line scales;
- 8 patron root positions;
- 8 patron root yaw rotations.

That is a maximum of 56 small transform updates per ambient sample on High quality. Medium performs the first 40 updates but does not render or animate patrons. Low quality disables the Medium/High scene roots.

## Readability rules

- Motion stays at the arena perimeter or above the primary combat plane.
- Nothing flashes, accelerates, or moves with projectile-like timing.
- No ambient object uses banana-hazard, pickup, objective-capture, or hit-feedback motion language.
- Escalator motion is slow enough to read as architecture rather than moving gameplay geometry.
- Wayfinding sway is capped at 1.6 degrees.
- Equipment pulse is capped at ±3.5 percent.
- Shake handles are capped to a small range around their authored resting angle.
- Menu-board activity changes only primitive scale, stays below ±1.8 percent, and never changes color or emissive intensity.
- Patron silhouettes remain dark/desaturated, behind mezzanine rails, and substantially smaller/less detailed than active players.
- Patrons never use team colors, team shapes, chef silhouettes, item silhouettes, or player labels.

## Reduced motion

Ambient life obeys both the in-product reduced-motion state and the operating-system `prefers-reduced-motion` preference.

When reduced motion is active:

- escalator steps return to their original evenly distributed authored positions;
- hanging signs return to zero sway;
- equipment cues return to their base scale;
- shake handles return to their base angle;
- menu accent bars and menu lines return exactly to their authored scale;
- patron roots return exactly to their authored position and yaw.

The runtime exposes `data-arena-ambient-life="active|reduced"` on the document element. Vendor menus additionally expose `data-arena-ambient-menu="active|reduced|unavailable"`. Mezzanine patrons expose `data-arena-ambient-crowd="active|reduced|disabled|unavailable"`; `disabled` means the patron entities exist but High detail is not enabled.

## Validation

M17 must keep these existing gates green:

- TypeScript checks and unit tests;
- asset audit and production build;
- client bundle-size budget;
- eight-player authoritative-room benchmark;
- staging container smoke;
- browser E2E, including quality-tier ambient crowd diagnostics and active/reduced ambient-life/menu diagnostics.

M17 remains open after the mezzanine-patron tranche. Later ambient work can add occasional peripheral service/cart motion or restrained environment audio only when each addition has an explicit update/readability/performance budget and demonstrates value from the gameplay camera. Crowd density should not increase until M18 rendered-client evidence proves the current High-detail cost is comfortably inside budget.
