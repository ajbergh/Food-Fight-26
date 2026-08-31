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

## Third-party asset intake

Third-party runtime art must be traceable to an approved source before it enters the game bundle. The repository-level provenance record is `assets/third-party/manifest.json`, and CI runs `pnpm assets:audit` on every pull request.

Each source record captures a stable source ID, publisher, source URL, license identifier/evidence URL, verification date, approval state, and review notes. Each imported runtime derivative must additionally record its repository path, source ID, asset kind, first-play budget bucket, per-file byte ceiling, and SHA-256 digest.

Runtime derivatives live under `apps/game-client/public/assets/third-party/`. The audit intentionally accepts production-oriented formats only:

- models: `.glb` or `.gltf`;
- textures: `.ktx2` or `.basis`;
- audio: `.ogg`, `.mp3`, or `.webm`.

Do not commit `.blend`, `.fbx`, `.obj`, layered paint files, source WAV sessions, or complete downloaded packs into the runtime directory. Keep source archives outside normal Git history or in approved LFS/asset storage when preservation is required.

### Current food-pack candidates

| Source | Status | Evidence reviewed 2026-08-31 | Decision |
|---|---|---|---|
| Kenney Food Kit | approved | Publisher page identifies the 3D pack as Creative Commons CC0 | Suitable for controlled production-asset evaluation; import only selected optimized derivatives |
| Quaternius Ultimate Food Pack | hold | Pack page labels the pack CC0, while the publisher's general license page now presents QAL v1.0 dated 2026-08-28 | Do not import until the applicable terms/provenance for this pack are explicitly resolved |

A source being listed in the manifest does not mean its whole pack should be copied into the repository. Approval permits evaluated derivatives; it does not waive performance, style, or source-control constraints.

### Intake workflow

1. Re-check the publisher/source page and applicable license terms at intake time.
2. Add or refresh the source record in `assets/third-party/manifest.json`.
3. Download the source archive outside the repository.
4. Select only assets needed for a concrete gameplay/art hypothesis.
5. Normalize scale/orientation/materials in Blender as needed, export GLB/glTF, and compress textures to KTX2/Basis.
6. Place runtime derivatives under `apps/game-client/public/assets/third-party/<source-id>/`.
7. Add manifest asset records with SHA-256, first-play bucket, and explicit `maxBytes` review limits.
8. Run `pnpm assets:audit`, `pnpm build`, and `pnpm perf:budget` before visual/performance review.

The audit enforces provenance integrity and first-play asset ceilings. It does not substitute for visual inspection, draw-call analysis, GPU memory measurement, or browser frame-time profiling.

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

The current asset audit already enforces source approval, runtime path/format restrictions, file existence, per-file byte ceilings, SHA-256 integrity, and first-play byte buckets. Geometry/material/animation introspection remains a follow-up once production GLB files are present.

## Source-control policy

Runtime-ready assets can live in Git when small. Large source `.blend`, layered texture, audio-session, and high-resolution concept files should move to Git LFS or dedicated asset storage before volume grows. Do not casually commit hundreds of megabytes to normal Git history.
