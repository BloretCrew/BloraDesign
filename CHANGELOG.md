# Changelog

## 2.1.0 (unreleased)

Focus: make Blora itself more consistent and make migrations by other projects (and their AI agents) come out right the first time.

### Added

- `npx blora-lint [paths]`: consumer lint CLI shipped with the package. Reports unknown/invented tokens and classes, authored Composite CE internals, undeclared attributes and invalid variant values, hard-coded colours, dark-mode overrides, unlayered global CSS that overrides components, app CSS restyling Blora classes, bare native controls, glyph/emoji icons, nested cards, native `alert`/`confirm`, inline handlers, 1.x APIs and `shadowRoot` access.
- The package now ships `llms.txt` and an offline copy of the rules in `dist/docs/` (page patterns, migration standard, design standard, guide, framework notes).
- `docs/patterns.md`: composition rules (CSS layers, token cheat sheet, layout primitives, surface levels, spacing rhythm, status and button hierarchy) and ten copy-ready page patterns; the showcase renders them in a new 页面范式 group.
- `hydrateIcons()` / `observeIcons()`: `data-icon` on `.blora-button`, `.blora-badge` and empty placeholders is filled automatically by `auto` and `Blora.autoDefine()`, including content rendered later by frameworks.
- Curated icons: `bell`, `circle-x`, `download`, `external-link`, `filter`, `link`, `lock`, `log-out`, `refresh-cw`.
- Tag `data-variant="danger"`; Card `.blora-card__header`, `.blora-card__desc` and `data-size="sm"`.
- `<blora-field>` adopts an authored `<input>`/`<textarea>` child instead of replacing it, keeping its `type`, `name`, `autocomplete` and other attributes.

### Changed

- Coral `danger` is now brick red (`#AF4A3F`, dark `#E0715B`) so destructive actions no longer look like the primary colour; the shared light `warning` is amber `#8C6429` across coral, dusk, graphite, circuit and indigo.
- Tag and Alert semantic variants use visible tints; status icons share one circled Lucide family.
- Stack spacing lives in the utilities layer and wins over component margin resets; fields no longer double the spacing of stacks and grids.
- Buttons follow their container's cross-axis alignment (fixed size already prevents stretching).

### Fixed

- Pills Tabs: the sliding indicator no longer covers the selected label.
- Markdown keeps its rendered content when a framework or the showcase moves the element.
- Avatar badges and presence dots stay anchored to the avatar in stretched rows.
- Navbar links never wrap mid-word; disabled Select matches disabled Input; disabled Textarea is not resizable; square icon buttons look square.
- Contrast: Copy action icons, default avatar initials and statistic labels meet WCAG AA/non-text thresholds.
- Documentation: real token names in the design standard; every migration example uses the real component API and is now executed by a browser gate and the linter.
- Showcase: opening the mobile sidebar reveals the current route after WebKit's focus scroll settles.
- Mobile List rows keep titles and descriptions readable when avatars, status badges and actions share a row; controls wrap instead of squeezing the text.

## 2.0.8

### Added

- Added native input attribute forwarding to `blora-field` for autocomplete, input mode, accessible labels and mobile keyboard semantics.

## 2.0.7

### Fixed

- Included the migration feedback improvements: Field accessibility associations and the blocking theme boot helper.

## 2.0.6

### Added

- Added `data-size="sm"` for compact `.blora-input` fields.

## 2.0.5

### Added

- Added native masked Copy support with a reveal button; masked values remain fully copyable while hidden.

## 2.0.4

### Fixed

- Fixed Steps layout with long copy: equal flex columns no longer collapse under `white-space: nowrap`, step spacing uses margins so every column keeps the same width, and the narrow-container vertical layout actually applies (the container query previously could not restyle its own container).

## 2.0.3

### Changed

- Removed the unused Lotus theme; the theming add-on now ships six focused presets.

## 2.0.2

### Fixed

- Fixed dark-mode theme switching so selected palettes are not overridden by the generic dark token set.

## 2.0.1

### Fixed

- Added top placement and custom trigger support to Dropdown.
- Added icon-only Palette Picker triggers.
- Aligned BBBS profile, theme, color-scheme and notification controls.
- Changed active Sidebar Navigation links to use theme-colored text without a resting background; hover still shows the surface background.
- Added Cascader-based post target selection to the BBBS replica.

Beta follows a defect-first cadence. Public stable-core exports are frozen from `2.0.0-beta.0`; beta contracts and explicitly experimental surfaces may still change with migration notes.

RC closeout on 2026-08-27: Firefox and WebKit full browser suites passed 87/87 each; npm consumer, CDN, CSP, SSR import and rollback rehearsal evidence is recorded in `docs/refactor/rc-release-rehearsal.md`.

## 2.0.0

### Stable release

- Promoted the RC.0 line to the stable `2.0.0` release.
- Published the core package and six add-ons with npm `latest` pointing to `2.0.0`.
- Completed the final acceptance: Chromium, Firefox, WebKit and owner-performed Safari checks; npm consumer; CDN; CSP; SSR; package exports; accessibility and visual gates. GitHub Actions Release run `33082759486` passed.

## 2.0.0-rc.0

### Release candidate

- Unified the core package, six add-ons and internal token workspace on `2.0.0-rc.0`.
- Completed and published the RC browser matrix: Firefox 87/87 and WebKit 87/87 on Windows Playwright; npm `rc` now resolves all seven public packages to `2.0.0-rc.0`.
- Kept the public npm release path on the `rc` dist-tag during the release-candidate rehearsal.

### Fixed

- Prevented a closed Palette Picker menu from expanding scroll containers, added viewport-aware vertical flipping and height clamping, stopped its Chinese trigger label from being vertically clipped, made sticky Sidebar Layouts reject horizontal overflow, and restored Blora scrollbar styling in the BBBS consumer example.
- Raised semantic Tag, Warning Badge, Alert, Sidebar Navigation and Thread composer text contrast to WCAG 2.2 AA across all six themes in light and dark modes; raised Search and BBBS content icon contrast to the WCAG non-text 3:1 threshold; added component-level, real-page text and SVG contrast gates.
- Turned the Thread comment reaction control into a growing capsule so reaction counts no longer overflow the fixed circle, and wrapped the BBBS replica comment stream in the comment-stream Timeline rail.
- Switched the BBBS replica feed filter to the Segmented control and raised the Segmented inactive label contrast to WCAG 2.2 AA across all six themes, driven by the real BBBS page text gate.
- Stopped the BBBS replica feed items from drawing a thick ring on pointer focus, inlined the keyboard focus ring so the feed list's clipped edges no longer cut it off, carried the first/last feed cards' rounded corners onto the link so the focus ring follows the curve, inlined the Sidebar Navigation and Segmented control focus rings so they are not clipped inside a scrolling sidebar aside or a clipping pill, and made the Navbar brand focus ring circular when the title is hidden (icon-only).
- Made the Theme palette picker menu a top-layer popover that opens adjacent to its trigger on every breakpoint and is not clipped by a transformed ancestor such as the mobile drawer; clamped it inside the viewport horizontally on narrow layouts, and aligned the BBBS replica sidebar background with the showcase page-shell look.

## 2.0.0-beta.1

### Released packages

- `@bloret-crew/blora-design@2.0.0-beta.1`
- `@bloret-crew/blora-design-markdown@2.0.0-beta.1`
- `@bloret-crew/blora-design-thread@2.0.0-beta.1`
- `@bloret-crew/blora-design-qrcode@2.0.0-beta.1`
- `@bloret-crew/blora-design-effects@2.0.0-beta.1`
- `@bloret-crew/blora-design-layout@2.0.0-beta.1`
- `@bloret-crew/blora-design-theming@2.0.0-beta.1`

npm dist-tag: **`beta`**

### Highlights since Beta.0

- Added core i18n with `en` and `zh-CN` locale packs, document-language detection and live locale refresh; framework-generated chrome no longer hardcodes a language.
- Unified modal overlays under `OverlayController`: slotted focus trapping, scroll locking, Escape/focus return, top-layer behavior and leave-motion teardown across Dialog, Command Palette, Tour, Drawer and image preview.
- Replaced the QR add-on's simplified byte-only path with an ISO 18004 encoder for versions 1–40, levels L/M/Q/H, numeric/alphanumeric/byte/kanji segmentation, DP-optimal packing and optional ECI; fixed finder separators and both secondary format strips against a reference implementation.
- Extended form-associated Custom Element support to Range, Slider, Search, Upload, Tags Input and OTP, including browser FormData coverage.
- Added `<blora-affix>`, `<blora-anchor sync-hash>` and `<blora-markdown>` public hosts while keeping their service APIs.
- Fixed Showcase routing, short-page scroll reset, sticky-sidebar momentum, panel-switch flashes and the full 30-snapshot visual baseline.
- Hardened Command Palette and Tour motion, viewport coverage and spotlight geometry; fixed Speed Dial rebinds and the Thread composer segmented-style tab indicator.
- Fixed BackTop visibility, honest copy failures, reduced-motion text effects, Firefox sticky-header scroll locking, WebKit interaction differences and add-on bundle duplication.
- Rewrote `docs/framework.md` for 2.0 and synchronized the migration, browser, accessibility and release-tracking documents.

### Install

```bash
pnpm add @bloret-crew/blora-design@beta
# or pin
pnpm add @bloret-crew/blora-design@2.0.0-beta.1
```

See `docs/guide.md` and `docs/migration/from-any-ui-to-blora-design.md`.

## 2.0.0-beta.0

### Released packages

- `@bloret-crew/blora-design@2.0.0-beta.0`
- `@bloret-crew/blora-design-markdown@2.0.0-beta.0`
- `@bloret-crew/blora-design-thread@2.0.0-beta.0`
- `@bloret-crew/blora-design-qrcode@2.0.0-beta.0`
- `@bloret-crew/blora-design-effects@2.0.0-beta.0`
- `@bloret-crew/blora-design-layout@2.0.0-beta.0`
- `@bloret-crew/blora-design-theming@2.0.0-beta.0`

npm dist-tag: **`beta`**

### Beta commitments

- Stable-core public exports, package subpaths, documented stable contracts, Custom Element tags, events and methods are frozen under the Beta API policy.
- Beta contracts remain changeable only with changelog and migration notes.
- The release line accepts defects, accessibility, documentation, tests and compatible performance work by default; public additions must be optional and backward-compatible.

### Highlights since Alpha.1

- Completed the 87-component Showcase v2 catalog with lazy single-route previews and Preview/HTML generated from one declaration.
- Unified all UI, status and navigation icons through `createBloraIcon()` with geometry generated from `lucide-static`; retained only documented non-icon SVG exceptions.
- Added Composite Custom Element coverage and hardened package manifests, API snapshots, JavaScript subpaths, global IIFE and add-on packaging.
- Fixed Dialog top-layer and scroll-lock behavior, Drawer host visibility, sticky Sidebar Layout position retention, Preview auto-height, Transfer alignment and Indicator anchoring.
- Unified Button Group and Join horizontal button welding while retaining Join-only vertical and mixed-input behavior.
- Removed the unused Lotus theme; the theming add-on now ships six focused presets: Coral, Indigo, Graphite, Mono, Circuit and Dusk.
- Replaced Avenir-first typography with the platform system font stack.
- Removed the unused runtime compatibility entry; application code uses the 2.0 markup, tokens and services directly.
- Expanded browser, axe, visual, lifecycle, icon-policy, package and CI gates. All known visual and behavioral differences were approved by the project owner on 2026-08-19.

### Install

```bash
pnpm add @bloret-crew/blora-design@beta
# or pin
pnpm add @bloret-crew/blora-design@2.0.0-beta.0
```

See `docs/guide.md` and `docs/migration/from-any-ui-to-blora-design.md`.

## 2.0.0-alpha.1

### Released packages

- `@bloret-crew/blora-design@2.0.0-alpha.1`
- `@bloret-crew/blora-design-markdown@2.0.0-alpha.1`
- `@bloret-crew/blora-design-thread@2.0.0-alpha.1`
- `@bloret-crew/blora-design-qrcode@2.0.0-alpha.1`
- `@bloret-crew/blora-design-effects@2.0.0-alpha.1`
- `@bloret-crew/blora-design-layout@2.0.0-alpha.1`
- `@bloret-crew/blora-design-theming@2.0.0-alpha.1`

npm dist-tag: **`alpha`**

### Highlights

- Phase 9 complete (add-ons + core gap paths); Phase 10 **Preflight** gates green on CI.
- ESM-first usage: tokens/foundations CSS plus `createXxxController` and `defineBloraSelect`.
- Table: sort, pagination, column settings, virtual scroll, **built-in row selection**.
- Form validate, TreeSelect, BackTop, image preview, multi-placement `notify`.
- CI: corepack pnpm, publint/attw, pack fixtures (core + add-ons), Playwright + axe smoke.
- Example: `examples/basic/`.

### Install

```bash
pnpm add @bloret-crew/blora-design@alpha
# or pin
pnpm add @bloret-crew/blora-design@2.0.0-alpha.1
```

## 2.0.0-alpha.0

Development snapshot during Phase 0–9; not a formal prerelease channel.
