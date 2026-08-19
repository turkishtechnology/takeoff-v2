---
name: takeoff-upload
description:
  'File upload control with a click-to-browse trigger, drag-and-drop dropzone,
  per-file list, validation, and read-only view mode. This is the Upload from
  @takeoff-ui/react-spar (Takeoff UI / Spar React). Use WHENEVER building,
  adding, importing, styling, or fixing a file upload, file picker, attachment
  field, dropzone, drag-and-drop upload, file list, or image upload in a React
  app that uses @takeoff-ui/react-spar / Takeoff / Spar. Triggers: upload,
  takeoff upload, file upload, Upload.Dropzone, dropzone, attachment, file
  picker, drag and drop files.'
---

# Upload — @takeoff-ui/react-spar

`Upload` is a compound, composition-first file control. The root owns the value
and the validation; the dropzone, trigger, list, and per-file actions are parts
you compose — **the parts you place are the parts you get**. There is no
`dropzone` boolean to switch on: place `Upload.Dropzone` and you have
drag-and-drop, leave it out and there is none.

**It never uploads.** No part of it does, `Upload.Submit` included. The transfer
is yours: start it from `onFileAccept` as files are accepted, or from
`Upload.Submit`'s `onClick` when the user sends the batch.

**When to use:** attaching files to a form, a review-then-send batch, an
avatar/image picker. Not this — use `takeoff-input` for plain text entry, and
wrap in `takeoff-field` when you need a label, helper text, or error copy.

## Setup

Requires the Takeoff provider + token CSS mounted once at the app root (see the
`takeoff-ui` skill or the installation docs). Then import:

```tsx
import { Upload } from '@takeoff-ui/react-spar';
```

`Upload` is a compound component — all sub-parts are accessed as `Upload.*`.

## Compound parts

- `Upload.Dropzone` — the drop target; owns `data-drag-state`. Stacks its
  children.
- `Upload.Actions` — a plain layout row for controls that share a line. The zone
  stacks its children, so a Trigger and a Submit written as bare siblings each
  take a line of their own; wrap them in this to put them side by side. No
  behavior.
- `Upload.Trigger` — browse button; opens the native picker.
- `Upload.Submit` — optional send button; disables itself while the value is
  empty and while a batch is in flight. Does **not** upload.
- `Upload.List` — the rows. Function children (`files => …`) is the usual form,
  so each `Upload.Item` gets its `file` and every action closes over it.
- `Upload.Item` — one file's row: three regions in a fixed order.
- `Upload.ItemPreview` / `Upload.ItemContent` / `Upload.ItemActions` — the row's
  regions. They render by default; composing one **replaces** that region.
- `Upload.ItemAction` — a row action. `action="download"` and `action="remove"`
  ship wired; any other name is yours (`onClick` supplies the behavior).

## Basic usage

```tsx
<Upload accept="image/*" multiple onFileAccept={files => send(files)}>
  <Upload.Dropzone>
    <span>Choose a file or drop it here.</span>
    <Upload.Actions>
      <Upload.Trigger>Choose Files</Upload.Trigger>
    </Upload.Actions>
  </Upload.Dropzone>
  <Upload.List />
</Upload>
```

## Examples

### Browse + send on one line

`Upload.Dropzone` stacks its children, so the pair needs `Upload.Actions` to
share a row. Nothing is inferred — a lone Trigger needs no wrapper.

```tsx
<Upload.Dropzone>
  <span>Attach what you need — nothing is sent until you say so.</span>
  <Upload.Actions>
    <Upload.Trigger>Choose Files</Upload.Trigger>
    {/* No disabled={inFlight} — Submit already takes itself down while a
        batch is going. Only the label is yours. */}
    <Upload.Submit onClick={send}>
      {inFlight ? 'Sending…' : 'Send'}
    </Upload.Submit>
  </Upload.Actions>
</Upload.Dropzone>
```

### Controlled value

The value is an `UploadFile` — a plain object pointing **at** a `File`, not a
`File` subclass — so a server-rendered attachment needs no constructor:

```tsx
const [files, setFiles] = useState([
  { id: 'a1', name: 'contract.pdf', size: 91234, url: '/files/a1' },
]);

<Upload value={files} onValueChange={setFiles} multiple>
  <Upload.Dropzone>
    <Upload.Actions>
      <Upload.Trigger>Choose Files</Upload.Trigger>
    </Upload.Actions>
  </Upload.Dropzone>
  <Upload.List />
</Upload>;
```

### Custom rows

```tsx
<Upload.List>
  {files =>
    files.map(file => (
      <Upload.Item key={file.id} file={file}>
        <Upload.ItemActions>
          <Upload.ItemAction action="download" />
          <Upload.ItemAction label="Preview {name}" onClick={() => open(file)}>
            <OpenIconOutlinedRounded />
          </Upload.ItemAction>
          <Upload.ItemAction action="remove" />
        </Upload.ItemActions>
      </Upload.Item>
    ))
  }
</Upload.List>
```

Labels are `{name}` templates, not a verb glued to a filename — that is what
lets a translation put the name where its grammar needs it.

### Status & progress

Status is display-only; you own the transfer, so you own the state:

```tsx
setFiles(prev =>
  prev.map(f =>
    f.id === id ? { ...f, status: 'uploading', progress: 40 } : f,
  ),
);
```

`status` is `'idle' | 'uploading' | 'processing' | 'completed' | 'error'`; pair
`'error'` with `error` for the message, and `'uploading'` with a numeric
`progress`. `Upload.Submit` reads it — it disables itself while any file is
`uploading` or `processing`, so you do not wire a double-submit guard yourself.

## Key props

| Prop            | Type                                      | Default | Notes                                                                     |
| --------------- | ----------------------------------------- | ------- | ------------------------------------------------------------------------- |
| `value`         | `UploadFile[]`                            | -       | Controlled value (pair with `onValueChange`). On `Upload`.                |
| `defaultValue`  | `UploadFile[]`                            | `[]`    | Initial value, uncontrolled. On `Upload`.                                 |
| `onValueChange` | `(files: UploadFile[]) => void`           | -       | Fired on every commit — add, remove, clear. On `Upload`.                  |
| `onFileAccept`  | `(files: UploadFile[]) => void`           | -       | Just the newly accepted files; where you start the transfer. On `Upload`. |
| `onFilesReject` | `(rejections: UploadRejection[]) => void` | -       | Each rejection carries the limit it broke, not a sentence. On `Upload`.   |
| `accept`        | `string`                                  | -       | Comma-separated MIME types / `.ext`, as the native input takes it.        |
| `multiple`      | `boolean`                                 | `false` | Without it, an accepted file replaces the current one. On `Upload`.       |
| `maxFileSize`   | `number`                                  | -       | Bytes. On `Upload`.                                                       |
| `maxFileCount`  | `number`                                  | -       | Counts the flattened batch. On `Upload`.                                  |
| `directory`     | `boolean`                                 | `false` | Folder picking. Implies `multiple`; dropping a folder does not expand it. |
| `disabled`      | `boolean`                                 | `false` | Freezes everything. On `Upload`.                                          |
| `readOnly`      | `boolean`                                 | `false` | View mode: Trigger freezes, remove unmounts, Submit stays live.           |
| `file`          | `UploadFile`                              | -       | The row's file. Required on `Upload.Item`.                                |
| `action`        | `'download' \| 'remove' \| string`        | -       | Built-in behavior for the first two. On `Upload.ItemAction`.              |
| `label`         | `string`                                  | -       | `{name}` template for the accessible name. On `Upload.ItemAction`.        |

The three button parts (`Upload.Trigger`, `Upload.Submit`, `Upload.ItemAction`)
forward `Button`'s look as defaults you can re-point:

| Prop         | Type               | Default                          | Notes                                                          |
| ------------ | ------------------ | -------------------------------- | -------------------------------------------------------------- |
| `appearance` | `ButtonAppearance` | `'outlined'`                     | Trigger and Submit match deliberately, so they read as a pair. |
| `variant`    | `ButtonVariant`    | `'neutral'`                      | Go `filled` / `primary` where sending is the page's action.    |
| `size`       | `ButtonSize`       | `'small'` on `Upload.ItemAction` | Row actions are small icon buttons.                            |

Full props, events, data attributes & type definitions: see
`references/full-docs.md`.

## Localization

Every string the component renders on its own is a root prop, so a localized app
sets them once through the provider's `components` map:

| Prop              | Default                    | Notes                                         |
| ----------------- | -------------------------- | --------------------------------------------- |
| `uploadingLabel`  | `'Uploading…'`             | Visible status text. Emptying it silences it. |
| `processingLabel` | `'Processing…'`            | Same.                                         |
| `completedLabel`  | `'Completed'`              | Same.                                         |
| `errorLabel`      | `'Failed'`                 | Same.                                         |
| `progressLabel`   | `'{name} upload progress'` | Accessible name — cannot be silenced.         |
| `downloadLabel`   | `'Download {name}'`        | Same.                                         |
| `removeLabel`     | `'Remove {name}'`          | Same.                                         |

The last three name icon-only controls, so an emptied override falls back to the
shipped default rather than leaving an unnamed button. `{name}` is a placeholder
rather than a suffix — that is what lets a translation put the file name where
its grammar needs it.

File size is not a label: it is a number, so `Intl` writes it — unit and decimal
mark both — rather than a translator.

## Styling escape hatch

`classNames` / `slotProps` reach every slot. `Upload.ItemPreview` is the one
with a non-trivial slot map: its `image` slot takes real `ImgHTMLAttributes`,
which is how you set `loading`, `decoding`, or a `referrerPolicy` on the
thumbnail.

```tsx
<Upload.ItemPreview
  slotProps={{ image: { loading: 'lazy', decoding: 'async' } }}
/>
```

## Gotchas

- **Nothing uploads itself.** `Upload.Submit` is a button that knows when
  sending makes sense — empty value, batch in flight — but the network call is
  yours. Do not add your own `disabled={inFlight}`; it is already handled.
- **Dedupe is by name + size + mtime** (plus folder path on a directory pick),
  so re-picking a file already held is a no-op rather than a second row.
- **Composing a row region replaces it.** Writing `Upload.ItemActions` replaces
  the default action pair rather than joining it.
- **`Upload.Actions` is layout only** — it is never inferred, so a Trigger and a
  Submit written as bare siblings in the zone will stack.
- **`preventDefault()` vetoes a click, not a drop.** On `Upload.Trigger` and
  `Upload.ItemAction`, preventing the default in your `onClick` stands the
  built-in behavior down. `Upload.Dropzone` does **not** honour it — on a drop
  `preventDefault()` is the boilerplate that stops the browser navigating to the
  file, so the zone always commits; control what lands through the root's
  `value` / `onValueChange`.
- **`readOnly` is not `disabled`.** Read-only keeps every read action working
  and drops only the remove; `disabled` freezes the anatomy's shape as it is.
- **Every part must sit inside `Upload`** — each throws when it does not.

## Accessibility

- The native `<input type="file">` stays in the DOM, visually hidden, and is
  what `Upload.Trigger` opens — so the picker is the platform's.
- Icon-only row actions are named per file from the `{name}` template
  (`downloadLabel` / `removeLabel` on the root, or `label` on the action), so
  they localize with the rest of your copy.
- Removing a row moves focus to the next row's matching action before the row
  unmounts (falling back to the row above, then to `Upload.Trigger`), so a
  keyboard user is never dropped to `<body>` mid-list.
- Parts rendered through `as` keep working under Enter/Space, and an `as="a"`
  action is announced as a link rather than a button while it has an `href`.
- Compose with `Field` for the label, helper text, and error wiring; `Field`'s
  `disabled` / `readOnly` / `invalid` flow down unless the Upload sets its own.

## Reference

- Full component docs (Copy page): `references/full-docs.md`
- Live docs: https://takeoff-v2.app.turkishtechlab.com/docs/components/upload
- Source: `packages/react-spar/src/components/upload/`
