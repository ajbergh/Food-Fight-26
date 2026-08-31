# Open asset candidates

This note tracks externally sourced art candidates that are compatible with the browser-first production pipeline. A candidate appearing here does **not** mean its files have been incorporated into the repository.

## Kenney Food Kit

- Source: `https://kenney.nl/assets/food-kit`
- Publisher: Kenney
- License: Creative Commons CC0
- Official catalog currently describes the pack as a 3D Food Kit with roughly 200 files.
- Intended use: production food pickups, thrown-food variants, decorative food-court props, and rapid silhouette exploration.

Decision: preferred first external pack to evaluate because its clean stylized language is close to the current art direction and CC0 keeps downstream licensing simple. Inspect the downloaded archive and convert only selected models into optimized GLB/KTX2 production assets.

## Quaternius Ultimate Food Pack

- Source: `https://quaternius.com/packs/ultimatefood.html`
- Publisher: Quaternius
- License: Creative Commons CC0
- Official catalog describes 100+ food/consumable models and supplies FBX, OBJ, and Blender formats.
- Intended use: secondary food variants and shape-language reference where the Kenney pack lacks an item.

Decision: strong fallback/secondary source. Prefer a small curated subset rather than mixing the full pack with another visual language.

## Quaternius Universal Base Characters + Universal Animation Library

- Sources: `https://quaternius.com/packs/universalbasecharacters.html` and the Quaternius Universal Animation Library.
- Publisher: Quaternius.
- License: Creative Commons CC0.
- Base pack: six rigged humanoid base characters, approximately 13k triangles per model, with glTF and FBX exports.
- Animation library: 120+ reusable humanoid clips including multi-direction locomotion, jogging, sprinting, actions, and reactions.
- Intended use: production chef mesh customization in Blender on a common skeleton, followed by retargeted Food Fight-specific throw/hit clips.

Decision: preferred production-rig candidate if we want to own the final chef silhouettes while keeping a mature reusable animation skeleton.

## KayKit Adventurers + Character Animations

- Sources: KayKit Adventurers and KayKit Character Animations from Kay Lousberg / KayKit.
- Publisher: Kay Lousberg.
- License: Creative Commons CC0.
- Formats include GLTF/GLB and FBX; the animation packs provide reusable humanoid movement/action clips.
- Intended use: rapid production-rig evaluation and a possible final low-poly stylized character foundation.

Decision: strong alternate character family. The clean, chunky low-poly proportions are close to the current browser art prototype. If selected, ingest from an authoritative KayKit distribution, preserve source/version provenance, and author a dedicated food-throw animation rather than treating a generic attack clip as final.

## Kenney UI Pack

- Source: `https://kenney.nl/assets/ui-pack`
- Publisher: Kenney
- License: Creative Commons CC0
- Official catalog describes a large general-purpose UI set.
- Intended use: prototyping menu/control widgets only; the in-match HUD should keep the bespoke Food Fight 26 visual language.

## DiscoveringGodot / 6_Food_Fight

See `discovering-godot-food-fight.md`. The MIT-licensed repository remains useful for food-model, SFX, furniture, ammo-refill, bystander-animation, and customization references. Its Godot-native assets require conversion/review before browser use. In particular, its bystander model directory contains separate walking/running pose resources, which reinforces the need for readable locomotion but is not a preferred production character pipeline for this project.

## Intake policy

Before any external binary is committed:

1. pin the source URL and upstream version/commit where possible;
2. save the original license text;
3. record the original filename and destination filename;
4. record whether geometry, textures, audio, or animation were modified;
5. add the incorporated asset to `THIRD_PARTY_NOTICES.md` when attribution/notice is required or useful;
6. optimize runtime copies independently of source archives (GLB, mesh simplification, texture atlasing/KTX2, audio compression);
7. verify that the asset remains readable at the actual gameplay camera before investing in polish.

CC0 assets do not require attribution, but source provenance should still be retained for maintainability.
