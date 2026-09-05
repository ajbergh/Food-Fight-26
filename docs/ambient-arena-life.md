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

## Second tranche — vendor menu screens

The next bounded graphics pass reuses the four existing M6 vendor menu boards:

- `menu-pizza`
- `menu-burger`
- `menu-shake`
- `menu-dessert`

Each board's existing accent bar and three menu-line primitives receive a very slow, out-of-phase horizontal scale variation. The effect reads as subtle digital/menu activity from the gameplay camera without flashing, content swaps, texture uploads, new materials, or a screen-rendering subsystem.

The scale bounds are deliberately small:

- menu accent bars: ±1.8 percent;
- menu text-line stand-ins: ±1.2 percent.

The four boards use different phase offsets so the north wall does not pulse as a synchronized block.

## Motion budget

Ambient life uses one existing presentation update path and samples at 30 Hz rather than registering another render-frame callback.

After the vendor-menu tranche, the fixed transform budget is:

- 16 escalator-step positions;
- 3 wayfinding rotations;
- 2 equipment scale cues;
- 3 shake-handle rotations;
- 4 menu accent scales;
- 12 menu-line scales.

That is a maximum of 40 small transform updates per ambient sample when both Medium and High roots are active. Low quality disables the Medium/High scene roots, and High-only equipment work is skipped unless High detail is enabled.

## Readability rules

- Motion stays at the arena perimeter or above the primary combat plane.
- Nothing flashes, accelerates, or moves with projectile-like timing.
- No ambient object uses banana-hazard, pickup, objective-capture, or hit-feedback motion language.
- Escalator motion is slow enough to read as architecture rather than moving gameplay geometry.
- Wayfinding sway is capped at 1.6 degrees.
- Equipment pulse is capped at ±3.5 percent.
- Shake handles are capped to a small range around their authored resting angle.
- Menu-board activity changes only primitive scale, stays below ±1.8 percent, and never changes color or emissive intensity.

## Reduced motion

Ambient life obeys both the in-product reduced-motion state and the operating-system `prefers-reduced-motion` preference.

When reduced motion is active:

- escalator steps return to their original evenly distributed authored positions;
- hanging signs return to zero sway;
- equipment cues return to their base scale;
- shake handles return to their base angle;
- menu accent bars and menu lines return exactly to their authored scale.

The runtime exposes `data-arena-ambient-life="active|reduced"` on the document element. The vendor-menu tranche additionally exposes `data-arena-ambient-menu="active|reduced|unavailable"` so E2E can verify the feature and accessibility path without relying on fragile pixel comparisons.

## Validation

M17 must keep these existing gates green:

- TypeScript checks and unit tests;
- asset audit and production build;
- client bundle-size budget;
- eight-player authoritative-room benchmark;
- staging container smoke;
- browser E2E, including active and reduced ambient-life/menu diagnostics.

M17 remains open after the vendor-menu tranche. Later ambient work can add distant crowd/card treatment, service-cart motion, or restrained environment audio only when each addition has an explicit update/readability/performance budget and demonstrates value from the gameplay camera.
