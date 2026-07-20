# Divider

`Divider` separates sections of content or groups of items. It is a standalone
component (no upstream Spar primitive) that renders a semantic
`role="separator"` by default and draws its line entirely in CSS, so optional
label content can sit anywhere along the line.

## Usage

```tsx
import { Divider } from '@takeoff-ui/react-spar';
```

```tsx
<Divider>OR</Divider>
```

## Playground

```tsx
function PlaygroundDemo() {
  return (
    <div className="w-full max-w-md">
      <p className="text-sm">Sign in with your membership number.</p>
      <Divider>OR</Divider>
      <p className="text-sm">Continue as a guest.</p>
    </div>
  );
}

render(<PlaygroundDemo />);
```

## Orientation

Vertical dividers stretch to the height of their flex container.

```tsx
function OrientationDemo() {
  return (
    <div className="flex h-12 w-full max-w-md items-center justify-center text-sm">
      <span>Economy</span>
      <Divider orientation="vertical" />
      <span>Business</span>
      <Divider orientation="vertical" />
      <span>First</span>
    </div>
  );
}

render(<OrientationDemo />);
```

## Appearances

```tsx
function AppearancesDemo() {
  return (
    <div className="w-full max-w-md text-sm">
      <p>Solid</p>
      <Divider appearance="solid" />
      <p>Dashed</p>
      <Divider appearance="dashed" />
      <p>Dotted</p>
      <Divider appearance="dotted" />
    </div>
  );
}

render(<AppearancesDemo />);
```

## Customization

- **Line color** — the line follows `currentColor`; set `color` on the root via
  `style` or your own CSS. Dashed and dotted lines pick the color up too.
- **Spacing** — outer margins default to `16px` (`margin-block` for horizontal,
  `margin-inline` for vertical). Override them with inline `style` (e.g.
  `marginBlock`), which always wins over the recipe.
- **Label** — target the label slot with `classNames={{ label: … }}` for extra
  classes or `slotProps={{ label: { style: … } }}` for inline styles. The gap
  between the line and the label is the label's `paddingInline` (`paddingBlock`
  on vertical dividers), `8px` by default.

```tsx
function CustomizationDemo() {
  return (
    <div className="w-full max-w-md text-sm">
      <p>Line color</p>
      <Divider style={{ color: '#fca5a5' }}>Cancelled</Divider>
      <Divider style={{ color: '#38bdf8' }} appearance="dashed" />

      <p>Spacing</p>
      <Divider style={{ marginBlock: 4 }} />
      <Divider style={{ marginBlock: 4 }} />
      <Divider style={{ marginBlock: 32 }}>Wide spacing</Divider>

      <p>Label</p>
      <Divider
        slotProps={{
          label: { style: { color: '#0369a1', fontWeight: 600, fontSize: 13 } },
        }}
      >
        Styled label
      </Divider>
      <Divider classNames={{ label: 'uppercase tracking-widest' }}>
        utility classes
      </Divider>

      <p>Label spacing</p>
      <Divider slotProps={{ label: { style: { paddingInline: 32 } } }}>
        Wide gap
      </Divider>
      <Divider slotProps={{ label: { style: { paddingInline: 0 } } }}>
        No gap
      </Divider>
    </div>
  );
}

render(<CustomizationDemo />);
```

## Align

Use `align` to position the label along the line: `start`, `center` (the
default), or `end`.

```tsx
function AlignDemo() {
  return (
    <div className="w-full max-w-md">
      <Divider align="start">Section</Divider>
      <Divider>Section</Divider>
      <Divider align="end">Section</Divider>
    </div>
  );
}

render(<AlignDemo />);
```

## API Reference

### Divider {#divider}

#### Props {#divider-props}

| Name        | Type                                                              | Default      | Description                                                                                                                                                                                              |
| ----------- | ----------------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| children    | `React.ReactNode`                                                 | -            | Label content rendered between the line segments.                                                                                                                                                        |
| orientation | `DividerOrientation`                                              | 'horizontal' | Axis of the divider line. Vertical dividers size from their container — place them in a flex row (or give the parent an explicit height) so the line has a height to fill.                               |
| appearance  | `DividerAppearance`                                               | 'solid'      | Line style.                                                                                                                                                                                              |
| align       | `DividerAlign`                                                    | 'center'     | Placement of the label along the divider line.                                                                                                                                                           |
| decorative  | `boolean`                                                         | false        | Marks the divider as purely visual. Decorative dividers are removed from the accessibility tree (`role="none"`); non-decorative dividers render `role="separator"` with the matching `aria-orientation`. |
| classNames  | `Partial<Record<DividerSlot, string>>`                            | -            | Per-slot extra classes.                                                                                                                                                                                  |
| slotProps   | `Partial<Record<DividerSlot, React.HTMLAttributes<HTMLElement>>>` | -            | Per-slot HTML-attribute overrides.                                                                                                                                                                       |
| className   | `string`                                                          | -            | Appends custom classes to the root slot.                                                                                                                                                                 |

#### Data attributes {#divider-data-attributes}

| Attribute         | Applied when                 | Purpose                                                                                                                                                    |
| ----------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| data-slot="root"  | Always                       | Stable selector for wrapper styling on the root slot.                                                                                                      |
| data-slot="label" | When children are renderable | Stable selector for the wrapper-owned label slot.                                                                                                          |
| data-orientation  | Always                       | Reflects the resolved `orientation` prop for theme recipe scoping.                                                                                         |
| data-type         | Always                       | Reflects the resolved `appearance` prop for theme recipe scoping.                                                                                          |
| data-align        | Always                       | Reflects the resolved `align` prop that positions the label along the line.                                                                                |
| role              | Always                       | `separator` when the divider carries semantic meaning; `none` when `decorative` is true (removes the element from the accessibility tree).                 |
| aria-orientation  | When `decorative` is false   | Tells assistive technology the axis of the separator (`horizontal` \| `vertical`). Absent on decorative dividers to avoid ARIA on a `role="none"` element. |

### Type Definitions {#divider-type-definitions}

| Name               | Definition                        |
| ------------------ | --------------------------------- |
| DividerOrientation | `'horizontal' \| 'vertical'`      |
| DividerAppearance  | `'solid' \| 'dashed' \| 'dotted'` |
| DividerAlign       | `'start' \| 'center' \| 'end'`    |
| DividerSlot        | `'root' \| 'label'`               |
