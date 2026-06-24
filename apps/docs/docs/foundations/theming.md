---
title: Theming & Tokens
description:
  Configure Takeoff design tokens, color mode, locale, and shared component
  defaults.
sidebar_label: Theming & tokens
slug: /foundations/theming
---

# Theming & Tokens

Takeoff Spar separates component behavior from visual tokens. React components
come from `@takeoff-ui/react-spar`; colors, typography, spacing, radii, and
component recipes come from `@takeoff-design/tokens`.

## Choose a token theme

Import one theme stylesheet once, near your application entry. The default theme
is the safest starting point:

```ts
import '@takeoff-design/tokens/css/default/theme.css';
```

The token package also publishes branded themes:

```ts
import '@takeoff-design/tokens/css/technology/theme.css';
// or: aviation, ajet, sarp
```

Use one complete theme bundle at a time. Each bundle defines the CSS custom
properties and component recipes consumed by the React wrappers.

## Set color mode

`TakeoffSparProvider` accepts `colorMode="light"` or `colorMode="dark"`. It
renders no DOM element. Instead, it writes `data-theme` to
`document.documentElement` so normal components and portal content share the
same theme.

```tsx
import { TakeoffSparProvider } from '@takeoff-ui/react-spar';

export function App({ children }) {
  return <TakeoffSparProvider colorMode="dark">{children}</TakeoffSparProvider>;
}
```

The provider also writes `lang` to the document element when `locale` is set:

```tsx
<TakeoffSparProvider colorMode="light" locale="tr">
  {children}
</TakeoffSparProvider>
```

For server-rendered applications, set the initial `data-theme` and `lang` on
`<html>` before hydration. This avoids a light-theme flash while the provider
effect starts.

## Override design tokens

Token values are CSS custom properties, so product-level overrides belong in
global CSS. Keep overrides narrow and prefer semantic tokens over component
internals.

```css
:root {
  --primary-base: #c8102e;
  --radius-m-base: 10px;
}

[data-theme='dark'] {
  --primary-base: #ff5269;
}
```

Inspect the selected theme's `variables.css` file when you need the complete
token inventory. Component pages document the state and slot hooks that are
stable for targeted styling.

## Set shared component defaults

Use the provider's `components` map for application-wide defaults. Keys and
props are typed from the public component registry.

```tsx
<TakeoffSparProvider
  colorMode="light"
  components={{
    Button: {
      defaultProps: { size: 'large' },
      className: 'product-button',
    },
    AccordionTrigger: {
      slotProps: {
        root: { 'aria-describedby': 'accordion-help' },
      },
    },
  }}
>
  {children}
</TakeoffSparProvider>
```

Instance props override provider defaults. Canonical `tk-*` classes,
`data-slot`, and component-owned state attributes remain in place.

## When the provider is optional

Components can render without `TakeoffSparProvider` and use their authored
defaults. Add the provider when the app needs coordinated color mode, locale, or
shared component configuration.

Next: learn how compound parts and styling layers work in
[Composition & styling](./composition-styling).
