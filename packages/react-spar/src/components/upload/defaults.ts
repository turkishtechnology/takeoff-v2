import type { UploadFileStatus } from './types';

export const DEFAULT_MULTIPLE = false;
export const DEFAULT_DIRECTORY = false;

// The resting state, and so the one an entry that states no status means.
export const DEFAULT_STATUS: UploadFileStatus = 'idle';

// Every string the component renders on its own, one constant per root prop —
// the library's shape for copy it ships (`Stepper`'s completed/error suffixes,
// `Alert`'s close, `Chip`'s remove), so a consumer overrides one word by naming
// it rather than by restating a dictionary.
//
// The status four are visible copy rather than Stepper's visually-hidden
// suffixes — the glyph beside them is `aria-hidden`, so they carry the meaning
// for every user at once. They name the state alone: the row already shows which
// file it is and that it is an upload, so repeating either ("Upload failed")
// only makes the line longer. The in-flight two take a trailing `…` and the
// settled two do not, which is the only thing the reader has to tell them apart
// at a glance.
export const DEFAULT_UPLOADING_LABEL = 'Uploading…';
export const DEFAULT_PROCESSING_LABEL = 'Processing…';
export const DEFAULT_COMPLETED_LABEL = 'Completed';
export const DEFAULT_ERROR_LABEL = 'Failed';

// The other three are accessible names, and each names a file: concurrent
// uploads stay distinguishable to a screen reader only if the row's own file is
// in the string. They carry it as a `{name}` placeholder rather than being
// glued to it, because the position is language's — English puts the verb first
// (`Download report.pdf`), Turkish puts it last (`report.pdf dosyasını indir`).
// The progress one leads with the name where the action two trail it,
// deliberately: several bars can be running at once, and the file is what tells
// them apart, so a screen reader should reach it before the boilerplate.
//
// These are also the three an emptied override cannot blank, which is why the
// root resolves them with `||` where the status four use `??`: silencing visible
// text is a legitimate choice (the status line simply goes away, Stepper's
// rule), but silencing these leaves a button that announces itself as nothing at
// all, and no consumer means that. Blank ones fall back to the shipped default.
export const DEFAULT_PROGRESS_LABEL = '{name} upload progress';
export const DEFAULT_DOWNLOAD_LABEL = 'Download {name}';
export const DEFAULT_REMOVE_LABEL = 'Remove {name}';
