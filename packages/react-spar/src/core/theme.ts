import type { ClassNamesMap, SlotPropsMap } from './types';

/**
 * Per-component override config carried on the provider's `components` map.
 * The provider applies its layers below the instance, so an instance prop
 * always wins on conflict and the canonical `tk-*` class is never dropped.
 *
 * @typeParam TProps      Public props of the component this entry targets.
 * @typeParam TSlot       Slot key union; defaults to `'root'` for single-slot entries.
 * @typeParam TSlotProps  Per-slot attribute map; narrow per element type when needed.
 */
export interface ComponentThemeConfig<TProps = unknown, TSlot extends string = 'root', TSlotProps extends SlotPropsMap<TSlot, object> = SlotPropsMap<TSlot>> {
  /** Applied only when the instance does not set the prop. */
  defaultProps?: Partial<TProps>;
  /** Shortcut equivalent to `classNames.root`; concatenated, never replaces the canonical class. */
  className?: string;
  /** Per-slot extra classes; concatenated, never replaces the canonical class. */
  classNames?: ClassNamesMap<TSlot>;
  /** Per-slot HTML-attribute overrides; shallow-merged below the wrapper's canonical attrs. */
  slotProps?: TSlotProps;
}

/**
 * Provider override config for **state-only roots** — components whose root
 * renders no DOM (e.g. `Drawer`, `Tooltip`). Styling layers (`className`,
 * `classNames`, `slotProps`) have no DOM target on a state-only root and
 * would be silently dropped, so this variant exposes only `defaultProps`.
 *
 * Use this in the registry for any root whose JSX is a pure context
 * provider. Children parts (e.g. `Drawer.Panel`, `Tooltip.Content`) still
 * use {@link ComponentThemeConfig} because they render real DOM.
 *
 * @typeParam TProps  Public props of the state-only root.
 */
export interface StateOnlyComponentThemeConfig<TProps = unknown> {
  /** Applied only when the instance does not set the prop. */
  defaultProps?: Partial<TProps>;
}

/**
 * Registry of every component name the provider can override. Declared as
 * `interface` so consumers can augment it via TypeScript declaration merging.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ComponentThemeRegistry {}

export type ComponentName = keyof ComponentThemeRegistry;

/** Provider-facing override map. Each entry is optional. */
export type ComponentsThemeMap = {
  [K in ComponentName]?: ComponentThemeRegistry[K];
};
