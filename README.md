# @defisaver/ui

DeFi Saver design system — React components written in TypeScript and styled with [StyleX](https://stylexjs.com), **pre-compiled** so consumer apps need no StyleX tooling at all.

> Local-only for now: the package is `private` and consumed via a packed tarball. npm publishing is a documented follow-up (see Roadmap).

## How it works

StyleX needs a compiler, and defisaver-app's esbuild pipeline doesn't have one. So this repo compiles StyleX at **library build time** (`@stylexjs/rollup-plugin`): `dist/` contains plain ESM JavaScript with the atomic class names already inlined, plus a single static `dist/styles.css`. Consumers just do:

```tsx
import { Panel, PanelHeader, PanelTitle, PanelFooter } from '@defisaver/ui';
import '@defisaver/ui/styles.css'; // once, at the app entry
```

That works identically under esbuild, Vite, and Next.js — no Babel, no plugins.

### Design tokens

Tokens live in `src/tokens/*.stylex.ts` (`colors`, `space`, `radius`, `text`). The **spacing and radius scales are fully defined** — they're stable primitives, and as `defineConsts` they're inlined at compile time (zero CSS cost when unused). **Colors and typography are deliberately minimal**: a token is added the moment a component being ported needs it, never speculatively. The old app's full token inventory was audited (see git history / `~/.claude/plans` analysis) but not imported wholesale — most of it is legacy design debt, and every unused `defineVars` entry would ship as dead CSS to consumers. **Figma is the intended long-term source of truth for the token set** (sync pipeline TBD).

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

## Consuming from defisaver-app (local, for now)

```bash
# here
npm run pack:local

# in defisaver-app/client
npm i ../../defisaver-ui/defisaver-ui-0.0.1.tgz
```

Then import components and add `import '@defisaver/ui/styles.css'` once at the app entry.

## Adding a component

1. Create `src/components/<Name>/` with `<Name>.tsx`, `<Name>.stories.tsx`, `<Name>.test.tsx`, `index.ts` (stories/tests are excluded from the build).
2. Style with `stylex.create()`, using tokens from `src/tokens/` — add missing tokens there with `var(--app-var, fallback)` values, mirroring `defisaver-app/client/src/common/theme.scss`.
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
- Changesets versioning + npm publishing under `@defisaver` (drop `"private": true`)
- `./tokens.stylex` source subpath export for StyleX-enabled consumers (future Next.js site)
- `createTheme`-based ThemeProvider so themes work without the app's `theme.scss`
