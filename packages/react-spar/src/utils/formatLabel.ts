/**
 * Fills a label template: every `{key}` with a matching entry in `values` is
 * replaced by it, and an unknown placeholder is left as written. Placeholders
 * are what let a translation move a value inside the sentence; concatenating
 * strings only ever produces one word order, and it is English's. A
 * substituted value is never re-scanned, so a file name such as `{page}.pdf`
 * stays literal.
 */
export const formatLabel = (template: string, values: Record<string, number | string>): string =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => (Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match));
