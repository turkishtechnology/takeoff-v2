/**
 * Class-name map for a component base, with ALL slot classes required. This
 * differs from the customization surface's `ClassNamesOverride`, which makes
 * every slot optional because consumers only override specific slots.
 */
export type SlotClassNames<TSlot extends string> = Record<TSlot, string>;
