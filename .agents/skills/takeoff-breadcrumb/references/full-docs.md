<!-- prettier-ignore-start -->

<!-- prettier-ignore-end -->

# Breadcrumb

`Breadcrumb` shows the user's current location as a trail of links back through
the site hierarchy, so they can jump up the path without using the browser back
button.

## Usage

```tsx
import { Breadcrumb } from '@takeoff-ui/react-spar';
```

```tsx
<Breadcrumb>
  <Breadcrumb.List>
    <Breadcrumb.Item>
      <Breadcrumb.Link />
    </Breadcrumb.Item>
    <Breadcrumb.Separator />
    <Breadcrumb.Item>
      <Breadcrumb.Page />
    </Breadcrumb.Item>
  </Breadcrumb.List>
</Breadcrumb>
```

## Playground

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

```css
.breadcrumb-demo-stack {
  display: grid;
  gap: 12px;
}

.breadcrumb-demo-note {
  width: fit-content;
  border: 1px solid var(--border-light);
  border-radius: 999px;
  background: var(--static-light);
  color: var(--text-dark);
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  padding: 8px 12px;
}
```

## Size

```tsx
<div className="breadcrumb-demo-stack">
  <Breadcrumb size="base">
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

  <Breadcrumb size="large">
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
</div>
```

```css
.breadcrumb-demo-stack {
  display: grid;
  gap: 12px;
}

.breadcrumb-demo-note {
  width: fit-content;
  border: 1px solid var(--border-light);
  border-radius: 999px;
  background: var(--static-light);
  color: var(--text-dark);
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  padding: 8px 12px;
}
```

## Variant

`type="outlined"` wraps each crumb in a bordered, backgrounded chip;
`type="basic"` (the default) is the bare text trail. A label-less (icon-only)
chip opts into tighter padding with the `tk-breadcrumb-item-icon-only` class —
`<Breadcrumb.Item className="tk-breadcrumb-item-icon-only">` — since the
compound API has no label prop to auto-detect it.

```tsx
<div className="breadcrumb-demo-stack">
  <Breadcrumb type="basic">
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

  <Breadcrumb type="outlined">
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
</div>
```

```css
.breadcrumb-demo-stack {
  display: grid;
  gap: 12px;
}

.breadcrumb-demo-note {
  width: fit-content;
  border: 1px solid var(--border-light);
  border-radius: 999px;
  background: var(--static-light);
  color: var(--text-dark);
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  padding: 8px 12px;
}
```

## Separators

`Breadcrumb.Separator` defaults to a chevron. The `variant` prop switches to the
dot, slash, or vertical glyph presets:

```tsx
<div className="breadcrumb-demo-stack">
  <Breadcrumb>
    <Breadcrumb.List>
      <Breadcrumb.Item>
        <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Separator variant="dot" />
      <Breadcrumb.Item>
        <Breadcrumb.Page>Account</Breadcrumb.Page>
      </Breadcrumb.Item>
    </Breadcrumb.List>
  </Breadcrumb>

  <Breadcrumb>
    <Breadcrumb.List>
      <Breadcrumb.Item>
        <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Separator variant="slash" />
      <Breadcrumb.Item>
        <Breadcrumb.Page>Account</Breadcrumb.Page>
      </Breadcrumb.Item>
    </Breadcrumb.List>
  </Breadcrumb>

  <Breadcrumb>
    <Breadcrumb.List>
      <Breadcrumb.Item>
        <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Separator variant="vertical" />
      <Breadcrumb.Item>
        <Breadcrumb.Page>Account</Breadcrumb.Page>
      </Breadcrumb.Item>
    </Breadcrumb.List>
  </Breadcrumb>
</div>
```

```css
.breadcrumb-demo-stack {
  display: grid;
  gap: 12px;
}

.breadcrumb-demo-note {
  width: fit-content;
  border: 1px solid var(--border-light);
  border-radius: 999px;
  background: var(--static-light);
  color: var(--text-dark);
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  padding: 8px 12px;
}
```

Arbitrary content goes through `children`, which overrides the preset:

```tsx
<Breadcrumb>
  <Breadcrumb.List>
    <Breadcrumb.Item>
      <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
    </Breadcrumb.Item>
    <Breadcrumb.Separator>
      <ArrowRightIconOutlinedRounded />
    </Breadcrumb.Separator>
    <Breadcrumb.Item>
      <Breadcrumb.Link href="#loyalty">Loyalty</Breadcrumb.Link>
    </Breadcrumb.Item>
    <Breadcrumb.Separator>
      <ArrowRightIconOutlinedRounded />
    </Breadcrumb.Separator>
    <Breadcrumb.Item>
      <Breadcrumb.Page>Status & miles</Breadcrumb.Page>
    </Breadcrumb.Item>
  </Breadcrumb.List>
</Breadcrumb>
```

```css
.breadcrumb-demo-stack {
  display: grid;
  gap: 12px;
}

.breadcrumb-demo-note {
  width: fit-content;
  border: 1px solid var(--border-light);
  border-radius: 999px;
  background: var(--static-light);
  color: var(--text-dark);
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  padding: 8px 12px;
}
```

## Icons

Compose an icon before the label inside `Breadcrumb.Link` or `Breadcrumb.Page` —
the recipe sizes direct `svg`/`img` children and tones them with the crumb's
text color:

```tsx
<div className="breadcrumb-demo-stack">
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
        <Breadcrumb.Link href="#flights">Flights</Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Separator />
      <Breadcrumb.Item>
        <Breadcrumb.Page>Istanbul → London</Breadcrumb.Page>
      </Breadcrumb.Item>
    </Breadcrumb.List>
  </Breadcrumb>

  <Breadcrumb>
    <Breadcrumb.List>
      <Breadcrumb.Item>
        <Breadcrumb.Link href="#notifications">
          <NotificationIconOutlinedRounded />
          Notifications
        </Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Separator />
      <Breadcrumb.Item>
        <Breadcrumb.Link href="#notifications-inbox">
          <PersonIconOutlinedRounded />
          Team inbox
        </Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Separator />
      <Breadcrumb.Item>
        <Breadcrumb.Page>
          <PublicIconOutlinedRounded />
          All updates
        </Breadcrumb.Page>
      </Breadcrumb.Item>
    </Breadcrumb.List>
  </Breadcrumb>
</div>
```

```css
.breadcrumb-demo-stack {
  display: grid;
  gap: 12px;
}

.breadcrumb-demo-note {
  width: fit-content;
  border: 1px solid var(--border-light);
  border-radius: 999px;
  background: var(--static-light);
  color: var(--text-dark);
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  padding: 8px 12px;
}
```

## External Link

```tsx
<Breadcrumb>
  <Breadcrumb.List>
    <Breadcrumb.Item>
      <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
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
</Breadcrumb>
```

```css
.breadcrumb-demo-stack {
  display: grid;
  gap: 12px;
}

.breadcrumb-demo-note {
  width: fit-content;
  border: 1px solid var(--border-light);
  border-radius: 999px;
  background: var(--static-light);
  color: var(--text-dark);
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  padding: 8px 12px;
}
```

## Routing Integration

`onNavigate` runs for every `Breadcrumb.Link` activation (click,

Enter, or Space). Spar prevents the native navigation before invoking it, so
hand the destination straight to your client-side router — no
`event.preventDefault()` needed. A link-level `onPress` takes priority and
short-circuits `onNavigate` when both are set.

```tsx
function NavigateBreadcrumbDemo() {
  const [last, setLast] = useState(null);

  const handleNavigate = href => {
    setLast(href);
  };

  return (
    <div className="breadcrumb-demo-stack">
      <div className="breadcrumb-demo-note">
        {last ? 'Navigate to ' + last : 'Click a link to intercept routing'}
      </div>
      <Breadcrumb onNavigate={handleNavigate}>
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item>
            <Breadcrumb.Link href="#booking">Booking</Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item>
            <Breadcrumb.Page>Passenger details</Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb>
    </div>
  );
}

render(<NavigateBreadcrumbDemo />);
```

```css
.breadcrumb-demo-stack {
  display: grid;
  gap: 12px;
}

.breadcrumb-demo-note {
  width: fit-content;
  border: 1px solid var(--border-light);
  border-radius: 999px;
  background: var(--static-light);
  color: var(--text-dark);
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  padding: 8px 12px;
}
```

### Custom link components

Every part is polymorphic via `as`, so a router's link component can replace the
anchor directly — no `onNavigate` interception needed:

```tsx
<Breadcrumb.Link as={Link} to="/flights">
  Flights
</Breadcrumb.Link>
```

`Breadcrumb.Item` also accepts a render function receiving
`{ position, isCurrent, isDisabled }` for state-driven content:

```tsx
<Breadcrumb.Item>
  {({ isDisabled }) => <Crumb muted={isDisabled} />}
</Breadcrumb.Item>
```

## Disabled

Setting `disabled` on the root cascades to every `Breadcrumb.Link`: it removes
the anchor's `href`, sets `aria-disabled` on both the `<nav>` and each link,
drops the disabled links from the tab order (`tabindex="-1"`), and surfaces
`data-disabled` on the trail so theme recipes can tone the colors down.

```tsx
<Breadcrumb disabled>
  <Breadcrumb.List>
    <Breadcrumb.Item>
      <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
    </Breadcrumb.Item>
    <Breadcrumb.Separator />
    <Breadcrumb.Item>
      <Breadcrumb.Link href="#checkout">Checkout</Breadcrumb.Link>
    </Breadcrumb.Item>
    <Breadcrumb.Separator />
    <Breadcrumb.Item>
      <Breadcrumb.Page>Payment</Breadcrumb.Page>
    </Breadcrumb.Item>
  </Breadcrumb.List>
</Breadcrumb>
```

```css
.breadcrumb-demo-stack {
  display: grid;
  gap: 12px;
}

.breadcrumb-demo-note {
  width: fit-content;
  border: 1px solid var(--border-light);
  border-radius: 999px;
  background: var(--static-light);
  color: var(--text-dark);
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  padding: 8px 12px;
}
```

## Long Trails

Crumbs never wrap: labels stay on a single line and the trail scrolls
horizontally (with a slim themed scrollbar) when it outgrows its container. The
scroll container reserves a small gutter so the focus ring stays fully visible
while tabbing through an overflowing trail.

```tsx
<div style={{ maxWidth: 360 }}>
  <Breadcrumb>
    <Breadcrumb.List>
      <Breadcrumb.Item>
        <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Separator />
      <Breadcrumb.Item>
        <Breadcrumb.Link href="#booking">Booking</Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Separator />
      <Breadcrumb.Item>
        <Breadcrumb.Link href="#booking-flights">Flights</Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Separator />
      <Breadcrumb.Item>
        <Breadcrumb.Link href="#booking-flights-seats">
          Seat selection
        </Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Separator />
      <Breadcrumb.Item>
        <Breadcrumb.Page>Passenger details and baggage</Breadcrumb.Page>
      </Breadcrumb.Item>
    </Breadcrumb.List>
  </Breadcrumb>
</div>
```

```css
.breadcrumb-demo-stack {
  display: grid;
  gap: 12px;
}

.breadcrumb-demo-note {
  width: fit-content;
  border: 1px solid var(--border-light);
  border-radius: 999px;
  background: var(--static-light);
  color: var(--text-dark);
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  padding: 8px 12px;
}
```

## Accessibility & Keyboard

- `Breadcrumb` renders a `<nav>` landmark labelled `"Breadcrumb"` by default;
  pass `aria-label` to localize it or scope it to the surrounding page.
- `Breadcrumb.List` is an `<ol>`, so assistive tech announces the trail as an
  ordered list.
- `Breadcrumb.Page` marks the current location with `aria-current="page"`.
- `Breadcrumb.Separator` renders an `<li aria-hidden>` so screen readers do not
  announce the chevron between items.
- Links are native `` elements, so focus and tab order follow standard anchor
  semantics. When a routing handler (`onNavigate` or `onPress`) is attached,
  both Enter and Space activate it via `event.preventDefault()`; without one,
  only native Enter activation applies.

## API Reference

### Breadcrumb {#breadcrumb}

See
[Spar Breadcrumb docs](https://spar.app.turkishtechlab.com/docs/Components/Breadcrumb)
for primitive behavior.

#### Props {#breadcrumb-props}

| Name       | Type                                                         | Default | Description                                             |
| ---------- | ------------------------------------------------------------ | ------- | ------------------------------------------------------- |
| children   | `React.ReactNode`                                            | -       | `Breadcrumb.List` rendered inside the `<nav>` landmark. |
| size       | `<a href="#breadcrumb-td-breadcrumbsize">BreadcrumbSize`     | 'base'  | Density scale cascaded to every part through context.   |
| type       | `BreadcrumbType`                                             | 'basic' | Visual style cascaded to every part through context.    |
| classNames | `Partial<Record<"root", string>>`                            | -       | Per-slot class name overrides.                          |
| slotProps  | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | -       | Per-slot HTML attribute overrides.                      |
| className  | `string`                                                     | -       | Appends custom classes to the root slot of this part.   |

#### Data attributes {#breadcrumb-data-attributes}

| Attribute        | Applied when             | Purpose                                                                                                                          |
| ---------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| data-slot="root" | Always                   | Stable selector for wrapper styling on the root slot.                                                                            |
| data-size        | Always                   | Reflects the resolved `size` prop so theme recipes can scope size variants. Emitted by the wrapper.                              |
| data-type        | Always                   | Reflects the resolved `type` prop (`basic` \| `outlined`) so theme recipes can scope the visual variant. Emitted by the wrapper. |
| data-disabled    | When `disabled` is true. | Theme hook for the disabled trail. Emitted by Spar, alongside `aria-disabled`.                                                   |

### Breadcrumb.List {#breadcrumb-list}

See
[Spar Breadcrumb docs](https://spar.app.turkishtechlab.com/docs/Components/Breadcrumb)
for primitive behavior.

#### Data attributes {#breadcrumb-list-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Breadcrumb.Item {#breadcrumb-item}

See
[Spar Breadcrumb docs](https://spar.app.turkishtechlab.com/docs/Components/Breadcrumb)
for primitive behavior.

#### Data attributes {#breadcrumb-item-data-attributes}

| Attribute        | Applied when                                               | Purpose                                                                                                                                                                                                                                                               |
| ---------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| data-slot="root" | Always                                                     | Stable selector for wrapper styling on the root slot.                                                                                                                                                                                                                 |
| data-position    | Always                                                     | `"first"`, `"middle"`, or `"last"`. Emitted by Spar — with the pinned 0.2.0-beta.1 it always resolves to `"middle"` through this wrapper (position derivation is type-matched on Spar’s own item); the real values arrive with the Spar context-registration release. |
| data-current     | Reserved — not emitted at item level with the pinned Spar. | Will mark the current crumb once the Spar context-registration release lands. Until then, style the current crumb via `Breadcrumb.Page`’s always-emitted `data-current`.                                                                                              |

### Breadcrumb.Link {#breadcrumb-link}

See
[Spar Breadcrumb docs](https://spar.app.turkishtechlab.com/docs/Components/Breadcrumb)
for primitive behavior.

#### Data attributes {#breadcrumb-link-data-attributes}

| Attribute        | Applied when                                               | Purpose                                                    |
| ---------------- | ---------------------------------------------------------- | ---------------------------------------------------------- |
| data-slot="root" | Always                                                     | Stable selector for wrapper styling on the root slot.      |
| data-external    | When `isExternal` is true.                                 | Theme hook for the external link variant. Emitted by Spar. |
| data-disabled    | When the link `disabled` is true, or the root is disabled. | Theme hook for the disabled link state. Emitted by Spar.   |

### Breadcrumb.Page {#breadcrumb-page}

See
[Spar Breadcrumb docs](https://spar.app.turkishtechlab.com/docs/Components/Breadcrumb)
for primitive behavior.

#### Data attributes {#breadcrumb-page-data-attributes}

| Attribute        | Applied when | Purpose                                                                                              |
| ---------------- | ------------ | ---------------------------------------------------------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot.                                                |
| data-current     | Always       | Marks the current page; emitted by Spar on every `Breadcrumb.Page`, alongside `aria-current="page"`. |

### Breadcrumb.Separator {#breadcrumb-separator}

See
[Spar Breadcrumb docs](https://spar.app.turkishtechlab.com/docs/Components/Breadcrumb)
for primitive behavior.

#### Props {#breadcrumb-separator-props}

| Name       | Type                                                         | Default   | Description                                                                                                                 |
| ---------- | ------------------------------------------------------------ | --------- | --------------------------------------------------------------------------------------------------------------------------- |
| children   | `React.ReactNode`                                            | -         | Override the separator glyph entirely; takes priority over `variant`. The owner `<li aria-hidden>` element stays invariant. |
| variant    | `BreadcrumbSeparatorVariant`                                 | 'chevron' | Glyph preset rendered when no `children` are given.                                                                         |
| classNames | `Partial<Record<"root", string>>`                            | -         | Per-slot class name overrides.                                                                                              |
| slotProps  | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | -         | Per-slot HTML attribute overrides.                                                                                          |
| className  | `string`                                                     | -         | Appends custom classes to the root slot of this part.                                                                       |

#### Data attributes {#breadcrumb-separator-data-attributes}

| Attribute        | Applied when | Purpose                                                                                                                                                |
| ---------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot.                                                                                                  |
| data-variant     | Always       | Reflects the resolved `variant` preset (`chevron` \| `dot` \| `slash` \| `vertical`) so the recipe can paint glyph separators. Emitted by the wrapper. |

### Type Definitions {#breadcrumb-type-definitions}

| Name                       | Definition                                    |
| -------------------------- | --------------------------------------------- |
| BreadcrumbSize             | `'base' \| 'large'`                           |
| BreadcrumbType             | `'basic' \| 'outlined'`                       |
| BreadcrumbSeparatorVariant | `'chevron' \| 'dot' \| 'slash' \| 'vertical'` |
