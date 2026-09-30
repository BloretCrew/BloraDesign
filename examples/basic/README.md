# Basic HTML example (2.0)

Requires a prior monorepo build:

```bash
pnpm --filter @bloret-crew/blora-design run build
```

Serve from the **repo root** (so relative paths to `packages/blora-design/dist` work):

```bash
npx serve .
# open /examples/basic/
```

Or open `index.html` via a static server of your choice. File:// may block ES modules in some browsers.

This page loads component CSS one file at a time. Composite pieces rely on other components' CSS
(the Table's row selection renders official `.blora-checkbox` controls), so when you import per
component, also import what it renders. Most apps should simply import
`@bloret-crew/blora-design/blora.css`.

Production install:

```bash
pnpm add @bloret-crew/blora-design
```

See `docs/guide.md` and `docs/patterns.md`.
