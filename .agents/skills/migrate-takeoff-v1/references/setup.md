# Migration setup

Apply these changes once, before migrating the first screen.

## Dependencies

```bash
pnpm add @takeoff-ui/react-spar @takeoff-design/tokens
```

`@takeoff-design/tokens` is a peer dependency. `@turkish-technology/spar` is
installed transitively by the wrapper.

## React 19 gate

Check the nearest `package.json` before changing components. v2 throws at
runtime on React 18, so upgrade React and `react-dom` to 19 first when needed,
then run the app's typecheck and tests.

## CSS order

Keep the v1 core stylesheet while v1 screens remain:

```css
@import '@takeoff-ui/core/dist/core/core.css';
@import '@takeoff-design/tokens/css/default/theme.css';
```

The v2 theme must come second. Both stylesheets define six global selectors:
`.tk-font`, `.tk-display`, `.tk-text`, `.tk-toast`, `.tk-toaster`, and
`.tk-table-filter-panel`; import order makes the v2 definition win. Available
brand bundles are `default`, `ajet`, `aviation`, `sarp`, and `technology`.

## Provider

Mount the provider once at the root. It renders no DOM and writes `data-theme`
and optional `lang` to `<html>`:

```tsx
import { TakeoffSparProvider } from '@takeoff-ui/react-spar';

<TakeoffSparProvider colorMode="light" locale="en">
  <App />
</TakeoffSparProvider>;
```

Pass `components` defaults only after checking the provider API in the v2
`takeoff-ui` skill.

## Removal criteria

Do not remove `@takeoff-ui/react`, `@takeoff-ui/core`, or `@takeoff-ui/tailwind`
until the scanner reports no remaining imports, `Tk*` JSX, raw `tk-*` elements,
or styling dependencies outside an explicit gap allowlist. v1 and v2 can coexist
during the screen-by-screen migration.

For consumer-agent wiring, see `apps/docs/docs/ai-assistants.mdx` in the v2
repository. The npm package currently ships the agent pointer, not this skill or
scanner.
