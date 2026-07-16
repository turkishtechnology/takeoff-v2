# Skeleton

`Skeleton` renders a visual placeholder for content that is still loading. Use
it when the final layout is known enough to reserve space and avoid a jumpy
transition when data arrives.

The component is decorative by default and renders `aria-hidden="true"`. Pair it
with surrounding loading text, a region state, or another status component when
the loading state needs to be announced.

## Usage

```tsx
import { Skeleton } from '@takeoff-ui/react-spar';
```

```tsx
<Skeleton height={16} width="60%" />
<Skeleton shape="circle" height={40} />
```

## Playground

```tsx
function PlaygroundDemo() {
  return (
    <div className="mx-auto flex w-full max-w-120 flex-col gap-4">
      <div className="flex items-center gap-3">
        <Skeleton shape="circle" height={48} />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton height={16} width="45%" />
          <Skeleton height={14} width="70%" />
        </div>
      </div>
      <Skeleton height={120} />
      <div className="flex flex-col gap-2">
        <Skeleton height={14} />
        <Skeleton height={14} width="88%" />
        <Skeleton height={14} width="62%" />
      </div>
    </div>
  );
}

render(<PlaygroundDemo />);
```

## Shapes

`shape="rectangle"` renders a rounded bar. `shape="circle"` turns the root into
a full-radius disc whose diameter follows `height`.

```tsx
function ShapesDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-8">
      <div className="flex w-64 flex-col gap-3">
        <Skeleton height={20} />
        <Skeleton height={20} width="80%" />
        <Skeleton height={20} width="55%" />
      </div>
      <Skeleton shape="circle" height={72} />
    </div>
  );
}

render(<ShapesDemo />);
```

## Sizing

`width` and `height` accept numbers in pixels or any CSS length string. Omitting
`width` lets the placeholder fill its container.

```tsx
function SizingDemo() {
  return (
    <div className="mx-auto flex w-full max-w-120 flex-col gap-3">
      <Skeleton height={12} width="35%" />
      <Skeleton height={16} width="60%" />
      <Skeleton height={24} width={320} />
      <Skeleton height="4rem" width="100%" />
    </div>
  );
}

render(<SizingDemo />);
```

## Animation

Use `animation="none"` for static placeholders, especially inside surfaces where
motion would distract from other loading or status indicators.

```tsx
function AnimationDemo() {
  return (
    <div className="mx-auto grid w-full max-w-120 gap-5 sm:grid-cols-2">
      <div className="flex flex-col gap-3">
        <Skeleton height={18} width="45%" />
        <Skeleton height={80} />
        <Skeleton height={14} width="70%" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton animation="none" height={18} width="45%" />
        <Skeleton animation="none" height={80} />
        <Skeleton animation="none" height={14} width="70%" />
      </div>
    </div>
  );
}

render(<AnimationDemo />);
```

## Accessibility

- `Skeleton` is hidden from assistive technology by default because it does not
  carry meaningful content on its own.
- Announce loading through nearby copy, a labeled region with `aria-busy`, or a
  [`Spinner`](/docs/components/spinner) when users need active status feedback.
- Avoid replacing labels, headings, or controls with focusable placeholders.
  Render the real interactive element only when it is ready.

## API Reference

### Skeleton {#skeleton}

#### Props {#skeleton-props}

| Name        | Type                                                               | Default     | Description                                                                                                                       |
| ----------- | ------------------------------------------------------------------ | ----------- | --------------------------------------------------------------------------------------------------------------------------------- |
| shape       | `SkeletonShape`                                                    | 'rectangle' | Placeholder silhouette. `rectangle` renders the rounded bar, `circle` a full-radius disc whose diameter tracks `height`.          |
| animation   | `SkeletonAnimation`                                                | 'shimmer'   | Loading animation. `shimmer` sweeps the highlight strip across the bar; `none` renders a static placeholder.                      |
| width       | `string \| number`                                                 | -           | Fixed width, number in px or any CSS length. Published to the recipe as `--tk-skeleton-width`; defaults to filling the container. |
| height      | `string \| number`                                                 | -           | Fixed height, number in px or any CSS length. Published to the recipe as `--tk-skeleton-height`.                                  |
| classNames  | `Partial<Record<SkeletonSlot, string>>`                            | -           | Per-slot extra classes.                                                                                                           |
| slotProps   | `Partial<Record<SkeletonSlot, React.HTMLAttributes<HTMLElement>>>` | -           | Per-slot HTML-attribute overrides.                                                                                                |
| className   | `string`                                                           | -           | Appends custom classes to the root slot.                                                                                          |
| aria-hidden | `boolean \| "true" \| "false"`                                     | true        | Keeps the placeholder out of the accessibility tree. Leave it hidden and expose loading context through nearby content.           |

#### Data attributes {#skeleton-data-attributes}

| Attribute           | Applied when             | Purpose                                                          |
| ------------------- | ------------------------ | ---------------------------------------------------------------- |
| data-slot="root"    | Always                   | Stable selector for wrapper styling on the root slot.            |
| data-type           | Always                   | Reflects the resolved `shape` prop for theme recipe scoping.     |
| data-animation      | Always                   | Reflects the resolved `animation` prop for theme recipe scoping. |
| data-slot="shimmer" | Always on the inner span | Stable selector for the decorative shimmer strip.                |

### Type Definitions {#skeleton-type-definitions}

| Name              | Definition                |
| ----------------- | ------------------------- |
| SkeletonShape     | `'rectangle' \| 'circle'` |
| SkeletonAnimation | `'shimmer' \| 'none'`     |
| SkeletonSlot      | `'root' \| 'shimmer'`     |
