const isUsableLabel = (value: unknown): value is string => typeof value === 'string' && value.trim() !== '';

/**
 * Merges a component's `labels` layers (e.g. provider `defaultProps.labels`,
 * then the instance `labels`) over its English defaults, key by key, so a
 * per-instance override keeps the app-wide strings for every other key.
 * Missing, empty, whitespace-only and non-string values (e.g. from a loose
 * JSON file) fall back, so no control is ever left without a name, and keys
 * absent from `defaults` are dropped. A key whose default is `undefined` is
 * optional: it stays `undefined` until a layer sets it, so the component can
 * defer to a child's own default.
 */
export const resolveLabels = <T extends Partial<Record<keyof T, string>>>(defaults: T, ...layers: (Partial<T> | undefined)[]): T => {
  const labels = { ...defaults };
  for (const layer of layers) {
    if (!layer) continue;
    for (const key of Object.keys(layer) as (keyof T)[]) {
      const value: unknown = layer[key];
      if (isUsableLabel(value) && Object.prototype.hasOwnProperty.call(defaults, key)) labels[key] = value as T[keyof T];
    }
  }
  return labels;
};
