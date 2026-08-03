---
'@takeoff-ui/react-spar': minor
'@takeoff-design/tokens': minor
---

Add the `Upload` file control — a click-to-browse trigger, a drag-and-drop
dropzone, a per-file list with previews and status, validation, and a read-only
view mode — plus the matching `tk-upload` recipes in the tokens package.

`Upload` is composition-first: the root owns the value and the validation, and
every capability comes from placing the matching part rather than toggling a
prop — no `Upload.Dropzone`, no drag-and-drop. The anatomy is `Upload.Dropzone`,
`Upload.Actions`, `Upload.Trigger`, `Upload.Submit`, and `Upload.List` with an
`Upload.Item` per file, whose `Upload.ItemPreview` / `Upload.ItemContent` /
`Upload.ItemActions` regions render by default and are replaced by composing
that part in the row.

It owns selection, validation, and drag-and-drop only — no part performs the
network upload, `Upload.Submit` included. That stays the consumer's: started
from `onFileAccept` as files are accepted, or from `Upload.Submit`'s `onClick`
when the user sends the batch. `status` / `progress` are consumer-owned for the
same reason. The component only displays them (`idle` / `uploading` /
`processing` / `completed` / `error`), and the progress bar draws only while
`uploading` with a numeric `progress`.

`Upload.Submit` is a `Button` that disables itself whenever sending makes no
sense — while the value is empty, and while a batch is already going (any file
`uploading` or `processing`), which is the double-submit guard the status
vocabulary makes cheap. It takes `Upload.Trigger`'s `outlined` / `neutral`
treatment rather than Button's own. Its place is beside the Trigger, in the zone
— browse and send are one decision — and since the zone stacks its children, the
two go in an `Upload.Actions`: a layout row that holds whatever is put in it,
`--spacing-m-base` apart, so a third control or a file count sits on the same
line just as well. `readOnly` leaves Submit live, since handing a fixed list
upstream does not change it.

The value is an `UploadFile` that points at a `File` rather than being one — a
plain object with no constructor to import, so an attachment that already lives
on the server is described with a `url` and an optional `thumbUrl`. Validation
runs on `accept`, `maxFileSize`, `maxFileCount`, and `multiple`; rejected files
never enter `value`, and `onFilesReject` hands back the limit that broke
(`file-too-large`, `file-invalid-type`, `too-many-files`) rather than a
sentence. `onFileAccept` reports only the entries that just arrived.

`Upload.ItemAction` is the single per-file control: `action` names it and is
mirrored as `data-action`, `'download'` and `'remove'` arrive wired, and any
other name — `'preview'`, `'retry'` — takes its behavior from `onClick`, its
glyph from `children`, and its wording from `label`. Built-in behavior runs
after `onClick` unless it is `preventDefault()`ed — the same veto
`Upload.Trigger` honours, and one `Upload.Dropzone` deliberately does not, since
on a drop `preventDefault()` is required boilerplate rather than an intent. The
part is polymorphic, so `as="a"` with an `href` hands the download to the
platform, and an `as`-rendered control stays activatable from the keyboard.

`Upload.ItemPreview` draws an image thumbnail (`thumbUrl`, or the file itself
through an object URL revoked on unmount), a shipped Takeoff icon for the known
formats, or the uppercased extension as a badge — matched on extension first,
MIME type second, with a failed image falling back to the icon.

Every word the component renders on its own comes from a root prop, one per
string — `uploadingLabel`, `processingLabel`, `completedLabel`, `errorLabel`,
`progressLabel`, `downloadLabel`, `removeLabel` — so a localized app sets them
app-wide through the provider's `components` map. The accessible-name three take
`{name}` as a placeholder rather than a suffix, so a translation can move the
file name inside the sentence; emptying a status string silences it, while the
other three are accessible names on icon-only controls and cannot be silenced.
File size is a number, not a label, so `Intl` formats it in the runtime's
locale.

`readOnly` keeps files rendered and downloadable but drops the remove action
entirely and freezes `Upload.Trigger` in place; `disabled` changes no shape and
goes inert under the root's `data-disabled`; `invalid` is the danger treatment.
All three resolve as `own prop ?? Field ?? false`, and composing inside a
`Field` wires the label and helper/error text to the root's `role="group"`.

The docs API generator changed with it: `escapeMarkdownCell` now writes `{` and
`}` as entities outside inline code spans, because a JSDoc `@defaultValue`
carrying a `{name}` placeholder reached the mdx unescaped and MDX parsed it as a
JSX expression, failing SSG. It is shared infrastructure rather than an Upload
detail — every generated API table goes through it, so re-running `gen:api` can
reflow cells on component pages that have nothing to do with this change.
