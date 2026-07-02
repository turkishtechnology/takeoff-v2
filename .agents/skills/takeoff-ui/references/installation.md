# Installation

Three steps. No config file. No build tool wiring beyond a CSS import.

## 1. Install the packages

`@takeoff-design/tokens` is a **peer dependency** of `@takeoff-ui/react-spar`,
so you install both side by side. This keeps a single tokens copy in your tree
and lets you upgrade tokens independently of the React wrapper.

```bash
# pnpm
pnpm add @takeoff-ui/react-spar @takeoff-design/tokens

# npm
npm install @takeoff-ui/react-spar @takeoff-design/tokens

# yarn
yarn add @takeoff-ui/react-spar @takeoff-design/tokens

# bun
bun add @takeoff-ui/react-spar @takeoff-design/tokens
```

`@turkish-technology/spar` is still a regular dependency of
`@takeoff-ui/react-spar` and is installed automatically. Add it to your own
`package.json` only if your app imports from it directly (for example, when
using Spar primitives that `react-spar` does not re-export).

**React version:** `@takeoff-ui/react-spar` targets React 19 only. If your app
is on React 18, you'll get a runtime error; pin React 19 before installing.

## 2. Import the token stylesheet

Add this once to your app entry — `main.tsx`, `app/layout.tsx`, wherever your
global CSS lives.

```ts
import '@takeoff-design/tokens/css/default/theme.css';
```

The tokens file is ~20KB gzipped and provides every CSS custom property the
components read (`--primary-base`, `--radius-m-base`, `--effect-1-default-base`,
and so on).

## 3. Wrap your tree in the provider

```tsx
import { TakeoffSparProvider } from '@takeoff-ui/react-spar';

export function App({ children }) {
  return (
    <TakeoffSparProvider colorMode="light">{children}</TakeoffSparProvider>
  );
}
```

The provider renders no DOM element. It writes `data-theme` and the optional
`lang` value to `document.documentElement`, then distributes theme-level
component defaults through React context.

## That's it

Import any component and it just works:

```tsx
import { Button } from '@takeoff-ui/react-spar';

<Button variant="primary">Start building</Button>;
```

No Tailwind preset, no Sass config, no Webpack loader. Tokens are plain CSS;
components are plain React.

## Framework-specific notes

- **Next.js App Router** — put `TakeoffSparProvider` in your root
  `app/layout.tsx`. The token CSS can import from `app/globals.css`.
- **Vite** — import the token CSS anywhere in your entry; Vite handles CSS
  ordering.
- **Remix** — wrap `root.tsx`'s `<App />` in `TakeoffSparProvider`; link the
  token CSS via `links()`.

Visual customization is handled entirely through the Takeoff design tokens
imported above — override CSS custom properties at the app root to rebrand.

Continue with [Theming & tokens](./foundations/theming) for color mode, branded
theme bundles, and shared component defaults.
