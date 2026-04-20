import { clsx } from 'clsx';

/**
 * Composes a slot className from the three layers the customization surface
 * accepts:
 *
 *   canonical → the `tk-*` class the component author shipped (never dropped)
 *   instance  → the `className` prop passed to the wrapped component instance
 *   theme     → `className` from `SparReactProvider.components[name]` (concat,
 *               always applied)
 *
 * Order is "canonical first, theme last." CSS specificity is equal across
 * class selectors, so order matters for authoring intent, not paint.
 */
export const resolveSlotClass = (canonical: string, instanceClassName: string | undefined, themeClassName: string | undefined): string =>
  clsx(canonical, instanceClassName, themeClassName);
