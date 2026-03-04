import { type ElementType } from 'react';
import { useMergedRef } from '@/hooks';
import type { PopoverArrowProps } from './types';
import { usePopoverContext } from './hooks/usePopoverContext';

/**
 * Optional decorative arrow element for popover.
 * Registered in context for Floating UI arrow middleware positioning.
 * Headless: renders a plain element with no visual opinions — user provides all styling.
 */
export const PopoverArrow = <T extends ElementType = 'div'>({
  as,
  ref,
  ...props
}: PopoverArrowProps<T>) => {
  const Component = as || 'div';
  const { arrowRef } = usePopoverContext();
  const mergedRef = useMergedRef(arrowRef, ref as React.Ref<Element | null>);

  return <Component ref={mergedRef} aria-hidden='true' {...props} />;
};

PopoverArrow.displayName = 'PopoverArrow';
