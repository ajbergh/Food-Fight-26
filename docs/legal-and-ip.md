# Legal and IP design constraint

This is a product-development note, not legal advice.

## Working title

`Food Fight 26` is a working project title. Before commercial release, perform appropriate trademark/title clearance and determine whether a licensed relationship is required or desirable.

## Inspiration vs. protected material

The project may study classic arcade design ideas such as food-throwing, arena movement, pickups, and slapstick objectives. Do not assume that historical age makes specific expression free to use.

Do not ship or copy without documented rights:

- Atari or third-party logos/wordmarks;
- original character artwork/sprites;
- original source code;
- original sound/music;
- exact protected screen art/level layouts;
- packaging/manual text;
- marketing screenshots as production assets.

Create original characters, environments, UI, audio, names, writing, and visual assets unless licensed materials are explicitly documented.

## AI/concept assets

Generated concept images are direction-finding material. Before using any generated asset directly in production or marketing, confirm provenance, applicable tool terms, brand/IP review, and consistency with the final art pipeline. Prefer rebuilding important production assets as controlled 3D/2D source work.

## Repository hygiene

Every imported third-party asset must have a source/license record in `assets/third-party/manifest.json`. CI runs `pnpm assets:audit` to prevent runtime assets from referencing unknown or unapproved sources and to verify the committed derivative against its recorded SHA-256.

A publisher page changing after an earlier release is a provenance-review event, not something to infer around. Preserve the source/license evidence used for the decision, place ambiguous sources on hold, and do not import from them until the applicable terms are explicitly resolved. The manifest may therefore include candidate sources that are intentionally blocked from runtime use.

The manifest is an engineering control, not a substitute for legal review. Before commercial release, re-review all third-party production sources, required notices, redistribution constraints, trademarks, and any license terms that changed during development.
