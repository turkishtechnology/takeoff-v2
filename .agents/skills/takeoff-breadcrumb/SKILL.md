---
name: takeoff-breadcrumb
description:
  'Builds a breadcrumb navigation trail (location path, ancestor links back up
  the site hierarchy) — the Breadcrumb from @takeoff-ui/react-spar (Takeoff UI /
  Spar React). Trigger contexts a developer would type: breadcrumb, breadcrumbs,
  nav trail, page hierarchy path, current location links, crumb
  separator/chevron. Use this skill WHENEVER building, adding, importing,
  styling, or fixing a Breadcrumb (or related path/trail navigation UI) in a
  React app that uses @takeoff-ui/react-spar / Takeoff / Spar.'
---

# Breadcrumb — @takeoff-ui/react-spar

`Breadcrumb` shows the user's current location as a trail of links back through
the site hierarchy, so they can jump up the path without the browser back
button.

**When to use:** Render a hierarchical "where am I" trail of ancestor links
ending in the current page. Not for primary site navigation (use a nav/menu
component), and not for stepwise wizard progress.

## Setup

Requires the Takeoff provider + token CSS mounted once at the app root (see the
`takeoff-ui` skill or the installation docs). Then import:

```tsx
import { Breadcrumb } from '@takeoff-ui/react-spar';
```

## Compound parts

- `Breadcrumb` — the `<nav>` landmark root; carries `size`, `type`, `disabled`,
  `onNavigate`.
- `Breadcrumb.List` — the `<ol>` wrapping all crumbs.
- `Breadcrumb.Item` — a single `<li>` crumb; also accepts a render function
  `({ position, isCurrent, isDisabled }) => ...`.
- `Breadcrumb.Link` — an anchor crumb (ancestor link); `href`, `isExternal`,
  polymorphic `as`.
- `Breadcrumb.Page` — the current (non-link) crumb; sets `aria-current="page"`.
- `Breadcrumb.Separator` — the `<li aria-hidden>` glyph between crumbs;
  `variant` or `children`.

## Basic usage

```tsx
<Breadcrumb>
  <Breadcrumb.List>
    <Breadcrumb.Item>
      <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
    </Breadcrumb.Item>
    <Breadcrumb.Separator />
    <Breadcrumb.Item>
      <Breadcrumb.Link href="#flights">Flights</Breadcrumb.Link>
    </Breadcrumb.Item>
    <Breadcrumb.Separator />
    <Breadcrumb.Item>
      <Breadcrumb.Page>Istanbul → London</Breadcrumb.Page>
    </Breadcrumb.Item>
  </Breadcrumb.List>
</Breadcrumb>
```

## Examples

### Size and variant

```tsx
// size: 'base' | 'large'; type: 'basic' (default) | 'outlined' (bordered chips)
<Breadcrumb size="large" type="outlined">
  <Breadcrumb.List>
    <Breadcrumb.Item>
      <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
    </Breadcrumb.Item>
    <Breadcrumb.Separator />
    <Breadcrumb.Item>
      <Breadcrumb.Page>Account</Breadcrumb.Page>
    </Breadcrumb.Item>
  </Breadcrumb.List>
</Breadcrumb>
```

### Separator presets and custom glyph

```tsx
import { ArrowRightIconOutlinedRounded } from '@takeoff-icons/react/arrow-right';

// variant: 'chevron' (default) | 'dot' | 'slash' | 'vertical'
<Breadcrumb>
  <Breadcrumb.List>
    <Breadcrumb.Item>
      <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
    </Breadcrumb.Item>
    <Breadcrumb.Separator variant="slash" />
    <Breadcrumb.Item>
      <Breadcrumb.Link href="#loyalty">Loyalty</Breadcrumb.Link>
    </Breadcrumb.Item>
    {/* children override the preset glyph entirely */}
    <Breadcrumb.Separator>
      <ArrowRightIconOutlinedRounded />
    </Breadcrumb.Separator>
    <Breadcrumb.Item>
      <Breadcrumb.Page>Status & miles</Breadcrumb.Page>
    </Breadcrumb.Item>
  </Breadcrumb.List>
</Breadcrumb>;
```

### Icons and external links

```tsx
import { LocationOnIconOutlinedRounded } from '@takeoff-icons/react/location-on';

// Compose an icon before the label inside Link or Page; isExternal toggles the external treatment.
<Breadcrumb>
  <Breadcrumb.List>
    <Breadcrumb.Item>
      <Breadcrumb.Link href="#">
        <LocationOnIconOutlinedRounded />
        Home
      </Breadcrumb.Link>
    </Breadcrumb.Item>
    <Breadcrumb.Separator />
    <Breadcrumb.Item>
      <Breadcrumb.Link href="https://help.example.com" isExternal>
        Help center
      </Breadcrumb.Link>
    </Breadcrumb.Item>
    <Breadcrumb.Separator />
    <Breadcrumb.Item>
      <Breadcrumb.Page>Refunds</Breadcrumb.Page>
    </Breadcrumb.Item>
  </Breadcrumb.List>
</Breadcrumb>;
```

### Client-side routing

`onNavigate` runs for every `Breadcrumb.Link` activation (click, Enter, or
Space). Spar prevents native navigation before invoking it — hand the
destination straight to your router, no `event.preventDefault()` needed. A
link-level `onPress` takes priority and short-circuits `onNavigate`.

```tsx
import { useState } from 'react';

function NavigateBreadcrumb() {
  const [last, setLast] = useState<string | null>(null);
  return (
    <Breadcrumb onNavigate={href => setLast(href)}>
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>
          <Breadcrumb.Page>Booking</Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb>
  );
}
```

Alternatively, every part is polymorphic via `as` — drop in a router link
directly:

```tsx
<Breadcrumb.Link as={Link} to="/flights">
  Flights
</Breadcrumb.Link>
```

Setting `disabled` on the root cascades to every `Breadcrumb.Link`: drops the
`href`, sets `aria-disabled`, and removes the links from tab order.

## Key props

| Prop                   | Type                                          | Default        | Notes                                                                 |
| ---------------------- | --------------------------------------------- | -------------- | --------------------------------------------------------------------- |
| `size`                 | `'base' \| 'large'`                           | `'base'`       | Density scale, cascaded to every part via context (on root).          |
| `type`                 | `'basic' \| 'outlined'`                       | `'basic'`      | Visual style; `outlined` wraps crumbs in bordered chips (on root).    |
| `disabled`             | `boolean`                                     | `false`        | Cascades to every `Breadcrumb.Link` (on root).                        |
| `onNavigate`           | `(href: string) => void`                      | -              | Fires on any link activation; Spar blocks native nav first (on root). |
| `aria-label`           | `string`                                      | `'Breadcrumb'` | Labels the `<nav>` landmark (on root).                                |
| `href`                 | `string`                                      | -              | Destination for `Breadcrumb.Link`.                                    |
| `isExternal`           | `boolean`                                     | `false`        | External-link treatment on `Breadcrumb.Link`; sets `data-external`.   |
| `onPress`              | `(e) => void`                                 | -              | Link-level handler; takes priority over `onNavigate`.                 |
| `as`                   | `ElementType`                                 | -              | Polymorphic element/component override on any part.                   |
| `variant`              | `'chevron' \| 'dot' \| 'slash' \| 'vertical'` | `'chevron'`    | Separator glyph preset (on `Breadcrumb.Separator`).                   |
| `children` (Separator) | `React.ReactNode`                             | -              | Custom glyph; overrides `variant`.                                    |

Full props, events, data attributes & type definitions: see
`references/full-docs.md`.

## Accessibility

- `Breadcrumb` renders a `<nav>` landmark labelled `"Breadcrumb"`; pass
  `aria-label` to localize or scope it.
- `Breadcrumb.List` is an `<ol>`, announced as an ordered list.
- `Breadcrumb.Page` marks the current location with `aria-current="page"`.
- `Breadcrumb.Separator` renders `<li aria-hidden>` so the glyph is not
  announced.
- Links are native `<a>` elements with standard focus/tab order; with a routing
  handler (`onNavigate`/`onPress`) both Enter and Space activate, otherwise only
  native Enter.

## Reference

- Full component docs (Copy page): `references/full-docs.md`
- Live docs:
  https://takeoff-v2.app.turkishtechlab.com/docs/components/breadcrumb
- Source: `packages/react-spar/src/components/breadcrumb/`
- Spar primitive: https://spar.app.turkishtechlab.com/docs/Components/Breadcrumb
