# Copilot instructions for rennzokugiri

## Project overview

This repository is a small, single-page browser game built with plain HTML, CSS, and JavaScript. There is no framework, bundler, or backend service; the app runs entirely in the browser.

- `index.html` defines the page shell, HUD, overlay, canvas, and touch controls.
- `script.js` owns the game loop, input handling, AI racers, lap logic, collision behavior, and HUD updates.
- `style.css` contains the neon arcade styling, responsive layout, and the overlay/touch control visuals.

The codebase is intentionally compact and centered on a single gameplay loop. Any change to the race logic or UI should be validated in the browser context rather than through a build pipeline.

## Build, test, and lint commands

There are no package manifests, test runners, or lint configuration files in this repository.

- No automated build step exists.
- No automated test suite exists.
- No lint command exists.

To preview the project locally:

```bash
cd /workspaces/rennzokugiri
python3 -m http.server 8000
```

Then open `http://localhost:8000` in a browser. This is the practical equivalent of a local validation command for this static site.

## High-level architecture

The app is a canvas-based racing game and uses a simple state-driven render loop:

- `draw()` renders the background, road, opponents, and player car.
- `update(delta)` advances the simulation, applies acceleration/braking/steering, resolves collisions, and updates lap/time state.
- `requestAnimationFrame(frame)` drives the loop continuously.
- `state` stores the live runtime values such as `running`, `distance`, `speed`, `steer`, and `timer`.
- `racers` stores the opponent metadata and progress values used for drawing and placement.

Because the project is not modularized, behavior is intentionally centralized in a few functions and global DOM references. Keep that structure in mind when editing gameplay or UI.

## Key conventions

- This is vanilla browser code; prefer DOM APIs and the existing canvas API instead of introducing a framework.
- Keep DOM IDs stable. The script relies on specific selectors such as `#game`, `#overlay`, `#start-button`, `#clock`, and `#position`.
- The existing input model is centralized in the `controls` Set plus the `keyMap` table. Keyboard and touch actions are both mapped into the same control names.
- The race state is not spread across many modules; use the shared `state` object and update it through the existing functions (`updateHud`, `startRace`, `finishRace`, `update`).
- Visual style is intentionally cohesive: dark neon UI, Japanese labels, and a “grand prix” arcade aesthetic. Preserve the existing tone when changing text or styling.
- The game uses a responsive canvas with a fixed aspect ratio and a mobile touch-control layer. Keep the mobile and desktop presentation in sync.

## Editing guidance

- Prefer surgical edits in `script.js` and `style.css`; do not add a build, API, or framework layer unless the project intentionally grows.
- When changing gameplay tuning values, keep the current design assumptions in mind: `totalLaps`, `lapLength`, `maxSpeed`, and the `racers` properties are intentionally balanced around a short arcade race.
- If you add new HUD elements or overlay text, keep the existing DOM ID contract stable so the game loop continues updating them.
- For UI or copy changes, preserve the existing Japanese in-game language and the neon branding unless the request explicitly changes that behavior.
