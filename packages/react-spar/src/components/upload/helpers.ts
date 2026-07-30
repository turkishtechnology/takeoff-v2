import type { FileIconName } from '../../icons';

import { DEFAULT_STATUS } from './defaults';
import type { UploadFile, UploadFileStatus, UploadRejection } from './types';

/**
 * Dedupe identity for a raw File (which has no id): same name, size, and mtime
 * are treated as the same file. A directory pick supplies `webkitRelativePath`
 * (empty for ordinary picks), which keeps two identical files sitting in
 * different folders apart. The UploadFile `id` is separate and stable.
 */
export const fileKey = (file: File): string => `${file.webkitRelativePath || file.name}:${file.size}:${file.lastModified}`;

let idCounter = 0;

/** Stable id for a newly wrapped file. Prefers `crypto.randomUUID` when available. */
export const generateId = (): string => {
  const cryptoObj = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
  if (cryptoObj && typeof cryptoObj.randomUUID === 'function') {
    try {
      return cryptoObj.randomUUID();
    } catch {
      // randomUUID throws outside a secure context — fall through to the counter.
    }
  }
  idCounter += 1;
  return `tk-upload-${idCounter}-${Date.now().toString(36)}`;
};

/** Wraps a picked/dropped `File` into an `UploadFile` with `status: 'idle'`. */
export const createUploadFile = (file: File): UploadFile => ({
  id: generateId(),
  file,
  name: file.name,
  size: file.size,
  type: file.type,
  status: DEFAULT_STATUS,
});

/**
 * One rule for every value an entry can state twice: what the entry itself
 * carries wins, and the wrapped `File` is the fallback. Every derived read goes
 * through these so a hand-built entry cannot have its name resolve one way and
 * its size another. A name an entry states nowhere is empty rather than absent —
 * a remote one has no bytes to fall back on, so it is the entry's job to name
 * itself.
 *
 * A size has no such empty value: `0` is not "unknown", it is the claim that the
 * file has no bytes in it. So an unstated one stays `undefined` and the row
 * leaves the slot out, rather than printing a number nobody supplied for the
 * server-side attachment whose byte count the API did not return.
 */
export const fileName = (item: UploadFile): string => item.name ?? item.file?.name ?? '';

export const fileSize = (item: UploadFile): number | undefined => item.size ?? item.file?.size;

export const fileType = (item: UploadFile): string | undefined => item.type ?? item.file?.type;

/** An entry's status, resolving an omitted one to the resting `'idle'`. */
export const fileStatus = (item: UploadFile): UploadFileStatus => item.status ?? DEFAULT_STATUS;

/**
 * Fills a label template with the file it names: every `{name}` is replaced,
 * and a template with none is used as written. The placeholder is what lets a
 * translation move the name inside the sentence — concatenating a verb and a
 * name only ever produces one word order, and it is English's.
 */
export const formatFileLabel = (template: string, name: string): string => template.split('{name}').join(name);

// The size is the one thing the row renders that no label prop can reach: it is
// a number, and both halves of writing it down — which unit, and where the
// decimal mark goes — are the locale's to decide, not a translator's. `Intl`
// already knows all of it, so the units are named as CLDR names them rather
// than hardcoded, and the digits are grouped and pointed the same way every
// other number in the app is (`1.2 MB` in English, `1,2 MB` in Turkish).
const SIZE_UNITS = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte'] as const;

// One formatter per unit, built on first use: `Intl.NumberFormat` is expensive
// to construct and a list re-renders per file, per keystroke elsewhere on the
// page. The runtime's own locale is used (no argument), which is the same one
// the rest of the page formats in.
const sizeFormatters = new Map<number, Intl.NumberFormat>();
const sizeFormatter = (exponent: number): Intl.NumberFormat => {
  let formatter = sizeFormatters.get(exponent);
  if (!formatter) {
    formatter = new Intl.NumberFormat(undefined, { style: 'unit', unit: SIZE_UNITS[exponent], unitDisplay: 'short' });
    sizeFormatters.set(exponent, formatter);
  }
  return formatter;
};

// Whole numbers below 1 KB and large values read better without a decimal.
const roundForUnit = (value: number, exponent: number): number => (exponent === 0 || value >= 100 ? Math.round(value) : Math.round(value * 10) / 10);

/**
 * Human-readable file size, formatted for the runtime's locale. Divided by 1024
 * per step, the base a file manager counts in; the unit it is labelled with is
 * CLDR's (`kB`, `MB`), which is the SI name for a slightly smaller number — the
 * same rounding every desktop makes, and the price of letting the platform name
 * and punctuate it instead of shipping a table of strings no label prop could
 * reach.
 */
export const formatFileSize = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return sizeFormatter(0).format(0);
  // Clamped at both ends, not just the top: a fractional size (an API's byte
  // count divided down) gives a *negative* exponent, which indexes past the
  // start of the unit list and makes `Intl.NumberFormat` throw on `unit: ''` —
  // inside render, so it takes the whole row down rather than the size text.
  let exponent = Math.max(0, Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), SIZE_UNITS.length - 1));
  let rounded = roundForUnit(bytes / 1024 ** exponent, exponent);
  // Rounding can carry a value past the unit that was picked for it: one byte
  // under 1 MB is 1023.999 KB, which rounds to the "1024 KB" the next unit
  // exists to say. Carrying it over keeps the number and its unit in step.
  if (rounded >= 1024 && exponent < SIZE_UNITS.length - 1) {
    exponent += 1;
    rounded = roundForUnit(bytes / 1024 ** exponent, exponent);
  }
  return sizeFormatter(exponent).format(rounded);
};

// Revoking the object URL inline can cancel the save mid-flight (Safari,
// Firefox), so the handle is released a beat later instead.
const OBJECT_URL_TTL_MS = 1000;

/** Whether `saveUploadFile` has anything to hand the browser. */
export const canSaveUploadFile = (item: UploadFile): boolean => Boolean(item.file || item.url);

/**
 * Saves an entry to the user's device: a picked `File` through a temporary
 * object URL, a preloaded entry through its own `url`. No-op for an entry that
 * carries neither (nothing to save). Cross-origin `url`s ignore the `download`
 * attribute by spec and open instead — route those through a same-origin proxy
 * or `Upload.ItemAction`'s `onClick` if saving must be guaranteed.
 */
export const saveUploadFile = (item: UploadFile): void => {
  const canCreate = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function';
  const objectUrl = item.file && canCreate ? URL.createObjectURL(item.file) : undefined;
  const href = objectUrl ?? item.url;
  if (!href) return;

  const link = document.createElement('a');
  link.href = href;
  link.download = fileName(item);
  // Firefox only dispatches the download for a link that is in the document.
  document.body.append(link);
  link.click();
  link.remove();

  if (objectUrl) setTimeout(() => URL.revokeObjectURL(objectUrl), OBJECT_URL_TTL_MS);
};

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif', 'image/svg+xml']);

export const isImageType = (type: string | undefined): boolean => type !== undefined && IMAGE_TYPES.has(type);

/**
 * Upper-cased extension (without the dot) from a file name, or `''` when it has
 * none. A leading dot is a hidden-file prefix rather than a separator, so
 * `.env` has no extension — reading one there would badge the file `ENV`, and
 * would hand a file named `.pdf` the PDF document icon.
 */
export const nameExtension = (name: string): string => {
  const dot = name.lastIndexOf('.');
  return dot > 0 ? name.slice(dot + 1).toUpperCase() : '';
};

// Which shipped icon stands for which file. Extension first (it is what the
// user sees and what a remote entry always carries), MIME as the fallback for
// names without one. Anything unmapped has no icon — the preview then shows the
// extension badge rather than a misleading glyph, since the set labels each
// icon with its own format.
const ICON_BY_EXTENSION: Record<string, FileIconName> = {
  DOC: 'word',
  DOCX: 'word',
  JPEG: 'jpg',
  JPG: 'jpg',
  MP4: 'mp4',
  PDF: 'pdf',
  PNG: 'png',
  PPT: 'powerpoint',
  PPTX: 'powerpoint',
  TXT: 'text',
  XLS: 'excel',
  XLSX: 'excel',
  ZIP: 'zip',
};

const ICON_BY_TYPE: Record<string, FileIconName> = {
  'application/msword': 'word',
  'application/pdf': 'pdf',
  'application/vnd.ms-excel': 'excel',
  'application/vnd.ms-powerpoint': 'powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'powerpoint',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'excel',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'word',
  'application/zip': 'zip',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'text/plain': 'text',
  'video/mp4': 'mp4',
};

/** The shipped icon for an entry, or `undefined` when its format has none. */
export const fileIconName = (item: UploadFile): FileIconName | undefined => {
  const type = fileType(item);
  return ICON_BY_EXTENSION[nameExtension(fileName(item))] ?? (type ? ICON_BY_TYPE[type.toLowerCase()] : undefined);
};

const isWildcard = (token: string): boolean => token === '*' || token === '*/*';

/**
 * The `accept` list as the tokens it actually states: split, trimmed,
 * lowercased, and with the empty ones dropped.
 *
 * Dropping them is the point. An empty token used to read as "accept anything",
 * which made a single trailing separator switch type validation off for the
 * whole list — and `accept` is routinely built by joining a config array, where
 * a stray comma is a typo rather than a decision. A malformed list is the
 * tokens it does state, and a list that states none is the same as no list.
 */
const acceptTokens = (accept: string | undefined): string[] =>
  accept
    ? accept
        .split(',')
        .map(token => token.trim().toLowerCase())
        .filter(token => token !== '')
    : [];

/** Whether the list constrains nothing: absent, blank, or holding a wildcard. */
const acceptsAnything = (tokens: string[]): boolean => tokens.length === 0 || tokens.some(isWildcard);

/**
 * Does `file` satisfy a single `accept` token (already trimmed + lowercased)?
 * Fixes Core's loose `accept.includes(type)` check: a `.ext` token matches the
 * file name, a `type/*` token matches the MIME prefix, and anything else is an
 * exact MIME match.
 */
const tokenMatchesFile = (token: string, file: File): boolean => {
  if (token.startsWith('.')) return file.name.toLowerCase().endsWith(token);
  const type = file.type.toLowerCase();
  if (token.endsWith('/*')) return type.startsWith(token.slice(0, -1));
  return type === token;
};

/** Whether a file satisfies the `accept` list (comma-separated). Empty/`*` accepts anything. */
export const matchesAccept = (file: File, accept: string | undefined): boolean => {
  const tokens = acceptTokens(accept);
  if (acceptsAnything(tokens)) return true;
  return tokens.some(token => tokenMatchesFile(token, file));
};

/**
 * Type-only accept check for a drag payload item, for the dropzone's
 * accept/reject hint. Mid-drag only the MIME type is known — no name, size, or
 * count — so a `.ext` token cannot be judged at all.
 *
 * An unjudgeable token withholds the hint rather than deciding against the
 * payload: `accept=".pdf"` (or `"image/*,.pdf"`) would otherwise paint the zone
 * red for a PDF and then accept the very same file on release, which is worse
 * than showing nothing. So a rejection is only asserted when every token the
 * list states could be evaluated and none of them matched.
 */
export const acceptMatchesType = (type: string, accept: string | undefined): boolean => {
  const tokens = acceptTokens(accept);
  if (acceptsAnything(tokens)) return true;
  const t = type.toLowerCase();
  let unjudgeable = false;
  for (const token of tokens) {
    if (token.startsWith('.')) {
      unjudgeable = true;
      continue;
    }
    if (token.endsWith('/*') ? t.startsWith(token.slice(0, -1)) : t === token) return true;
  }
  return unjudgeable;
};

export interface ValidateOptions {
  accept?: string;
  maxFileSize?: number;
  maxFileCount?: number;
  multiple: boolean;
  currentCount: number;
}

export interface ValidateResult {
  accepted: File[];
  rejected: UploadRejection[];
}

/**
 * Split an incoming batch into accepted files and rejections. Validation order
 * per file: type → size → remaining slots (count). A non-multiple upload has a
 * single slot and replaces on the next accepted file.
 */
export const validateFiles = (incoming: File[], options: ValidateOptions): ValidateResult => {
  const { accept, maxFileSize, maxFileCount, multiple, currentCount } = options;
  const accepted: File[] = [];
  const rejected: UploadRejection[] = [];

  const limit = multiple ? maxFileCount : 1;
  // For multiple, remaining slots account for already-held files; a single
  // upload always has one slot (the accepted file replaces the current one).
  let slots = limit === undefined ? Number.POSITIVE_INFINITY : Math.max(0, limit - (multiple ? currentCount : 0));

  for (const file of incoming) {
    // Each rejection carries the limit it broke rather than a sentence about
    // it: nothing here reaches the screen through the component, so the wording
    // (and its language) belongs to whoever displays it.
    if (!matchesAccept(file, accept)) {
      // `accept` is necessarily a real list here — `matchesAccept` passes
      // everything when it is absent or a wildcard.
      rejected.push({ file, code: 'file-invalid-type', accept: accept as string });
      continue;
    }
    if (maxFileSize !== undefined && file.size > maxFileSize) {
      rejected.push({ file, code: 'file-too-large', maxFileSize });
      continue;
    }
    if (slots <= 0) {
      // `limit` is a number whenever slots can run out: an unbounded multiple
      // upload starts at Infinity and never reaches this branch.
      rejected.push({ file, code: 'too-many-files', maxFileCount: limit as number });
      continue;
    }
    accepted.push(file);
    slots -= 1;
  }

  return { accepted, rejected };
};
