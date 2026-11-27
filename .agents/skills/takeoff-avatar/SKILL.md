---
name: takeoff-avatar
description:
  "Build an Avatar — a person's or entity's picture with an initials/icon
  fallback, status badge, sizes, shapes, and an overlapping group with a +N
  overflow count, from @takeoff-ui/react-spar (Takeoff UI / Spar React).
  Triggers when you need a user avatar, profile picture, initials circle,
  presence/online dot on a picture, assignee or reviewer stack, or 'and 3 more'
  avatar pile. Use this skill WHENEVER building, adding, importing, styling, or
  fixing an Avatar or avatar group in a React app that uses
  @takeoff-ui/react-spar / Takeoff / Spar."
---

# Avatar — @takeoff-ui/react-spar

`Avatar` shows a person's or entity's picture. While the picture is missing,
loading, or broken it shows `Avatar.Fallback` instead (initials, or a person
glyph), so a broken image never flashes. The loading status comes from the Spar
`Avatar` primitive.

**When to use:** user and account pictures, assignee / reviewer / participant
stacks, presence indicators on a person. Not for logos inside content (use an
`<img>`), and not a button by itself — wrap it in a `Button` or render it
`as="button"` with your own handler when it must be clickable.

## Setup

Requires the Takeoff provider + token CSS mounted once at the app root (see the
`takeoff-ui` skill or the installation docs). Then import:

```tsx
import { Avatar } from '@takeoff-ui/react-spar';
```

## Basic usage

```tsx
<Avatar name="Ada Lovelace" rounded>
  <Avatar.Image src={user.photoUrl} />
  <Avatar.Fallback>AL</Avatar.Fallback>
</Avatar>
```

Always give the fallback — it renders while the image loads and whenever it
fails. Without children it draws the default person glyph.

## Examples

### Sizes, shape, color

```tsx
<Avatar size="small" rounded>
  <Avatar.Fallback>AL</Avatar.Fallback>
</Avatar>
<Avatar size="xlarge" appearance="filledLight" variant="success">
  <Avatar.Fallback />
</Avatar>
```

Sizes: `xxsmall` 20 · `xsmall` 24 · `small` 32 · `base` 48 (default) · `large`
64 · `xlarge` 96 · `xxlarge` 160 px. `appearance="filled"` (default) is light
text on the brand color; `filledLight` is dark text on a tint of `variant`
(`primary`, `light`, `success`, `info`, `warning`, `danger`).

### Status badge

```tsx
<Avatar name="Ada Lovelace" rounded>
  <Avatar.Image src={src} />
  <Avatar.Fallback>AL</Avatar.Fallback>
  <Avatar.Badge variant="success" />
</Avatar>;

{
  /* a count instead of a dot; name it when it carries information */
}
<Avatar rounded>
  <Avatar.Fallback>MS</Avatar.Fallback>
  <Avatar.Badge variant="danger" aria-label="3 unread messages">
    3
  </Avatar.Badge>
</Avatar>;
```

`Avatar.Badge` renders a Takeoff `Badge` pinned to the bottom-start corner and
scaled to the avatar size. Do not hand-position a `Badge` over an avatar.

### Group with overflow

```tsx
<Avatar.Group size="small" rounded max={3} aria-label="Reviewers">
  {reviewers.map(person => (
    <Avatar key={person.id} name={person.name}>
      <Avatar.Image src={person.photoUrl} />
      <Avatar.Fallback>{person.initials}</Avatar.Fallback>
    </Avatar>
  ))}
</Avatar.Group>
```

Past `max` the rest collapse into one `+N` avatar (`overflowLabel`, default
`'+{count}'`; accessible name `overflowAriaLabel`, default `'{count} more'`).
`compact` sets the group on a bordered pill and hides badges. The group's `size`
/ `rounded` apply to every avatar unless the avatar sets its own.

### Loading status

```tsx
<Avatar>
  <Avatar.Image
    src={src}
    alt="Ada Lovelace"
    onLoadingStatusChange={status => log(status)}
  />
  <Avatar.Fallback delayMs={300}>AL</Avatar.Fallback>
</Avatar>
```

`delayMs` keeps a fast-loading picture from flashing the fallback first. The
root's `data-status` is `idle` / `loading` / `loaded` / `error`.

## Key props

| Part / prop                                          | Type                        | Default                         | Notes                                                                   |
| ---------------------------------------------------- | --------------------------- | ------------------------------- | ----------------------------------------------------------------------- |
| `Avatar` `size`                                      | `AvatarSize`                | `'base'`                        | Group `size` applies unless set.                                        |
| `Avatar` `variant`                                   | `AvatarVariant`             | `'primary'`                     | Fallback color.                                                         |
| `Avatar` `appearance`                                | `'filled' \| 'filledLight'` | `'filled'`                      | Brand fill or a tint of `variant`.                                      |
| `Avatar` `rounded`                                   | `boolean`                   | `false`                         | Circle; otherwise a rounded square. Group `rounded` applies unless set. |
| `Avatar` `hideShadow`                                | `boolean`                   | `false`                         | Removes the drop shadow.                                                |
| `Avatar` `name`                                      | `string`                    | -                               | Names the avatar as one `role="img"`; inner parts are hidden from AT.   |
| `Avatar.Image` `alt`                                 | `string`                    | -                               | Required unless the root has `name`.                                    |
| `Avatar.Image` `onLoadingStatusChange`               | `(status) => void`          | -                               | `loading` / `loaded` / `error`.                                         |
| `Avatar.Fallback` `delayMs`                          | `number`                    | -                               | Wait before rendering the fallback.                                     |
| `Avatar.Badge` `variant`                             | `BadgeVariant`              | `'success'`                     | Any Badge color.                                                        |
| `Avatar.Group` `max`                                 | `number`                    | -                               | Avatars past it collapse into `+N`.                                     |
| `Avatar.Group` `compact`                             | `boolean`                   | `false`                         | Bordered pill, badges hidden.                                           |
| `Avatar.Group` `overflowLabel` / `overflowAriaLabel` | `string`                    | `'+{count}'` / `'{count} more'` | `{count}` = hidden avatars; blank falls back.                           |

Every part also takes `className`, `classNames`, and `slotProps` (slots:
`Avatar.Fallback` `icon`, `Avatar.Group` `overflow`). Full props, data
attributes & type definitions: see `references/full-docs.md`.

## Accessibility

- Prefer `name` on `Avatar`: the person is announced once whether the picture or
  the fallback shows. Without it, give `Avatar.Image` an `alt`.
- `Avatar.Badge` is decorative (`aria-hidden`) unless it has an `aria-label`; do
  not convey presence by color alone when it matters — say it in text too.
- Name `Avatar.Group` with `aria-label`; it is a `role="group"`.
- Initials are not derived from `name` — pass them, so locale casing is yours.

## Reference

- Full component docs (Copy page): `references/full-docs.md`
- Live docs: https://v2.takeoffui.com/docs/components/avatar
- Source: `packages/react-spar/src/components/avatar/`
