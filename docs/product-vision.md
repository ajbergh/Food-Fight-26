# Product vision

## One sentence

**Food Fight 26 is an instantly understandable, eight-player browser arcade brawler where throwing food, dodging hazards, and contesting compact objectives creates short rounds of readable slapstick chaos.**

## Product pillars

### 1. Click and play
A player should be able to open a link, choose a display name, and enter a match without a heavyweight install. The web is the primary platform, not an export target.

### 2. Readable chaos
The screen can be energetic without becoming visually confusing. Every player, projectile, hazard, objective, and hit should remain identifiable during an eight-player fight.

### 3. Physical comedy over violence
The emotional tone is slapstick. Characters squash, slip, get covered in sauce, spin, bounce, and recover. The game should feel mischievous rather than aggressive.

### 4. Skill in movement and timing
The controls are intentionally small: move, aim, pickup/throw, dodge/interact. Depth comes from positioning, projectile timing, hazard placement, map knowledge, and team coordination.

### 5. Short-session multiplayer
Target round length is three to five minutes. A player should be able to understand why a team won and immediately want a rematch.

## Target audience

Primary: players who enjoy approachable multiplayer party games, arcade sports, arena brawlers, and games that can be shared with a URL.

Secondary: friend groups, office/school Chromebook users where appropriate, streamers, and players on lower-power laptops who are underserved by heavyweight multiplayer clients.

## Initial platform targets

- Desktop Chrome, Edge, Firefox, and Safari on current supported releases.
- Windows and macOS are Tier 1.
- Linux/Chromebook is Tier 2 but should remain playable.
- Tablet is a later target after controls and performance are validated.
- WebGPU is preferred when available; WebGL2 remains the compatibility path.

## Business-model assumption

The vertical slice has no monetization. If the game validates, favor cosmetic monetization that does not alter competitive outcomes: character outfits, food trails, victory poses, emotes, banners, and seasonal arena dressing. Avoid purchasable power.

## Success criteria for the vertical slice

The project should not progress to expensive content production until playtests show:

1. New players understand movement, pickup/throw, and the objective within one match.
2. Eight-player matches remain legible.
3. Hits feel responsive at realistic internet latency.
4. Losing still produces funny moments.
5. Players voluntarily request a rematch.
6. Browser startup and performance meet the documented budgets.

## Non-goals for the first slice

- Ranked matchmaking.
- Battle pass/store implementation.
- Large progression systems.
- More than one polished arena.
- More than a minimal food-item set.
- Photorealistic graphics.
- Destructible environments.
- Fully simulated rigid-body physics for all gameplay.
