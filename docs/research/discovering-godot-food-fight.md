# DiscoveringGodot Food Fight repository review

Source reviewed: `DiscoveringGodot/6_Food_Fight` (GitHub), current `master` commit `bc328c51576873f60306bcad0912fc836a095625` at the time of review.

## License

The repository declares the MIT License, copyright 2018 Discovering Godot. Any code or asset copied into Food Fight 26 must retain the upstream copyright and MIT permission notice in our third-party notices.

## Useful ideas and candidate assets

The project is a third-person 3D food-throwing game and contains a useful prototype asset set. In particular:

- a generic projectile scene/template;
- food ammunition variants including burger, cookie, cupcake, hotdog, ice cream, milkshake, soda, and doughnut;
- furniture and architecture sets that may be useful as blockout references for cafeteria/food-court maps;
- projectile/hit audio and other SFX candidates;
- an ammo refill system, which informed Food Fight 26's first server-authoritative respawning food pickup pads;
- character customization and runtime material/texture swapping examples;
- life/status UI patterns and world-space status displays.

## Integration decision

Do not directly import the Godot `.mesh`/`.tscn` assets into the browser client. The production runtime is PlayCanvas/glTF, so assets must be converted to GLB/glTF and visually/technically reviewed before inclusion. For early milestones we will keep procedural PlayCanvas geometry and selectively port or recreate upstream MIT assets only when they save meaningful production time.

Before any upstream binary asset is committed, add its original path, upstream commit SHA, author/project, license, any modifications, and destination path to `THIRD_PARTY_NOTICES.md`.
