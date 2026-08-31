# Game modes

## Mode 01 — Sundae Control

**Status:** vertical-slice mode.

Two teams fight for a circular control zone surrounding a giant sundae. A team scores only while it occupies the zone uncontested.

Recommended defaults:

- 4v4.
- 180-second regulation.
- First to 100 score or highest score at time expiration.
- Score rate tuned so one uninterrupted capture cannot end the round too quickly.
- Tied/contested overtime as described in the GDD.

Why this mode first: it naturally pulls all eight players toward shared encounters, creates predictable camera composition, and makes map-balance testing straightforward.

## Candidate 02 — Dessert Dash

Carry a fragile dessert from a pickup station to your team's delivery counter. Being hit can force a drop. Multiple short delivery routes should exist to avoid a single choke point.

Do not implement until movement, throwing, and pickup/drop authority are mature.

## Candidate 03 — Pantry Panic

Free-for-all score attack. Food stations activate in rotating zones and players score for clean hits/streaks. Suitable for lower player counts and warm-up playlists.

## Candidate 04 — Cafeteria Cleanup

Teams compete to cover opposing scoring tiles with their sauce color while cleaning their own. This uses food splats as gameplay rather than decoration and therefore requires stricter visual-design rules.

## Playlist guidance

The launch-quality game should prefer a small number of excellent modes over a large queue menu. Keep matchmaking population concentrated. Limited-time modes can vary item rules or arena modifiers without fragmenting permanent queues.
