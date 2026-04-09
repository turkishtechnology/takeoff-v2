import { Accordion as SparAccordion } from '@turkish-technology/spar';
import { type Ref } from 'react';

import { AccordionBase, AccordionAdapterContext } from './AccordionBase';
import type { AccordionProps } from './types';
import { useAccordionAdapter } from './useAccordionAdapter';

function Accordion({ ref, ...rawProps }: AccordionProps & { ref?: Ref<HTMLDivElement> }) {
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
    ...restProps
  } = AccordionBase.resolveProps(rawProps);
  const allowMultiple = rawAllowMultiple ?? false;
  const arrowPosition = rawArrowPosition ?? 'right';
  const expandIcon = rawExpandIcon ?? 'keyboard_arrow_down';
  const collapseIcon = rawCollapseIcon ?? 'keyboard_arrow_up';
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
    <AccordionAdapterContext.Provider value={adapterContext}>
      <SparAccordion
        {...restProps}
        ref={ref}
        className={AccordionBase.cx('root', className)}
        data-slot="root"
        type={allowMultiple ? 'multiple' : 'single'}
        isCollapsible
        value={sparValue}
        onValueChange={handleValueChange}
      >
        {processedChildren}
      </SparAccordion>
    </AccordionAdapterContext.Provider>
  );
}

Accordion.displayName = 'Accordion';

export { Accordion };
