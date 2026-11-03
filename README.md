# WoW Forever — Rogue Talent Builder

A talent calculator for the WoW Forever Rogue, updated for the **November 2 beta patch**.
Plain static site — no build step, no dependencies.

Features: Nov 2 patch / pre-patch toggle, patch-change highlights and per-talent patch
notes in tooltips, prerequisite arrows, and shareable build links (the URL updates as you
spend points — use **Copy build link**).

## Data

- **Pre-patch base** (`BASE_TREES` in `js/data.js`): WoW Forever beta client data
  (build 1.60.1.70753), as published on [foreverchanges.pro](https://foreverchanges.pro/talents/rogue).
- **Nov 2 patch** (`PATCH` in `js/data.js`): a diff on top of the base, transcribed from
  `rogue-patch-nov2.txt`. The patch notes give rows but not columns, so columns for moved/new
  talents and a few prerequisite changes are best guesses — each is flagged with `assumed`
  and shown in-app.

To add a future patch, write another diff object shaped like `PATCH` and apply it with
`applyPatch` in `js/app.js`.

## Layout

| Path | Purpose |
| --- | --- |
| `index.html`, `css/style.css` | Page shell and styles |
| `js/data.js` | Talent data (base tree + patch diff) |
| `js/talents.js` | Pure rules: patch application, validation, point rules, build links |
| `js/app.js` | Rendering, input, tooltip, URL sync |
| `test/talents.test.js` | Tests for data and rules |

## Develop

```sh
npm start   # serves on http://localhost:8000 (ES modules need http://, not file://)
npm test    # node --test, Node 18+
```

Deployed with GitHub Pages from the `main` branch root.
