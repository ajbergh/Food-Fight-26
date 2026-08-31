# Accessibility

Accessibility is a design constraint from the first prototype, not a polish pass.

## Visual

- Never encode team/player identity by hue alone; pair color with number, icon, silhouette, or pattern.
- Provide color-vision-safe palette presets.
- UI text meets reasonable contrast requirements against dynamic backgrounds.
- Allow HUD scale adjustment.
- Avoid essential information conveyed only by rapid flashing.
- Provide reduced screen-shake and reduced motion/VFX options.

## Controls

- Keyboard and gamepad remapping.
- Toggle/hold alternatives where practical.
- Avoid simultaneous multi-key chords for core actions.
- Aim sensitivity options.
- Support left-handed mouse layouts through remapping.

## Audio

- Separate master, music, effects, voice, and UI volume.
- Important gameplay sounds have visual equivalents.
- Subtitle/caption approach for spoken announcer content if added.

## Cognitive/readability

- Small action vocabulary.
- Consistent icons for item classes and status effects.
- Clear objective text and progress state.
- Avoid excessive floating numbers.
- Tutorial steps require demonstration rather than timed reading.

## Motion comfort

The default camera is stable and does not rotate continuously. Camera shake is brief, localized, and adjustable to zero. Avoid large full-screen distortion from hits.

## Prototype implementation status

The current game client implements a first accessibility/readability slice rather than claiming complete accessibility coverage.

Implemented now:

- persistent `compact`, `normal`, and `large` HUD scales, with the `H` shortcut;
- persistent reduced-motion override, with the operating-system reduced-motion preference used as the initial default and `R` as the shortcut;
- reduced-motion suppression of full-screen action flashes and HUD transition animation;
- persistent default/color-safe team palette toggle with the `P` shortcut;
- the color-safe preset uses a high-separation blue/orange pair and updates both HUD team cues and PlayCanvas objective/player team materials;
- blue-team diamond and red-team circular shape markers reinforce team affiliation independently of hue in the scoreboard and character treatment;
- semantic status/live-region treatment for match banners, objective changes, and event toasts;
- text alternatives for emoji-only inventory cues;
- 44 px minimum presentation-control targets with visible keyboard focus treatment;
- responsive HUD layout for phone/tablet widths, short landscape viewports, and display safe areas;
- increased-contrast and forced-colors CSS handling for platform/browser accessibility modes;
- visual equivalents remain present for important prototype audio cues such as objective state, combat action feedback, and match events.

Still required before an accessibility-focused external playtest:

- formal color-vision simulation/device validation of every player/team cue and production-art material choice;
- keyboard/gamepad remapping plus left-handed pointer layouts;
- aim sensitivity and any future hold/toggle alternatives;
- separate master/music/effects/voice/UI volume controls once production audio replaces the synthesized prototype layer;
- captions/subtitles if spoken announcer or voice content is introduced;
- screen-reader and keyboard-only testing of lobby/settings flows once the lobby becomes interactive;
- device-level testing with browser zoom/text scaling, mobile assistive technology, and representative high-contrast modes.
