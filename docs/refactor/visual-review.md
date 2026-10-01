# Visual regression review flow

## Purpose

Playwright project **`visual`** captures component chrome screenshots. Baselines live next to the spec:

`packages/blora-design/tests/browser/visual.spec.ts-snapshots/`

## Commands

```bash
# Requires build (tokens + component CSS in dist)
pnpm --filter @bloret-crew/blora-design run build

# Update baselines after intentional visual change (review diffs!)
pnpm exec playwright test --project=visual --update-snapshots

# CI / local check against baselines
pnpm test:visual
```

## Review rules (Agents.md)

1. Do **not** bulk-update snapshots without eye-check.
2. Prefer token/CSS intentional deltas documented in `pending-visual-review.md` or `known-differences.md`.
3. Failures: open the HTML report / `-snapshots` diff; fix CSS or accept with review note.
4. Scope today: **smoke set** (button row, table chrome, invalid field) — expand matrix in RC.

## 2026-08-11 Showcase full catalog review

- `examples/showcase-v2/` now covers all 87 core manifest components.
- Reviewed actual headless-Chrome renders for the desktop catalog, mobile sidebar, Accordion,
  Collapse HTML panel, palette picker, FAB, Statistic, Table, Dialog, and Select.
- FAB review confirms the official static docs modifier keeps the control 56×56, circular, centered,
  and contained by the Preview; the default floating variant remains 56×56 on desktop and 48×48
  below the 560px breakpoint.
- The catalog routes and mounts every component in both desktop and mobile Chromium without page
  errors; the active sidebar item is kept visible when routing and when opening the mobile drawer.
- Accepted snapshot changes are limited to the expanded catalog shell plus the representative
  component panels listed above.

## CI

`pnpm test:visual` runs project `visual` only (not the full interaction suite).
Optional: wire into CI as non-blocking or required after baselines stabilize.

## 2026-10-01 Migration quality closeout

- Reviewed the actual Chromium renders of the 2.1 component-state sheet in light and dark mode:
  distinct primary/danger buttons, semantic Tags and Alerts, pills Tabs, avatar markers, Copy,
  compact Card headers and disabled form controls.
- Added 16 page-pattern snapshots: resources, table/list, settings and loading/empty/error states,
  each in light/dark mode at desktop and 390px mobile widths. Every capture was inspected before
  accepting its baseline. The mobile table/list review caught and fixed squeezed metadata.
- Pattern tests check horizontal containment at the real viewport size before using a taller
  capture viewport of the same width to paint the entire long pattern. The floating sidebar
  launcher is excluded only from these component crops; the existing shell snapshots cover it.
- The existing palette-menu baseline was checked against its actual image and diff. Its accepted
  update is limited to Chinese font rendering; palette geometry, swatches and semantic colours
  remain covered by the existing tests.
- No screenshot-difference tolerances were widened. Intentional layout changes are recorded in
  `known-differences.md`.
