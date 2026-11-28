import { useState, type CSSProperties, type ElementType } from 'react';
import { ChevronRightIconOutlinedRounded } from '@takeoff-icons/react/chevron-right';
import { usePaginationContext } from '@turkish-technology/spar';

import { buildSlotAttrs, composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';
import { Button } from '../button';
import { Input } from '../input';

import { PaginationPageJumpBase } from './base';
import { usePaginationOwnContext } from './context';
import type { PaginationPageJumpProps } from './types';

/**
 * Page-number input. Shows the current page; typing keeps digits only, and
 * Enter, the submit button or (with `applyOnBlur`) leaving the field applies
 * the page. A page outside `1…pageCount` is rejected and the field restores.
 */
export const PaginationPageJump = <T extends ElementType = 'div'>(props: PaginationPageJumpProps<T>) => {
  const theme = useComponentTheme('PaginationPageJump');
  const { labels, mode } = usePaginationOwnContext('Pagination.PageJump');
  const { page, pageCount, disabled, setPage } = usePaginationContext();
  const { rootAttrs, rest } = composeRootAttrs(PaginationPageJumpBase, props as PaginationPageJumpProps<'div'>, theme);
  const { as, applyOnBlur = true, style, ref, ...native } = rest;
  const Component = as ?? 'div';
  // `null` while the field shows the current page; a string while the user types.
  const [draft, setDraft] = useState<string | null>(null);
  const isDisabled = disabled || pageCount < 1;

  const apply = () => {
    if (draft !== null && draft !== '') setPage(Number.parseInt(draft, 10));
    setDraft(null);
  };

  const digits = String(Math.max(pageCount, 1)).length;
  const rootStyle = { ...(style as CSSProperties | undefined), '--tk-pagination-digits': digits } as CSSProperties;

  return (
    <Component {...native} ref={ref} {...rootAttrs} style={rootStyle}>
      <Input size="small" disabled={isDisabled}>
        <Input.Field
          type="text"
          inputMode="numeric"
          autoComplete="off"
          aria-label={labels.pageJumpInput}
          value={draft ?? String(pageCount > 0 ? page : '')}
          onChange={event => setDraft(event.currentTarget.value.replace(/\D/g, ''))}
          onKeyDown={event => {
            if (event.key === 'Enter') {
              event.preventDefault();
              apply();
            }
          }}
          onBlur={() => (applyOnBlur ? apply() : setDraft(null))}
        />
        {mode === 'default' && (
          // A focusable submit, so a Button in the input's action hook rather
          // than Input.TrailingIcon, which is decorative. Pressing it must not
          // blur the field first, or blur would apply/reset before the click.
          <Button
            {...buildSlotAttrs(PaginationPageJumpBase.getSlotProps('submit'), 'submit', {
              themeSlotProps: theme?.slotProps,
              themeClassNames: theme?.classNames,
              instanceSlotProps: props.slotProps,
              instanceClassNames: props.classNames,
            })}
            classNames={{ root: 'tk-input-action' }}
            type="button"
            appearance="text"
            rounded
            size="small"
            aria-label={labels.pageJumpSubmit}
            disabled={isDisabled}
            onMouseDown={event => event.preventDefault()}
            onClick={apply}
            startContent={<ChevronRightIconOutlinedRounded />}
          />
        )}
      </Input>
    </Component>
  );
};

PaginationPageJump.displayName = 'Pagination.PageJump';
