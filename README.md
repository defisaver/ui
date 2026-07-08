# @defisaver/ui

DeFi Saver design system — React components written in TypeScript and styled with [StyleX](https://stylexjs.com), **pre-compiled** so consumer apps need no StyleX tooling at all.

## Installation

```bash
npm i @defisaver/ui
```

Requires React 18+ as a peer dependency.

## Usage

```tsx
import { Panel, PanelHeader, PanelTitle, PanelFooter } from '@defisaver/ui';
import '@defisaver/ui/styles.css'; // once, at the app entry
```

## How it works

StyleX needs a compiler, and defisaver-app's esbuild pipeline doesn't have one. So this repo compiles StyleX at **library build time** (`@stylexjs/rollup-plugin`): `dist/` contains plain ESM JavaScript with the atomic class names already inlined, plus a single static `dist/styles.css`. Consumers import the package and the stylesheet — that works identically under esbuild, Vite, and Next.js. No Babel, no plugins.

### Customizing components from the app

Library styles are emitted inside `@layer`, and unlayered CSS beats layered CSS regardless of specificity. So the escape hatch is the one the app already knows: pass a `className` and write plain (S)CSS — a single class selector is enough, and media queries work like anywhere else:

```scss
// ChartPanel.module.scss — wins over the library defaults, no !important
.chartHeader {
  min-height: 44px;
  justify-content: flex-start;

  @media (max-width: 750px) {
    flex-direction: column;
    align-items: flex-start;
  }
}
```

```tsx
<PanelHeader className={styles.chartHeader}>…</PanelHeader>
```

Only the properties you declare are overridden; everything else keeps the library value. The flip side: the library also yields to careless broad selectors (`.someParent span { … }`), same as any app-local component — keep overrides scoped to a class on the component itself.

**A repeated override is a bug report against the design system.** If several call sites override the same property (say, three headers all forcing `min-height: 44px`), that's not customization — it's a missing variant or token. Request it here instead of copying the override.

### Design tokens

Tokens live in `src/tokens/*.stylex.ts` (`colors`, `space`, `radius`, `text`). The **spacing and radius scales are fully defined** — they're stable primitives, and as `defineConsts` they're inlined at compile time (zero CSS cost when unused). **Colors and typography are deliberately minimal**: a token is added the moment a component being ported needs it, never speculatively. The old app's full token inventory was audited but not imported wholesale — most of it is legacy design debt, and every unused `defineVars` entry would ship as dead CSS to consumers. **Figma is the intended long-term source of truth for the token set** (sync pipeline TBD).

Each value defers to defisaver-app's custom property with a standalone fallback, e.g. `var(--surface, #1F272E)` — inside the app, components follow `theme.scss` including `[data-theme]` switching with zero migration; standalone, the app's dark-theme fallbacks apply. Names mirror the app's (`--text-color-secondary` → `colors.textSecondary`) so porting stays mechanical.

`src/tokens/tokens.test.ts` compiles every token file through a real `stylex.create()` as a regression guard.

StyleX constraint: `defineVars`/`defineConsts` must live in `*.stylex.ts` files containing nothing else, named exports only.

## Commands

```bash
npm run dev              # Storybook on :6006 (dev playground + docs)
npm run test             # Vitest + React Testing Library
npm run lint             # ESLint (org config + @stylexjs plugin), autofixes
npm run typecheck        # tsc --noEmit
npm run build            # Rollup (pre-compile StyleX, emit styles.css) + d.ts
npm run pack:local       # build + npm pack → defisaver-ui-x.y.z.tgz
```

## Local development against a consumer app

To test unpublished changes in a consumer (e.g. defisaver-app) before releasing:

```bash
# here
npm run pack:local

# in defisaver-app/client
npm i ../../defisaver-ui/defisaver-ui-0.0.1.tgz
```

A tarball install behaves identically to a registry install, so swapping back to the published version is just a version number change.

## Adding a component

1. Create `src/components/<Name>/` with `<Name>.tsx`, `<Name>.stories.tsx`, `<Name>.test.tsx`, `index.ts` (stories/tests are excluded from the build).
2. Style with `stylex.create()`, using tokens from `src/tokens/` — add missing tokens there with `var(--app-var, fallback)` values, mirroring `defisaver-app/client/src/common/theme.scss`. Raw color literals in component styles **fail lint** (`propLimits` on `@stylexjs/valid-styles`) — a missing color means "add a token", never "inline a hex".
3. Export it from `src/index.ts`.
4. Verify: `npm run lint && npm run typecheck && npm test && npm run build`.

When porting from `defisaver-app/client/src/elements/`, keep the public prop API identical so migration is a drop-in import swap.

## Repo layout

```
src/
├── tokens/            # *.stylex.ts — defineConsts/defineVars design tokens
├── components/
│   └── Panel/         # component + stories + tests, co-located
└── index.ts           # public barrel export
.storybook/            # Storybook 10, react-vite, uses vite.config.ts
rollup.config.mjs      # publish build (pre-compiled JS + styles.css)
vite.config.ts         # internal toolchain: Storybook + Vitest (StyleX unplugin)
```

## Roadmap (deferred, in rough order)

- Migrate components from `defisaver-app/client/src/elements/` in dependency order (Icon → primitives → composites)
- GitHub Actions CI (lint / typecheck / test / build / build-storybook)
- Changesets versioning + release automation
- `./tokens.stylex` source subpath export for StyleX-enabled consumers (future Next.js site)
- `createTheme`-based ThemeProvider so themes work without the app's `theme.scss`

## License

[ISC](LICENSE)
