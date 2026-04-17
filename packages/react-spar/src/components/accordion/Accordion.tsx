import { Accordion as SparAccordion } from '@turkish-technology/spar';
import { type Ref } from 'react';

import { useComponentTheme } from '../../provider';
import { applyThemeDefaults, buildSlotAttrs, mergeClassNames, mergeSlotProps } from '../../customization';
// TODO(takeoff-icons): Default arrow icons are Lucide-sourced placeholders.
// Replace with the official Takeoff icon components before first release.
import { PlaceholderChevronDown, PlaceholderChevronUp } from '../../utils/placeholderIcons';
import { AccordionBase, AccordionProvider } from './AccordionBase';
import type { AccordionProps } from './types';
import { useAccordionAdapter } from './useAccordionAdapter';

function Accordion({ ref, ...rawProps }: AccordionProps & { ref?: Ref<HTMLDivElement> }) {
  const themeConfig = useComponentTheme('Accordion');
  const {
    activeIndex: controlledActiveIndex,
    defaultActiveIndex,
    allowMultiple: rawAllowMultiple,
    arrowPosition: rawArrowPosition,
    expandIcon: rawExpandIcon,
    collapseIcon: rawCollapseIcon,
    hideArrows: rawHideArrows,
    type: rawType,
    mode: rawMode,
    onActiveIndexChange,
    children,
    className,
    classNames: instanceClassNames,
    slotProps: instanceSlotProps,
    ...restProps
  } = AccordionBase.resolveProps(applyThemeDefaults(themeConfig?.defaultProps, rawProps));
  const resolvedClassNames = mergeClassNames(themeConfig?.classNames, instanceClassNames);
  const resolvedSlotProps = mergeSlotProps(themeConfig?.slotProps, instanceSlotProps);
  const allowMultiple = rawAllowMultiple ?? false;
  const arrowPosition = rawArrowPosition ?? 'right';
  const expandIcon = rawExpandIcon ?? <PlaceholderChevronDown />;
  const collapseIcon = rawCollapseIcon ?? <PlaceholderChevronUp />;
  const hideArrows = rawHideArrows ?? false;
  const type = rawType ?? 'grouped';
  const mode = rawMode ?? 'default';

  const { processedChildren, adapterContext, sparValue, handleValueChange } = useAccordionAdapter({
    children,
    controlledActiveIndex,
    defaultActiveIndex,
    allowMultiple,
    onActiveIndexChange,
    type,
    mode,
    arrowPosition,
    expandIcon,
    collapseIcon,
    hideArrows,
  });

  return (
    <AccordionProvider value={adapterContext}>
      <SparAccordion
        {...restProps}
        {...buildSlotAttrs(AccordionBase.getSlotProps('root', { className }), resolvedSlotProps, 'root', resolvedClassNames?.root)}
        ref={ref}
        type={allowMultiple ? 'multiple' : 'single'}
        isCollapsible
        value={sparValue}
        onValueChange={handleValueChange}
      >
        {processedChildren}
      </SparAccordion>
    </AccordionProvider>
  );
}

Accordion.displayName = 'Accordion';

export { Accordion };
