# Art direction

## North star

**A premium 2026 animated food fight that reads like a competitive party game, not a dense cinematic render.**

The look is stylized 3D: chunky forms, expressive animation, clean PBR materials, warm cafeteria/market lighting, exaggerated food impacts, and strong player identification.

## Rendering priorities

Spend GPU budget on:

1. character animation and silhouettes;
2. readable projectile trails/shadows;
3. impact VFX;
4. objective lighting/state;
5. selective shadows and contact grounding.

Spend less on tiny geometry, high-frequency texture detail, expensive reflections, dense transparency, and decoration inside the playable field.

## Character language

Target proportions:

- head roughly 25–30% of body height;
- oversized hands and shoes;
- compact torso;
- simple readable limb shapes;
- unique hair/hat silhouette per hero.

At the gameplay camera, identity must survive at approximately 100–150 rendered pixels of character height.

## Eight-player palette

Each player receives a stable accent family (for example blue, green, purple, yellow, orange, red, cyan, pink), but color is reinforced with a player number/icon and shape details. Team affiliation uses secondary UI/ring treatment so two identification systems do not conflict.

## Material language

- Characters: soft stylized PBR with controlled roughness.
- Food: slightly glossier and more saturated than environment.
- Arena floor/walls: lower contrast, restrained reflections.
- Gameplay platforms: simple geometric shapes with subtle emissive edge cues.
- Objective: warm focal lighting and a unique silhouette.

## Effects language

Effects should be large and short-lived.

- Tomato: fast red trail, round projectile shadow, radial red splash.
- Pie: thick cream burst with chunky fragments.
- Banana: bright peel silhouette and pulsing pre-hazard cue.
- Watermelon: heavier debris and floor rumble cue.
- Milkshake: viscous splash with clearly bounded slow area.

Impact VFX peak quickly, then fade. Persistent splats become flatter, dimmer decals and are culled before clutter accumulates.

## Environment

The active arena is visually cleaner than its perimeter. Restaurants, props, signage, dining tables, boxes, and plants create personality around the edge without hiding combat cues.

## Camera/composition

Use an elevated isometric/top-down view with mild perspective. Avoid dramatic depth-of-field during active play. The full eight-player encounter should remain readable without the camera constantly chasing an individual player.

## Quality tiers

Low: reduced shadows/particles/post effects.

Medium: standard shadows, bloom, restrained ambient occlusion.

High: WebGPU-preferred enhanced shadows, particles, AO, material effects, and higher render scale.

Art must remain stylistically coherent at every tier.
