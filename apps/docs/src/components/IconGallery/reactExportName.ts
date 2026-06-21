/**
 * Build the `@takeoff-icons/react` named export for an icon + variant, e.g.
 * ('add', 'outlined/rounded') -> 'AddIconOutlinedRounded'.
 *
 * Mirrors the casing the react package generator uses: PascalCase the kebab
 * name, then append `Icon<Style><Type>`. Digit-leading segments keep the
 * leading underscore the react package emits (e.g. `dialpad-4` -> `Dialpad_4`).
 *
 * Keep in sync with the same helper in `scripts/generate-icons.mjs`.
 */
export function reactExportName(iconName: string, variant: string): string {
  const [style, type] = variant.split('/');
  const pascal = (segments: string): string =>
    segments
      .split('-')
      .map(part => {
        if (!part) return '';
        const head = /^\d/u.test(part) ? `_${part}` : part;
        return head.charAt(0).toUpperCase() + head.slice(1);
      })
      .join('');
  const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);
  return `${pascal(iconName)}Icon${cap(style)}${cap(type)}`;
}
