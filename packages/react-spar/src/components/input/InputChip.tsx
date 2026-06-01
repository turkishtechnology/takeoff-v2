import type { ElementType } from 'react';
import { useInputContext } from '@turkish-technology/spar';

import { buildSlotAttrs, composeRootAttrs } from '../../core';
import { PlaceholderClose } from '../../icons';
import { useComponentTheme } from '../../provider';

import { InputChipBase } from './base';
import { useInputOwnContext } from './context';
import type { InputChipProps, InputChipSlot } from './types';

export const InputChip = <T extends ElementType = 'span'>(props: InputChipProps<T>) => {
  const theme = useComponentTheme('InputChip');
  const { disabled, readOnly } = useInputContext();
  useInputOwnContext('Input.Chip');

  const { rootAttrs, rest } = composeRootAttrs(InputChipBase, props as InputChipProps<'span'>, theme);

  const { as, children, onRemove, removable = true, ref, ...rendered } = rest;
  const Component = (as ?? 'span') as ElementType;

  const slotOptions = {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: props.slotProps,
    instanceClassNames: props.classNames,
  };
  const labelAttrs = buildSlotAttrs(InputChipBase.getSlotProps('label'), 'label' as InputChipSlot, slotOptions);
  const removeAttrs = buildSlotAttrs(InputChipBase.getSlotProps('remove'), 'remove' as InputChipSlot, slotOptions);

  const showRemove = removable && !disabled && !readOnly;
  const label = typeof children === 'string' ? children : undefined;

  return (
    <Component {...rendered} ref={ref} {...rootAttrs}>
      <span {...labelAttrs}>{children}</span>
      {showRemove && (
        <button {...removeAttrs} type="button" aria-label={label ? `Remove ${label}` : 'Remove'} onClick={onRemove}>
          <PlaceholderClose />
        </button>
      )}
    </Component>
  );
};

InputChip.displayName = 'Input.Chip';
