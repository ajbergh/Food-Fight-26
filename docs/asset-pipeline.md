# Asset pipeline

## Toolchain

Recommended production tools:

- Figma: UI, HUD, responsive flows, icon layout.
- Blender: modeling, UVs, rigging, animation, arena blockout.
- Substance Painter (optional): final hero/prop texturing.
- Krita/Photoshop/Affinity: 2D paint, decals, icon cleanup.
- Reaper/Audacity: audio editing.
- Image generation/concept tools: ideation only unless rights/provenance are appropriate for final use.

## 3D pipeline

```text
concept -> turnaround -> gameplay blockout -> review -> final model -> UV/material -> rig -> animation -> GLB export -> texture compression -> runtime validation
```

### Runtime format

- Mesh/rig/animation: glTF 2.0 / binary GLB.
- Textures: KTX2/Basis where supported by pipeline.
- Audio: compressed web-friendly formats with fallback according to browser support.

## Character budgets

Initial guideline per hero:

- 20k–40k triangles body/clothing.
- 5k–10k triangles hair/accessories where justified.
- 1k–4k triangles held food item.
- LODs added only after profiling confirms benefit; do not create unnecessary content complexity.

## Texture strategy

Prefer shared atlases/material families over dozens of unique materials. Typical categories:

- Character material family.
- Food material/atlas family.
- Arena material family.
- VFX decal/flipbook atlas.

Use compressed GPU textures. Avoid shipping full-resolution source PNG/PSD files in runtime bundles.

## Animation set

Minimum production character set:

- idle;
- locomotion/strafe/turn;
- pickup/carry;
- throw and charged/heavy throw;
- dodge;
- hit/flinch;
- slip;
- knockback/spin;
- stun;
- celebration;
- defeat/round result;
- respawn.

Use squash/stretch and procedural secondary motion selectively. Gameplay timing is controlled by authored events/markers that align server action windows with animation.

## Export validation

Automated checks should eventually enforce:

- sane coordinate scale/orientation;
- no unsupported materials;
- texture dimensions within budget;
- expected animation clips present;
- no accidental duplicate materials;
- mesh/texture memory estimates;
- file-size limits.

## Source-control policy

Runtime-ready assets can live in Git when small. Large source `.blend`, layered texture, audio-session, and high-resolution concept files should move to Git LFS or dedicated asset storage before volume grows. Do not casually commit hundreds of megabytes to normal Git history.
