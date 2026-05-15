import type { ElementType } from 'react';
import { RadioItem as SparRadioItem } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { RadioItemBase } from './base';
import { RADIO_ITEM_CONTEXT_VALUE, RadioItemProvider, useRadioGroupOwnContext } from './context';
import type { RadioItemProps } from './types';

export const RadioItem = <T extends ElementType = 'label'>(props: RadioItemProps<T>) => {
  const theme = useComponentTheme('RadioItem');
  const group = useRadioGroupOwnContext('Radio.Item');

  // Item-level `position` overrides the group-level cascade; the rest of the
  // visual cascade (`size`, `type`, `invalid`) is read from context only.
  // Duplicating these onto the item lets CSS recipes target a single element
  // (`.tk-radio-item[data-type='card']`) without an ancestor selector — same
  // pattern recorded for Accordion in `data-attribute-vocabulary.md`.
  const { rootAttrs, rest } = composeRootAttrs(RadioItemBase, props as RadioItemProps<'label'>, theme, {
    stateAttrs: ({ position }) => ({
      'data-size': group.size,
      'data-type': group.type,
      'data-position': position ?? group.position,
      'data-invalid': group.invalid ? '' : undefined,
    }),
  });

  // `position` is consumed only as a data-attr above; drop it before spreading
  // onto the underlying label element so the DOM doesn't see an unknown attr.
  const { position: _position, children, ref, ...spar } = rest;

  return (
    <RadioItemProvider value={RADIO_ITEM_CONTEXT_VALUE}>
      <SparRadioItem {...spar} {...rootAttrs} ref={ref}>
        {children}
      </SparRadioItem>
    </RadioItemProvider>
  );
};

RadioItem.displayName = 'Radio.Item';
