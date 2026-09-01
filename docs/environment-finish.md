# M6 Commercial Environment Finish

## Goal

Push the food-court arena from a readable pre-alpha shell into a memorable, commercially presentable map without changing authoritative collision, match topology, pickup placement, or objective rules.

## Visual principles

1. **Gameplay first.** Richness belongs on the perimeter, upper walls, concourses, storefronts, and presentation-only layers. The central combat lanes remain uncluttered.
2. **Large shapes before micro-props.** Storefront masses, menu boards, hanging wayfinding, floor bands, and the objective plinth should read at the default gameplay camera before small details matter.
3. **No texture dependency for this pass.** The finish layer uses stylized geometric forms and emissive materials so it remains deterministic and provenance-free while production GLB art is still being sourced.
4. **Quality-tier aware.** Medium contains the architectural identity required for the map to feel finished. High adds ceiling rhythm, food displays, condiment islands, secondary planters, and extra hero accents.
5. **Performance bounded.** New decorative renderers do not cast or receive shadows, and this pass does not introduce additional dynamic lights.

## Added environment language

- food-hall proscenium and upper trim
- vendor-specific menu boards and food icon marks
- hanging wayfinding signs
- framed side-wall poster/lightbox treatments
- broad floor composition bands and inlays
- condiment/service islands outside core lanes
- counter food displays
- ceiling ribs and luminous panels on High
- layered objective hero plinth and radial beacons
- richer perimeter planter clusters
- foreground kick-light strips and architectural lip

## Production-art migration

The geometry in `environmentFinish.ts` is a presentation scaffold, not the long-term asset target. As licensed/CC0 production meshes enter the asset pipeline, replace grouped geometric silhouettes one cluster at a time while preserving:

- world-space footprint
- visual hierarchy
- quality-tier ownership
- material contrast
- non-authoritative status
- draw-call and first-play asset budgets

Recommended replacement order:

1. vendor storefront fronts and signs
2. service counters / condiment islands
3. hero objective plinth
4. planters and perimeter furniture
5. ceiling fixtures and wall dressing

## Acceptance criteria

- default camera reads as a coherent indoor food hall rather than a floating arena
- vendor zones are visually distinct without relying on text
- objective remains the strongest visual focal point
- pickups and players retain higher contrast than background dressing
- no authoritative collision changes
- TypeScript checks, unit tests, browser E2E, performance budget, container smoke, and room benchmark remain green
