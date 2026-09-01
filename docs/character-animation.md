# Character animation

The first animated-character pass replaces the visible capsule/stacked-primitive chef treatment with an articulated, hierarchical cartoon chef built from lightweight PlayCanvas primitives. Gameplay collision and authoritative movement remain unchanged: the visual character is a presentation layer attached to the existing player entity.

## Goals

- clearly readable human silhouette at the gameplay camera;
- distinct deterministic visual variants across an eight-player room;
- idle, walk, run, dodge/stun-compatible presentation, and overhand food throwing;
- no new network authority or animation-specific simulation state;
- keep the character pass cheap enough to validate motion language before committing to a production rig family.

## Current articulated rig

Each character has separate transforms for torso, head, shoulders, elbows, hips, and knees. Visible geometry includes coat, apron, pants, shoes, hands, facial features, hair, and one of several chef headwear styles. Session IDs deterministically select skin tone, hair, proportions, and headwear so the same connected player does not visually reshuffle during a room lifetime.

The legacy player capsule is still created by the gameplay client for compatibility with the current scene setup, but its render component is disabled by the art layer. Collision remains the custom arcade circle/capsule approximation in `game-core`; visual limbs never become authoritative colliders. The default visible character is the procedural chef; `?skeletalPilot=1` swaps in the audited KayKit-derived technical pilot only after its shared load and animation graph are ready.

## Locomotion

Locomotion is inferred from rendered player displacement, which means local predicted movement and remote interpolated movement drive the same visual system.

Normalized movement speed resolves to:

- **idle** below 0.08;
- **walk** from 0.08 to 0.58;
- **run** at 0.58 and above.

Walk and run use different stride amplitudes, arm swing, cadence, body lean, knee bend, and vertical bounce. The character smoothly rotates toward its travel direction. This deliberately avoids sending animation state over the network.

## Throwing

A throw is a short layered animation with three phases:

1. wind-up — throwing shoulder moves behind the body, elbow loads, torso rotates;
2. release — shoulder drives rapidly forward while the elbow opens and torso crosses through;
3. recovery — upper body returns to locomotion without stopping the legs.

Throw presentation now uses the authoritative projectile owner ID, including banana actions, so crowded melee cannot select the wrong visual thrower. The procedural character and the opt-in skeletal pilot both react to that presentation event without adding animation state to the authoritative protocol.

## Dodge and stun compatibility

The existing dodge squash and stun wobble are still applied to the player root. The articulated model compensates for root scale so normal body proportions remain stable while retaining those whole-character gameplay cues.

## Production rig candidates

The procedural rig is intentionally an intermediate step. It establishes timing, silhouette, camera readability, and animation state requirements before choosing a binary character family.

The approved source for the current pilot is **KayKit Adventurers**. The deterministic Mage derivative demonstrates the browser rig path but is not the final chef art. Other character sources require separate provenance approval before they are treated as production candidates.

A production hero rig should provide at minimum idle, walk, run, dodge/roll, throw, hit/stun, celebration, and defeat clips. Food Fight-specific throw clips should be authored or retargeted in Blender so the release frame aligns with projectile creation.

## Performance targets

For the eventual skinned GLB set:

- one shared humanoid skeleton wherever possible;
- roughly 15k–30k rendered triangles per hero character at primary LOD;
- no more than a small number of materials per character;
- compressed GLB and KTX2 textures;
- animation clips sampled only as densely as needed for the stylized motion;
- eight simultaneously animated characters must remain inside the existing client frame-time and download budgets.
