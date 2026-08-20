---
name: takeoff-dropdown
description:
  Build keyboard-accessible action menus with the compound Dropdown component
  from @takeoff-ui/react-spar. Use whenever building, importing, styling, or
  fixing a dropdown menu, contextual action menu, overflow menu, grouped menu,
  menu item, or floating list of commands in a Takeoff / Spar React app.
---

# Dropdown — @takeoff-ui/react-spar

Use `Dropdown` for a trigger that opens a keyboard-accessible list of actions.
It wraps Spar's DropdownMenu primitives and adds Takeoff sizing, width, and
visual slots.

**When to use:** A trigger that opens a menu of _commands_ — row actions,
overflow ("⋯") menus, toolbar menus, account menus. Items fire an action via
`onSelect`; nothing is persisted as a value. Not this — use `takeoff-select`
when the user is picking a value that stays selected and submits with a form,
and `takeoff-popover` for arbitrary anchored content (forms, rich panels) rather
than a list of commands.

## Quick start

```tsx
import { Button, Dropdown } from '@takeoff-ui/react-spar';

<Dropdown>
  <Dropdown.Trigger as={Button}>Actions</Dropdown.Trigger>
  <Dropdown.Content>
    <Dropdown.Item onSelect={() => console.log('Edit')}>Edit</Dropdown.Item>
    <Dropdown.Separator />
    <Dropdown.Item disabled>Archive</Dropdown.Item>
  </Dropdown.Content>
</Dropdown>;
```

## Anatomy

Compose only the parts needed:

```tsx
<Dropdown>
  <Dropdown.Trigger />
  <Dropdown.Content>
    <Dropdown.Viewport>
      <Dropdown.Group>
        <Dropdown.Label />
        <Dropdown.Item />
      </Dropdown.Group>
      <Dropdown.Separator />
    </Dropdown.Viewport>
    <Dropdown.Arrow />
  </Dropdown.Content>
</Dropdown>
```

`Dropdown.Viewport` is optional for short menus. Use it when the menu can grow
long enough to scroll, and keep `Dropdown.Arrow` outside it so the pointer is
not clipped.

## Groups and selection

```tsx
<Dropdown>
  <Dropdown.Trigger as={Button}>Manage booking</Dropdown.Trigger>
  <Dropdown.Content>
    <Dropdown.Group>
      <Dropdown.Label>Flight</Dropdown.Label>
      <Dropdown.Item
        textValue="Change flight"
        onSelect={() => console.log('Change flight')}
      >
        Change flight
      </Dropdown.Item>
      <Dropdown.Item disabled>Refund receipt</Dropdown.Item>
    </Dropdown.Group>
    <Dropdown.Separator />
    <Dropdown.Item onSelect={() => console.log('Download invoice')}>
      Download invoice
    </Dropdown.Item>
  </Dropdown.Content>
</Dropdown>
```

`onSelect` receives a synthetic event. Use `textValue` when rendered content is
not plain text so Spar typeahead can still find the item.

## Controlled visibility

```tsx
import { useState } from 'react';

function ControlledMenu() {
  const [open, setOpen] = useState(false);

  return (
    <Dropdown open={open} onOpenChange={setOpen}>
      <Dropdown.Trigger as={Button}>
        {({ isOpen }) => (isOpen ? 'Close actions' : 'Open actions')}
      </Dropdown.Trigger>
      <Dropdown.Content>
        <Dropdown.Item onSelect={() => setOpen(false)}>Done</Dropdown.Item>
      </Dropdown.Content>
    </Dropdown>
  );
}
```

Prefer uncontrolled state unless another part of the application must observe or
change menu visibility.

## Placement, width, and scrolling

```tsx
const actions = ['Edit', 'Duplicate', 'Archive'];

function ScrollableActions() {
  return (
    <Dropdown size="small" contentWidth="trigger">
      <Dropdown.Trigger as={Button}>Actions</Dropdown.Trigger>
      <Dropdown.Content side="bottom" align="end">
        <Dropdown.Viewport className="max-h-60">
          {actions.map(action => (
            <Dropdown.Item key={action} onSelect={() => console.log(action)}>
              {action}
            </Dropdown.Item>
          ))}
        </Dropdown.Viewport>
        <Dropdown.Arrow />
      </Dropdown.Content>
    </Dropdown>
  );
}
```

`contentWidth` accepts natural content width, trigger width, a pixel number, or
any CSS width string. Content is portalled to `document.body` by default; pass
`container` to `Dropdown.Content` only when a different portal owner is needed.

## Key props

| API                       | Type                                         | Default     | Notes                                     |
| ------------------------- | -------------------------------------------- | ----------- | ----------------------------------------- |
| `size`                    | `'small' \| 'base' \| 'large'`               | `'base'`    | Shared menu density.                      |
| `contentWidth`            | `'content' \| 'trigger' \| number \| string` | `'content'` | Portalled panel width.                    |
| `open` / `defaultOpen`    | `boolean`                                    | — / `false` | Controlled or initial visibility.         |
| `onOpenChange`            | `(open: boolean) => void`                    | —           | Visibility callback.                      |
| `modal`                   | `boolean`                                    | `true`      | Enables modal focus behavior.             |
| `closeOnSelect`           | `boolean`                                    | `true`      | Closes after item selection.              |
| `Dropdown.Content side`   | `Side`                                       | `'bottom'`  | Preferred placement.                      |
| `Dropdown.Content align`  | `Align`                                      | `'center'`  | Alignment on the placement side.          |
| `Dropdown.Item disabled`  | `boolean`                                    | `false`     | Visible but not highlightable/selectable. |
| `Dropdown.Item textValue` | `string`                                     | —           | Search text for typeahead.                |

## Accessibility and keyboard

- Trigger exposes `aria-expanded`, `aria-haspopup="menu"`, and `aria-controls`.
- Enter/Space opens or selects; Arrow keys move highlight; Home/End jump; Escape
  closes and restores focus to the trigger.
- Focus management, collision handling, outside dismissal, and modal behavior
  remain owned by the Spar primitive.
- Do not use Dropdown as a form select. Use `Select` when choosing a value from
  a form field.
- Do not place interactive controls inside `Dropdown.Item`; use custom content
  outside item semantics when the panel must contain a form or complex widget.

Read `references/full-docs.md` for scrolling, custom content, placement, all
compound props, data attributes, accessibility, and type definitions.

## Source

- Docs: `apps/docs/docs/components/dropdown.mdx`
- Component: `packages/react-spar/src/components/dropdown/`
- Spar primitive: DropdownMenu
