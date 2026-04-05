# AI Games — MVP Scope (2D Platformer)

## Goal
Ship a playable vertical slice that proves the core loop is fun and stable.

## Core Gameplay (MVP)
- Player can run, jump, and land with reliable controls.
- One complete level with start, obstacles, collectible, and finish goal.
- Basic fail/retry loop (fall/death -> restart from checkpoint or level start).

## Content (MVP)
- 1 playable character
- 1 tileset/theme
- 5–8 obstacle patterns
- 1 enemy type (optional if time allows)

## UI/UX (MVP)
- Start menu (Play, Quit)
- Pause and restart
- Simple HUD (lives/attempts or timer)
- Win/lose feedback

## Technical Targets
- Stable 60 FPS target on desktop test hardware
- Deterministic player physics settings documented
- Input handling abstracted for keyboard/controller extension

## Definition of Done
- New player can complete level without debugging tools.
- No blocker bugs in core movement, collisions, or level completion.
- Build/run instructions documented for team handoff.
