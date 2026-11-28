import { buildSlotAttrs, type ClassNamesMap, type ComponentBase, type SlotPropsMap } from '../../core';

interface SlotLayers<TSlot extends string> {
  classNames?: ClassNamesMap<TSlot>;
  slotProps?: SlotPropsMap<TSlot>;
}

/** Canonical attrs for a non-root slot, layering theme then instance overrides. */
export const slotAttrs = <TProps, TSlot extends string>(
  base: ComponentBase<TProps, TSlot>,
  slot: TSlot,
  theme: SlotLayers<TSlot> | undefined,
  props: SlotLayers<TSlot>,
): Record<string, unknown> & { className?: string } =>
  buildSlotAttrs(base.getSlotProps(slot), slot, {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: props.slotProps,
    instanceClassNames: props.classNames,
  });

/** Checkerboard-backed paint for a color that may be translucent. */
export const swatchStyle = (color: string): Record<string, string> => ({ '--tk-color-picker-color': color });
