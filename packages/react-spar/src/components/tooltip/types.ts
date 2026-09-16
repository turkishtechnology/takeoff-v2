import type { ElementType } from 'react';
import type {
  TooltipProps as SparTooltipProps,
  TooltipProviderProps as SparTooltipProviderProps,
  TooltipContentProps as SparTooltipContentProps,
  TooltipTriggerProps as SparTooltipTriggerProps,
  PolymorphicProps,
} from '@turkish-technology/spar';

import type { ClassNamesMap, SlotPropsMap } from '../../core';

export type TooltipVariant = 'white' | 'dark' | 'info' | 'success' | 'warning' | 'danger' | 'neutral';

export type TooltipTriggerSlot = 'root';

export type TooltipContentSlot = 'root';

export type TooltipHeaderSlot = 'root';

export type TooltipDescriptionSlot = 'root';

export type TooltipArrowSlot = 'root';

/**
 * Public props for the Tooltip root. State-only — renders no DOM, so no
 * polymorphic `as` and no native HTML props.
 */
export interface TooltipProps
  // Spar Tooltip root: identity, controlled state, timing, and the
  // trigger+content children. Tooltip root is state-only and renders no DOM,
  // so no native HTML props beyond `children` are exposed. `disabled` is
  // redeclared below (same Spar type) to document its effect on the trigger.
  extends Pick<SparTooltipProps, 'id' | 'open' | 'defaultOpen' | 'onOpenChange' | 'delay' | 'hideDelay' | 'children'> {
  /**
   * Disables the tooltip: it never opens (hover, focus, the render-prop
   * `show()` and `defaultOpen` / `open` are all ignored) and the trigger loses
   * `aria-describedby`. Spar also sets native `disabled` on the trigger
   * control, so a `<Tooltip.Trigger as={Button} onClick>` cannot be clicked
   * or focused while the tooltip is disabled. To keep the control usable
   * while hiding the hint, unmount the tooltip instead.
   * @defaultValue false
   */
  disabled?: boolean;
}

/**
 * Public props for the Tooltip provider. State-only — renders no DOM.
 * Shares delay configuration across multiple sibling tooltips so that moving
 * between them within `skipDelayDuration` opens the next one instantly (WCAG 1.4.13).
 */
// Spar TooltipProvider is state-only and renders no DOM. The full surface is
// re-exposed as-is — there are no visual knobs to add at this layer.
export type TooltipProviderProps = Pick<SparTooltipProviderProps, 'children' | 'delayDuration' | 'skipDelayDuration' | 'disableHoverableContent'>;

export interface TooltipTriggerOwnProps {
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<TooltipTriggerSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<TooltipTriggerSlot>;
}

export type TooltipTriggerProps<T extends ElementType = 'button'> = PolymorphicProps<
  'button',
  T,
  TooltipTriggerOwnProps &
    // Trigger surface from Spar. `children` is picked so it accepts both
    // ReactNode and the render-prop function form for accessing
    // open/disabled/show/hide state without a separate hook.
    Pick<SparTooltipTriggerProps, 'children'>
>;

export interface TooltipContentOwnProps {
  /**
   * Color variant.
   * @defaultValue 'white'
   */
  variant?: TooltipVariant;
  /**
   * Called when Escape is pressed while the tooltip is open — with focus on
   * the trigger (the usual case), inside the content, or anywhere else in the
   * document. Runs before the internal close with the native keyboard event;
   * call `preventDefault()` on it to keep the tooltip open.
   */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<TooltipContentSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<TooltipContentSlot>;
}

export type TooltipContentProps<T extends ElementType = 'div'> = PolymorphicProps<
  'div',
  T,
  TooltipContentOwnProps &
    // Positioning (side/align) and portal container. `variant` is takeoff-v2's
    // own visual token and `onEscapeKeyDown` is redeclared (same Spar
    // signature) with the veto documented — both in TooltipContentOwnProps
    // above. Spar's Tooltip.Content has no `onPointerDownOutside`,
    // `onOpenAutoFocus` or `onCloseAutoFocus` (a tooltip has no outside-dismiss
    // or auto-focus path; Spar 0.3.0 removed the never-called props), so the
    // wrapper exposes none either.
    Pick<SparTooltipContentProps, 'side' | 'align' | 'container'>
>;

export interface TooltipHeaderOwnProps {
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<TooltipHeaderSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<TooltipHeaderSlot>;
}

export type TooltipHeaderProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, TooltipHeaderOwnProps>;

export interface TooltipDescriptionOwnProps {
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<TooltipDescriptionSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<TooltipDescriptionSlot>;
}

export type TooltipDescriptionProps<T extends ElementType = 'p'> = PolymorphicProps<'p', T, TooltipDescriptionOwnProps>;

export interface TooltipArrowOwnProps {
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<TooltipArrowSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<TooltipArrowSlot>;
}

export type TooltipArrowProps<T extends ElementType = 'svg'> = PolymorphicProps<'svg', T, TooltipArrowOwnProps>;

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    TooltipTrigger: import('../../core').ComponentThemeConfig<TooltipTriggerProps, TooltipTriggerSlot>;
    TooltipContent: import('../../core').ComponentThemeConfig<TooltipContentProps, TooltipContentSlot>;
    TooltipHeader: import('../../core').ComponentThemeConfig<TooltipHeaderProps, TooltipHeaderSlot>;
    TooltipDescription: import('../../core').ComponentThemeConfig<TooltipDescriptionProps, TooltipDescriptionSlot>;
    TooltipArrow: import('../../core').ComponentThemeConfig<TooltipArrowProps, TooltipArrowSlot>;
  }
}
