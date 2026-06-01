import type { ElementType } from 'react';
import { FieldErrorMessage as SparFieldErrorMessage } from '@turkish-technology/spar';

import { buildSlotAttrs, composeRootAttrs } from '../../core';
import { PlaceholderError } from '../../icons';
import { useComponentTheme } from '../../provider';

import { FieldErrorMessageBase } from './base';
import type { FieldErrorMessageProps, FieldErrorMessageSlot } from './types';

export const FieldErrorMessage = <T extends ElementType = 'div'>(props: FieldErrorMessageProps<T>) => {
  const theme = useComponentTheme('FieldErrorMessage');

  const { rootAttrs, rest } = composeRootAttrs(FieldErrorMessageBase, props as FieldErrorMessageProps<'div'>, theme);

  const { children, ref, ...spar } = rest;

  // Mirrors Field.Description: a decorative leading error icon precedes the
  // message text, matching the design system's helper-text anatomy.
  const iconAttrs = buildSlotAttrs(FieldErrorMessageBase.getSlotProps('icon'), 'icon' as FieldErrorMessageSlot, {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: props.slotProps,
    instanceClassNames: props.classNames,
  });

  return (
    <SparFieldErrorMessage {...spar} ref={ref} {...rootAttrs}>
      <span {...iconAttrs} aria-hidden="true">
        <PlaceholderError />
      </span>
      {children}
    </SparFieldErrorMessage>
  );
};

FieldErrorMessage.displayName = 'Field.ErrorMessage';
