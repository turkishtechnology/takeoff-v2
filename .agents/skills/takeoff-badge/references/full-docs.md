# Badge

`Badge` is a small visual label used to highlight status, count, or category. It
is a standalone component (no upstream Spar primitive) that follows Takeoff
visual vocabulary.

## Usage

```tsx
import { Badge } from '@takeoff-ui/react-spar';
```

```tsx
<Badge variant="success">Active</Badge>
```

## Playground

```tsx
function PlaygroundDemo() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Badge variant="primary">Primary</Badge>
      <Badge variant="success" appearance="filledLight">
        Active
      </Badge>
      <Badge variant="danger" rounded>
        3
      </Badge>
      <Badge variant="info" appearance="outlined">
        Info
      </Badge>
      <Badge variant="neutral" appearance="text">
        Draft
      </Badge>
    </div>
  );
}

render(<PlaygroundDemo />);
```

## Variants

```tsx
function VariantsDemo() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Badge variant="primary">Primary</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="neutral">Neutral</Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="danger">Danger</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="verified">Verified</Badge>
      <Badge variant="purple">Purple</Badge>
      <Badge variant="cyan">Cyan</Badge>
      <Badge variant="business">Business</Badge>
      <Badge variant="teal">Teal</Badge>
      <Badge variant="white">White</Badge>
      <Badge variant="dark">Dark</Badge>
    </div>
  );
}

render(<VariantsDemo />);
```

## Appearances

```tsx
function AppearancesDemo() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Badge appearance="filled">Filled</Badge>
      <Badge appearance="filledLight">Filled Light</Badge>
      <Badge appearance="outlined">Outlined</Badge>
      <Badge appearance="text">Text</Badge>
    </div>
  );
}

render(<AppearancesDemo />);
```

## Sizes

```tsx
function SizesDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Badge size="small">Small</Badge>
      <Badge size="base">Base</Badge>
      <Badge size="large">Large</Badge>
    </div>
  );
}

render(<SizesDemo />);
```

## Rounded

```tsx
function TkDemo() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Badge rounded>12</Badge>
      <Badge variant="danger" rounded>
        99+
      </Badge>
      <Badge variant="success" rounded>
        New
      </Badge>
    </div>
  );
}

render(<TkDemo />);
```

## Icons

```tsx
function IconsDemo() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Badge
        variant="success"
        startContent={<CheckIconOutlinedRounded width={20} height={20} />}
      >
        Verified
      </Badge>
      <Badge
        variant="info"
        startContent={<PublicIconOutlinedRounded width={20} height={20} />}
      >
        Online
      </Badge>
      <Badge
        variant="danger"
        endContent={<BlockIconOutlinedRounded width={20} height={20} />}
      >
        Offline
      </Badge>
    </div>
  );
}

render(<IconsDemo />);
```

## Dot

```tsx
function DotDemo() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Badge variant="primary" dot />
      <Badge variant="danger" dot />
      <Badge variant="success" dot />
      <Badge variant="warning" dot />
      <Badge variant="info" dot />
    </div>
  );
}

render(<DotDemo />);
```

## Float

```tsx
function FloatDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-8">
      <div className="relative">
        <div className="w-10 h-10 rounded-lg bg-neutral-200 flex items-center justify-center">
          <NotificationIconOutlinedRounded width={32} height={32} />
        </div>
        <Badge
          variant="danger"
          appearance="filledLight"
          size="large"
          rounded
          className="absolute -top-3 -right-3"
        >
          3
        </Badge>
      </div>

      <div className="relative inline-flex">
        <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center">
          <PersonIconOutlinedRounded width={32} height={32} />
        </div>
        <Badge variant="success" dot className="absolute top-0 right-0" />
      </div>

      <div className="relative inline-flex">
        <div className="w-10 h-10 rounded-lg bg-neutral-200 flex items-center justify-center">
          <MailIconOutlinedRounded width={32} height={32} />
        </div>
        <Badge
          variant="info"
          size="small"
          className="absolute -top-1.5 -right-1.5"
        >
          99
        </Badge>
      </div>
    </div>
  );
}

render(<FloatDemo />);
```

## API Reference

### Badge {#badge}

#### Props {#badge-props}

| Name         | Type                                                            | Default   | Description                                                                                                           |
| ------------ | --------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------- |
| children     | `React.ReactNode`                                               | -         | Badge content.                                                                                                        |
| variant      | `BadgeVariant`                                                  | 'primary' | Color variant.                                                                                                        |
| appearance   | `BadgeAppearance`                                               | 'filled'  | Visual appearance.                                                                                                    |
| size         | `BadgeSize`                                                     | 'base'    | Size scale.                                                                                                           |
| rounded      | `boolean`                                                       | false     | Renders a pill-shaped badge with fully rounded corners.                                                               |
| dot          | `boolean`                                                       | false     | Renders a minimal colored dot (8×8px) with no content. When true, children, startContent, and endContent are ignored. |
| startContent | `React.ReactNode`                                               | -         | Content rendered before children — typically an icon.                                                                 |
| endContent   | `React.ReactNode`                                               | -         | Content rendered after children.                                                                                      |
| classNames   | `Partial<Record<BadgeSlot, string>>`                            | -         | Per-slot extra classes.                                                                                               |
| slotProps    | `Partial<Record<BadgeSlot, React.HTMLAttributes<HTMLElement>>>` | -         | Per-slot HTML-attribute overrides.                                                                                    |
| className    | `string`                                                        | -         | Appends custom classes to the root slot.                                                                              |

#### Data attributes {#badge-data-attributes}

| Attribute        | Applied when           | Purpose                                                           |
| ---------------- | ---------------------- | ----------------------------------------------------------------- |
| data-slot="root" | Always                 | Stable selector for wrapper styling on the root slot.             |
| data-variant     | Always                 | Reflects the resolved `variant` prop for theme recipe scoping.    |
| data-type        | Always                 | Reflects the resolved `appearance` prop for theme recipe scoping. |
| data-size        | When `dot` is false    | Reflects the resolved `size` prop for theme recipe scoping.       |
| data-rounded     | When `rounded` is true | Styling hook for the pill-shaped state.                           |
| data-dot         | When `dot` is true     | Styling hook for the minimal dot mode.                            |

### Type Definitions {#badge-type-definitions}

| Name            | Definition                                                                                                                                                                  |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BadgeVariant    | `\| 'primary' \| 'secondary' \| 'neutral' \| 'info' \| 'success' \| 'danger' \| 'warning' \| 'verified' \| 'purple' \| 'cyan' \| 'business' \| 'teal' \| 'white' \| 'dark'` |
| BadgeAppearance | `'filled' \| 'filledLight' \| 'outlined' \| 'text'`                                                                                                                         |
| BadgeSize       | `'small' \| 'base' \| 'large'`                                                                                                                                              |
| BadgeSlot       | `'root' \| 'label' \| 'icon'`                                                                                                                                               |
