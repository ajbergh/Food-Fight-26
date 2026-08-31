# Multiplayer bot harness

This development tool fills a Food Fight room with simple objective-seeking clients so multiplayer, combat, scoring, and rendering can be exercised without manually controlling eight browser tabs.

Start the game server first, then run:

```bash
pnpm bots
```

Defaults:

- 7 bots;
- `http://localhost:2567` game server;
- 180-second run;
- 30 Hz input cadence matching the authoritative server tick.

Environment overrides:

```bash
BOT_COUNT=4 BOT_DURATION_SECONDS=60 GAME_SERVER_URL=http://localhost:2567 pnpm bots
```

The harness is intentionally not competitive AI. Bots orbit the sundae objective, periodically throw tomatoes, place bananas, and dodge. Its purpose is repeatable load/readability testing and quick smoke validation of the room lifecycle.

For a human-plus-bots test, open one browser client first and leave the default `BOT_COUNT=7`. Because the room capacity is eight, all clients should land in one room while capacity remains available.
