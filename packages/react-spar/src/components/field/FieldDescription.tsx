import type { ElementType } from 'react';
import { FieldDescription as SparFieldDescription } from '@turkish-technology/spar';

import { buildSlotAttrs, composeRootAttrs } from '../../core';
import { PlaceholderInfo } from '../../icons';
import { useComponentTheme } from '../../provider';

import { FieldDescriptionBase } from './base';
import type { FieldDescriptionProps, FieldDescriptionSlot } from './types';

export const FieldDescription = <T extends ElementType = 'div'>(props: FieldDescriptionProps<T>) => {
  const theme = useComponentTheme('FieldDescription');

  const { rootAttrs, rest } = composeRootAttrs(FieldDescriptionBase, props as FieldDescriptionProps<'div'>, theme);

  const { children, ref, ...spar } = rest;

  // The leading info icon is a wrapper-owned convention matching the design
  // system's helper-text anatomy, so it is auto-rendered (decorative, hidden
  // from assistive tech) ahead of the description text. It is gated on having
  // content so an empty/childless description doesn't paint a stray icon.
  const iconAttrs = buildSlotAttrs(FieldDescriptionBase.getSlotProps('icon'), 'icon' as FieldDescriptionSlot, {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: props.slotProps,
    instanceClassNames: props.classNames,
  });

  const hasContent = children != null && children !== '';

  return (
    <SparFieldDescription {...spar} ref={ref} {...rootAttrs}>
      {hasContent && (
        <span {...iconAttrs} aria-hidden="true">
          <PlaceholderInfo />
        </span>
      )}
      {children}
    </SparFieldDescription>
  );
};

FieldDescription.displayName = 'Field.Description';
