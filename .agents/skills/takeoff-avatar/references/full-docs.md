# Avatar

`Avatar` shows a person's or entity's picture. While the picture is missing,
loading or broken it shows a fallback instead — initials, or a person glyph — so
a broken image never flashes. The loading status comes from the Spar `Avatar`
primitive.

## Usage

```tsx
import { Avatar } from '@takeoff-ui/react-spar';
```

```tsx
<Avatar>
  <Avatar.Image />
  <Avatar.Fallback />
  <Avatar.Badge />
</Avatar>

<Avatar.Group>
  <Avatar />
</Avatar.Group>
```

## Playground

```tsx
function PlaygroundDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <Avatar name="Ada Lovelace" size="large" rounded>
        <Avatar.Image src="/img/avatar/user-1.jpg" />
        <Avatar.Fallback>AL</Avatar.Fallback>
        <Avatar.Badge variant="success" />
      </Avatar>
      <Avatar
        name="Grace Hopper"
        size="large"
        appearance="filledLight"
        variant="info"
      >
        <Avatar.Image src="/img/avatar/missing.jpg" />
        <Avatar.Fallback>GH</Avatar.Fallback>
      </Avatar>
      <Avatar size="large" variant="light" appearance="filledLight" rounded>
        <Avatar.Fallback />
      </Avatar>
    </div>
  );
}

render(<PlaygroundDemo />);
```

## Image and fallback

`Avatar.Image` mounts its `<img>` only once the picture has loaded.
`Avatar.Fallback` renders until then and whenever the picture fails; give it
initials, or no children for the default person glyph. Pass `delayMs` to the
fallback to keep a fast-loading picture from flashing it first, and
`onLoadingStatusChange` to the image to follow the status.

```tsx
<div className="flex flex-wrap items-center justify-center gap-4">
  <Avatar name="Ada Lovelace">
    <Avatar.Image src="/img/avatar/user-2.jpg" />
    <Avatar.Fallback>AL</Avatar.Fallback>
  </Avatar>
  <Avatar name="Broken image">
    <Avatar.Image src="/img/avatar/missing.jpg" />
    <Avatar.Fallback>BI</Avatar.Fallback>
  </Avatar>
  <Avatar>
    <Avatar.Fallback />
  </Avatar>
</div>
```

## Sizes

Seven sizes, from `xxsmall` (20px) to `xxlarge` (160px). `base` is 48px. Each
size has its own corner radius; `rounded` makes a circle.

```tsx
<div className="flex flex-wrap items-end justify-center gap-3">
  <Avatar size="xxsmall" rounded>
    <Avatar.Fallback>XS</Avatar.Fallback>
  </Avatar>
  <Avatar size="xsmall" rounded>
    <Avatar.Fallback>XS</Avatar.Fallback>
  </Avatar>
  <Avatar size="small" rounded>
    <Avatar.Fallback>SM</Avatar.Fallback>
  </Avatar>
  <Avatar size="base" rounded>
    <Avatar.Fallback>BA</Avatar.Fallback>
  </Avatar>
  <Avatar size="large" rounded>
    <Avatar.Fallback>LG</Avatar.Fallback>
  </Avatar>
  <Avatar size="xlarge" rounded>
    <Avatar.Fallback>XL</Avatar.Fallback>
  </Avatar>
  <Avatar size="xxlarge" rounded>
    <Avatar.Fallback>XXL</Avatar.Fallback>
  </Avatar>
</div>
```

## Variants and appearance

`variant` colors the fallback. `appearance="filled"` (default) sets light text
on the brand color; `filledLight` sets dark text on a tint of the variant.

```tsx
<div className="flex flex-col items-center gap-4">
  <div className="flex flex-wrap justify-center gap-3">
    <Avatar variant="primary">
      <Avatar.Fallback>PR</Avatar.Fallback>
    </Avatar>
    <Avatar variant="success">
      <Avatar.Fallback />
    </Avatar>
    <Avatar variant="info">
      <Avatar.Fallback />
    </Avatar>
    <Avatar variant="warning">
      <Avatar.Fallback />
    </Avatar>
    <Avatar variant="danger">
      <Avatar.Fallback />
    </Avatar>
  </div>
  <div className="flex flex-wrap justify-center gap-3">
    <Avatar appearance="filledLight" variant="primary">
      <Avatar.Fallback>PR</Avatar.Fallback>
    </Avatar>
    <Avatar appearance="filledLight" variant="light">
      <Avatar.Fallback>LI</Avatar.Fallback>
    </Avatar>
    <Avatar appearance="filledLight" variant="success">
      <Avatar.Fallback>SU</Avatar.Fallback>
    </Avatar>
    <Avatar appearance="filledLight" variant="info">
      <Avatar.Fallback>IN</Avatar.Fallback>
    </Avatar>
    <Avatar appearance="filledLight" variant="warning">
      <Avatar.Fallback>WA</Avatar.Fallback>
    </Avatar>
    <Avatar appearance="filledLight" variant="danger">
      <Avatar.Fallback>DA</Avatar.Fallback>
    </Avatar>
  </div>
</div>
```

## Badge

`Avatar.Badge` pins a [Badge](/docs/components/badge) to the avatar's
bottom-start corner, scaled to the avatar's size — a dot by default, or content
such as a count. It is decorative unless you give it an `aria-label`.

```tsx
<div className="flex flex-wrap items-center justify-center gap-4">
  <Avatar name="Online" rounded>
    <Avatar.Image src="/img/avatar/user-3.jpg" />
    <Avatar.Fallback>ON</Avatar.Fallback>
    <Avatar.Badge variant="success" />
  </Avatar>
  <Avatar name="Away" size="large" rounded>
    <Avatar.Image src="/img/avatar/user-4.jpg" />
    <Avatar.Fallback>AW</Avatar.Fallback>
    <Avatar.Badge variant="warning" />
  </Avatar>
  <Avatar name="Busy" size="large">
    <Avatar.Fallback>BU</Avatar.Fallback>
    <Avatar.Badge variant="danger" />
  </Avatar>
  <Avatar size="large" rounded>
    <Avatar.Fallback>MS</Avatar.Fallback>
    <Avatar.Badge variant="danger" aria-label="3 unread messages">
      3
    </Avatar.Badge>
  </Avatar>
</div>
```

## Group

`Avatar.Group` overlaps its avatars and passes its `size` and `rounded` to them
(an avatar's own prop wins). With `max`, the avatars past it collapse into one
`+N` avatar; `compact` sets the group on a bordered pill and hides badges.

```tsx
<div className="flex flex-col items-center gap-4">
  <Avatar.Group rounded max={4} aria-label="Reviewers">
    <Avatar name="Ada">
      <Avatar.Image src="/img/avatar/user-1.jpg" />
      <Avatar.Fallback>AD</Avatar.Fallback>
    </Avatar>
    <Avatar name="Grace">
      <Avatar.Image src="/img/avatar/user-2.jpg" />
      <Avatar.Fallback>GR</Avatar.Fallback>
    </Avatar>
    <Avatar name="Linus">
      <Avatar.Image src="/img/avatar/user-3.jpg" />
      <Avatar.Fallback>LI</Avatar.Fallback>
    </Avatar>
    <Avatar name="Margaret" appearance="filledLight" variant="info">
      <Avatar.Fallback>MH</Avatar.Fallback>
    </Avatar>
    <Avatar name="Alan">
      <Avatar.Fallback>AT</Avatar.Fallback>
    </Avatar>
    <Avatar name="Barbara">
      <Avatar.Fallback>BL</Avatar.Fallback>
    </Avatar>
  </Avatar.Group>
  <Avatar.Group rounded compact max={3} size="small" aria-label="Watchers">
    <Avatar name="Ada">
      <Avatar.Image src="/img/avatar/user-1.jpg" />
      <Avatar.Fallback>AD</Avatar.Fallback>
    </Avatar>
    <Avatar name="Grace">
      <Avatar.Image src="/img/avatar/user-2.jpg" />
      <Avatar.Fallback>GR</Avatar.Fallback>
    </Avatar>
    <Avatar name="Linus">
      <Avatar.Image src="/img/avatar/user-4.jpg" />
      <Avatar.Fallback>LI</Avatar.Fallback>
    </Avatar>
    <Avatar name="Alan">
      <Avatar.Fallback>AT</Avatar.Fallback>
    </Avatar>
    <Avatar name="Barbara">
      <Avatar.Fallback>BL</Avatar.Fallback>
    </Avatar>
  </Avatar.Group>
</div>
```

## Accessibility

- Give `Avatar` a `name`: the avatar becomes one `role="img"` named by it, and
  the picture and fallback are hidden from assistive technology, so the person
  is announced once whichever of them shows.
- Without `name`, give `Avatar.Image` an `alt`; fallback text is read as is.
- `Avatar.Badge` is decorative by default. Give it an `aria-label` when it
  carries information that is not said elsewhere.
- `Avatar.Group` is a `role="group"`; name it with `aria-label`. The overflow
  avatar reads `overflowAriaLabel` (`'{count} more'` by default).

## API Reference

### Avatar {#avatar}

See [Spar Avatar docs](https://v2.takeoffui.com/headless/docs/Components/Avatar)
for primitive behavior.

#### Props {#avatar-props}

| Name       | Type                                                         | Default   | Description                                                                                                                                                                                      |
| ---------- | ------------------------------------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| children   | `React.ReactNode`                                            | -         | `Avatar.Image`, `Avatar.Fallback` and `Avatar.Badge`.                                                                                                                                            |
| size       | `AvatarSize`                                                 | 'base'    | Size scale: 20 / 24 / 32 / 48 / 64 / 96 / 160px. Inside `Avatar.Group` the group's `size` applies unless this is set.                                                                            |
| variant    | `AvatarVariant`                                              | 'primary' | Color of the fallback (initials or icon).                                                                                                                                                        |
| appearance | `AvatarAppearance`                                           | 'filled'  | `filled` paints the brand color behind light text; `filledLight` a tint of `variant` behind dark text.                                                                                           |
| rounded    | `boolean`                                                    | false     | Renders a circle instead of a rounded square. Inside `Avatar.Group` the group's `rounded` applies unless this is set.                                                                            |
| hideShadow | `boolean`                                                    | false     | Removes the drop shadow.                                                                                                                                                                         |
| name       | `string`                                                     | -         | The person or entity the avatar stands for. When set, the avatar is one `role="img"` named by it, and the image and fallback are hidden from assistive technology so the name is announced once. |
| classNames | `Partial<Record<"root", string>>`                            | -         | Per-slot extra classes.                                                                                                                                                                          |
| slotProps  | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | -         | Per-slot HTML-attribute overrides.                                                                                                                                                               |
| className  | `string`                                                     | -         | Appends custom classes to the root slot of this part.                                                                                                                                            |

#### Data attributes {#avatar-data-attributes}

| Attribute        | Applied when                                   | Purpose                                                       |
| ---------------- | ---------------------------------------------- | ------------------------------------------------------------- |
| data-slot="root" | Always                                         | Stable selector for the root slot.                            |
| data-size        | Always                                         | Reflects the resolved `size` (own, group, or theme default).  |
| data-variant     | Always                                         | Reflects the resolved `variant` prop for fallback coloring.   |
| data-type        | Always                                         | Reflects the resolved `appearance` prop.                      |
| data-rounded     | When `rounded` is true (own or from the group) | Styling hook for the circle shape.                            |
| data-hide-shadow | When `hideShadow` is true                      | Styling hook that removes the drop shadow.                    |
| data-status      | Always (emitted by Spar)                       | Image loading status: `idle`, `loading`, `loaded` or `error`. |
| data-overflow    | On the `+N` avatar rendered by `Avatar.Group`  | Marks the overflow avatar.                                    |

### Avatar.Image {#avatar-image}

See [Spar Avatar docs](https://v2.takeoffui.com/headless/docs/Components/Avatar)
for primitive behavior.

#### Props {#avatar-image-props}

| Name       | Type                                                         | Default | Description                                                                                                                         |
| ---------- | ------------------------------------------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| alt        | `string`                                                     | -       | Describes the picture. Required unless the root has a `name`, which then names the whole avatar and the image is marked decorative. |
| classNames | `Partial<Record<"root", string>>`                            | -       | Per-slot extra classes.                                                                                                             |
| slotProps  | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | -       | Per-slot HTML-attribute overrides.                                                                                                  |
| className  | `string`                                                     | -       | Appends custom classes to the root slot of this part.                                                                               |

#### Events {#avatar-image-events}

| Name                  | Type                                                 | Default | Description                                                           |
| --------------------- | ---------------------------------------------------- | ------- | --------------------------------------------------------------------- |
| onLoadingStatusChange | `(status: 'loading' \| 'loaded' \| 'error') => void` | -       | Called whenever the image loading status changes (never with `idle`). |

#### Data attributes {#avatar-image-data-attributes}

| Attribute        | Applied when | Purpose                            |
| ---------------- | ------------ | ---------------------------------- |
| data-slot="root" | Always       | Stable selector for the root slot. |

### Avatar.Fallback {#avatar-fallback}

See [Spar Avatar docs](https://v2.takeoffui.com/headless/docs/Components/Avatar)
for primitive behavior.

#### Props {#avatar-fallback-props}

| Name       | Type                                                                     | Default | Description                                                                                                                                        |
| ---------- | ------------------------------------------------------------------------ | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| children   | `React.ReactNode`                                                        | -       | Initials or any content. Without children the default person glyph renders.                                                                        |
| classNames | `Partial<Record<AvatarFallbackSlot, string>>`                            | -       | Per-slot extra classes.                                                                                                                            |
| slotProps  | `Partial<Record<AvatarFallbackSlot, React.HTMLAttributes<HTMLElement>>>` | -       | Per-slot HTML-attribute overrides.                                                                                                                 |
| delayMs    | `number`                                                                 | -       | Waits this many milliseconds before rendering, so a fast-loading image does not flash the fallback first. Without it the fallback renders at once. |
| className  | `string`                                                                 | -       | Appends custom classes to the root slot of this part.                                                                                              |

#### Data attributes {#avatar-fallback-data-attributes}

| Attribute        | Applied when               | Purpose                                    |
| ---------------- | -------------------------- | ------------------------------------------ |
| data-slot="root" | Always                     | Stable selector for the root slot.         |
| data-icon        | When there are no children | Styling hook for the default glyph layout. |

### Avatar.Badge {#avatar-badge}

#### Props {#avatar-badge-props}

| Name       | Type                                                         | Default   | Description                                                   |
| ---------- | ------------------------------------------------------------ | --------- | ------------------------------------------------------------- |
| children   | `React.ReactNode`                                            | -         | Content such as a count. Without children the badge is a dot. |
| variant    | `BadgeVariant`                                               | 'success' | Badge color, e.g. a presence status.                          |
| classNames | `Partial<Record<"root", string>>`                            | -         | Per-slot extra classes.                                       |
| slotProps  | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | -         | Per-slot HTML-attribute overrides.                            |
| className  | `string`                                                     | -         | Appends custom classes to the root slot of this part.         |

#### Data attributes {#avatar-badge-data-attributes}

| Attribute         | Applied when | Purpose                                                                       |
| ----------------- | ------------ | ----------------------------------------------------------------------------- |
| data-slot="root"  | Always       | Stable selector for the root slot.                                            |
| data-avatar-badge | Always       | Marks a Badge placed on an avatar; the Badge recipe’s own `data-*` apply too. |

### Avatar.Group {#avatar-group}

#### Props {#avatar-group-props}

| Name              | Type                                                                  | Default        | Description                                                                                              |
| ----------------- | --------------------------------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------- |
| children          | `React.ReactNode`                                                     | -              | `Avatar` elements.                                                                                       |
| size              | `AvatarSize`                                                          | 'base'         | Size of every avatar in the group (an avatar's own `size` wins) and of the overflow avatar.              |
| rounded           | `boolean`                                                             | false          | Renders every avatar in the group (an avatar's own `rounded` wins) and the overflow avatar as circles.   |
| compact           | `boolean`                                                             | false          | Sets the avatars on one bordered pill and hides their badges.                                            |
| max               | `number`                                                              | -              | Shows at most this many avatars; the rest collapse into one `+N` avatar.                                 |
| overflowLabel     | `string`                                                              | '+{count}'     | Visible text of the overflow avatar. `{count}` is the number hidden. Blank falls back to the default.    |
| overflowAriaLabel | `string`                                                              | '{count} more' | Accessible name of the overflow avatar. `{count}` is the number hidden. Blank falls back to the default. |
| classNames        | `Partial<Record<AvatarGroupSlot, string>>`                            | -              | Per-slot extra classes.                                                                                  |
| slotProps         | `Partial<Record<AvatarGroupSlot, React.HTMLAttributes<HTMLElement>>>` | -              | Per-slot HTML-attribute overrides.                                                                       |
| className         | `string`                                                              | -              | Appends custom classes to the root slot of this part.                                                    |

#### Data attributes {#avatar-group-data-attributes}

| Attribute        | Applied when           | Purpose                                    |
| ---------------- | ---------------------- | ------------------------------------------ |
| data-slot="root" | Always                 | Stable selector for the root slot.         |
| data-size        | Always                 | Reflects the resolved group `size`.        |
| data-compact     | When `compact` is true | Styling hook for the bordered pill layout. |

### Type Definitions {#avatar-type-definitions}

| Name               | Definition                                                                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AvatarSize         | `'xxsmall' \| 'xsmall' \| 'small' \| 'base' \| 'large' \| 'xlarge' \| 'xxlarge'`                                                                                         |
| AvatarVariant      | `'primary' \| 'light' \| 'success' \| 'info' \| 'warning' \| 'danger'`                                                                                                   |
| AvatarAppearance   | `'filled' \| 'filledLight'`                                                                                                                                              |
| AvatarFallbackSlot | `'root' \| 'icon'`                                                                                                                                                       |
| BadgeVariant       | `'primary' \| 'secondary' \| 'neutral' \| 'info' \| 'success' \| 'danger' \| 'warning' \| 'verified' \| 'purple' \| 'cyan' \| 'business' \| 'teal' \| 'white' \| 'dark'` |
| AvatarGroupSlot    | `'root' \| 'overflow'`                                                                                                                                                   |

## When to use

user and account pictures, assignee / reviewer / participant stacks, presence
indicators on a person. Not for logos inside content (use an `<img>`), and not a
button by itself — wrap it in a `Button` or render it `as="button"` with your
own handler when it must be clickable.
