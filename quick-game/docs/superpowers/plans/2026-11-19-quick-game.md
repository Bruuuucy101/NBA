# Quick Game Implementation Plan
> Execute inline with superpowers:executing-plans. User authorized direct implementation of the preceding detailed brief.
**Goal:** Local Chinese Quick Game with actual NBA 2026-2027 full roster snapshots.
**Architecture:** Dependency-free static ES modules, offline Node/curl data pipeline, deterministic possession engine. UI consumes generated model JSON; no raw API requests from browser.
**Tech Stack:** Node 24, HTML/CSS/JS, node:test, Playwright (existing installation).
**Spec:** activity/requirements.md and approved conversational brief.
## Global constraints
30 teams, target 2026-2027 REGULAR, no silent season substitution; 4x720s plus 300s overtime; local delivery only; no credentials bundled.
## Review focus
Missing stats use explicit estimates; duplicate player IDs and membership conflicts reported; corrupt preferences recover; repeat start cannot create duplicate timers; clock and box scores conserved across overtime.
## Task 1 — data
- [ ] Write failing tests for missing stats, deterministic ratings, deduplication and wrong-season rejection in tests/data.test.mjs.
- [ ] Implement scripts/sync.mjs (resumable cached serial requests, 200ms gap, bounded retries) and h5/model.mjs buildDataset(snapshot).
- [ ] Fetch raw snapshots to data/raw; generate h5/data/league.json and completeness.json; run node --test tests/data.test.mjs.
## Task 2 — simulation
- [ ] Write tests for replay determinism, score/stat/minute conservation, overtime, tactical effects and finish idempotence.
- [ ] Implement h5/engine.mjs exports createGame(home,away,seed), step(game), finish(game), setTactics(game,side,patch). Simulation owns all state and RNG; UI owns playback only.
- [ ] Run node --test tests/engine.test.mjs and batch 200 games.
## Task 3 — interface
- [ ] Implement h5/index.html, style.css, app.mjs: team setup, rosters, tactics, match, charts, boxscore, data report dialog.
- [ ] Use actual dataset; store preferences only with guarded localStorage.
- [ ] Browser verify desktop/mobile, full flow, repeated clicks, changed tactics, no overflow or console exceptions. Save screenshots.
## Task 4 — delivery
- [ ] Review code, run whole test suite, document formulas and data caveats.
- [ ] Serve locally; provide launch script and source zip without credentials or node_modules.
