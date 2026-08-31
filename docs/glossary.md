# Glossary

**Authoritative server** — Server process that determines valid gameplay outcomes rather than trusting the browser.

**Client prediction** — Local simulation of the player's own input before authoritative confirmation to reduce perceived latency.

**Reconciliation** — Correcting predicted client state to authoritative state and replaying unacknowledged inputs.

**Interpolation buffer** — Small time delay used to render smooth remote-player movement between received snapshots.

**Semantic event** — Compact network event describing a gameplay result such as a tomato hit; presentation effects are generated locally.

**Graybox** — Simple geometry/placeholder assets used to validate play before final art.

**Sundae Control** — Initial 4v4 objective mode centered on control of the sundae zone.

**Gameplay collision mesh** — Simplified collision representation separate from detailed visual geometry.

**First-play budget** — Compressed content needed before a new player can meaningfully enter/play the first match.
