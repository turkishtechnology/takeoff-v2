/** Shared vocabulary for the gallery's controls. */

export type IconStyle = 'outlined' | 'filled';

export const ICON_STYLES: { value: IconStyle; label: string }[] = [
  { value: 'outlined', label: 'Outlined' },
  { value: 'filled', label: 'Filled' },
];

export const ICON_TYPES: { value: string; label: string }[] = [
  { value: 'rounded', label: 'Rounded' },
  { value: 'sharp', label: 'Sharp' },
  { value: 'bevel', label: 'Bevel' },
  { value: 'tk', label: 'TK' },
];

/** Steps offered by the size picker. */
export const ICON_SIZES = [16, 20, 24, 32, 48] as const;

export const DEFAULT_ICON_SIZE = 32;

/** Brand red, shown as the colour box's placeholder while no override is set. */
export const PLACEHOLDER_COLOR = '#c90019';

/** `arrow-circle-down` -> `Arrow Circle Down`, the label shown under a cell. */
export function titleCase(name: string): string {
  return name
    .split('-')
    .map(part => (part ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join(' ');
}
