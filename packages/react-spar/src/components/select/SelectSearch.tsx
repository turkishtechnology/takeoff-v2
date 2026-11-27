import type { ElementType } from 'react';
import { SelectSearch as SparSelectSearch } from '@turkish-technology/spar';
import { SearchIconOutlinedRounded } from '@takeoff-icons/react/search';

import { buildSlotAttrs, composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { SelectSearchBase } from './base';
import { DEFAULT_SEARCH_LABEL } from './defaults';
import type { SelectSearchProps } from './types';

/**
 * Filter field at the top of `Select.Content` — Spar's `SelectSearch` in a
 * framed row with a search icon.
 *
 * Spar owns the behaviour: the field takes focus on open, typing never runs
 * typeahead, arrows and Enter still drive the list, and `Select.Viewport`
 * becomes the listbox. It does not filter — render only the `Select.Item`s
 * that match `value`, and a `Select.Empty` when none do.
 */
export const SelectSearch = <T extends ElementType = 'input'>(props: SelectSearchProps<T>) => {
  const theme = useComponentTheme('SelectSearch');

  const { rootAttrs, rest } = composeRootAttrs(SelectSearchBase, props as SelectSearchProps<'input'>, theme);

  const { 'aria-label': ariaLabel, placeholder, ref, ...spar } = rest;

  const slotLayers = {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: props.slotProps,
    instanceClassNames: props.classNames,
  };
  const inputAttrs = buildSlotAttrs(SelectSearchBase.getSlotProps('input'), 'input', slotLayers);
  const iconAttrs = buildSlotAttrs(SelectSearchBase.getSlotProps('icon'), 'icon', slotLayers);

  // A blank override would leave the field nameless, so it falls back like
  // the other user-facing strings do.
  const label = ariaLabel?.trim() ? ariaLabel : DEFAULT_SEARCH_LABEL;

  return (
    <div {...rootAttrs}>
      <span {...iconAttrs} aria-hidden="true">
        <SearchIconOutlinedRounded />
      </span>
      <SparSelectSearch {...spar} ref={ref} {...inputAttrs} aria-label={label} placeholder={placeholder ?? DEFAULT_SEARCH_LABEL} />
    </div>
  );
};

SelectSearch.displayName = 'Select.Search';
