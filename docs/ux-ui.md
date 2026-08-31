# UX and UI

## UX goal

A first-time player should get from URL to meaningful control with minimal friction and should understand the match state without reading a manual.

## Primary flow

```text
Landing -> Play -> display name / account -> party/lobby -> matchmaking -> loading -> match -> results -> rematch/lobby
```

Guest play should be supported during prototypes. Account requirements should not block early playtesting.

## In-match HUD

Top center:

- blue team score;
- timer;
- red team score;
- compact objective state.

Top/edge roster:

- eight player markers/portraits or compact status chips;
- team color plus unique player number/icon;
- disconnected/respawning state.

World-space:

- player nameplate/marker;
- held-item indication;
- aim/throw telegraph where needed;
- pickup markers only within useful proximity.

Bottom/corner:

- held item and cooldown;
- objective helper text during onboarding;
- network-quality warning only when actionable.

## Visual hierarchy

1. Player characters.
2. Incoming projectiles and hazards.
3. Objective ownership/contestation.
4. Pickups.
5. Scoring feedback.
6. Decorative effects.

If a decorative effect competes with categories 1–4, simplify the effect.

## Responsive web behavior

- Canvas fills available viewport.
- HUD uses safe-area aware CSS and scales independently of 3D render resolution.
- Lobby/site UI is regular HTML/CSS/React for accessibility and responsiveness.
- Minimum supported gameplay viewport should be defined after testing; do not silently squeeze desktop HUD into unusable sizes.

## Onboarding

First match may display contextual hints:

- Move.
- Pick up tomato.
- Throw toward opponent.
- Enter/hold sundae zone.

Hints disappear after demonstrated behavior and remain available in settings/training.

## Results screen

Show team result first, personal contribution second. Recommended personal stats:

- objective time;
- hits landed;
- slips caused;
- funniest/highest-impact moment later if telemetry supports it.

Do not over-index on K/D-style statistics in a game designed around objective comedy.
