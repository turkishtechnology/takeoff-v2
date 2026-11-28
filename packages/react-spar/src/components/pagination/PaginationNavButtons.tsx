import type { ComponentType, ElementType, ReactNode } from 'react';
import { ChevronLeftIconOutlinedRounded } from '@takeoff-icons/react/chevron-left';
import { ChevronRightIconOutlinedRounded } from '@takeoff-icons/react/chevron-right';
import { DoubleChevronLeftIconOutlinedRounded } from '@takeoff-icons/react/double-chevron-left';
import { DoubleChevronRightIconOutlinedRounded } from '@takeoff-icons/react/double-chevron-right';
import {
  PaginationFirst as SparPaginationFirst,
  PaginationLast as SparPaginationLast,
  PaginationNext as SparPaginationNext,
  PaginationPrevious as SparPaginationPrevious,
  type PaginationNavButtonProps as SparPaginationNavButtonProps,
} from '@turkish-technology/spar';

import { composeRootAttrs, type ComponentBase } from '../../core';
import { useComponentTheme } from '../../provider';

import { PaginationFirstBase, PaginationLastBase, PaginationNextBase, PaginationPreviousBase } from './base';
import { usePaginationOwnContext, type PaginationOwnContextValue } from './context';
import type { PaginationNavButtonProps } from './types';

type ThemeName = 'PaginationFirst' | 'PaginationPrevious' | 'PaginationNext' | 'PaginationLast';

const createNavButton = (
  themeName: ThemeName,
  displayName: string,
  base: ComponentBase<PaginationNavButtonProps, 'root'>,
  SparPart: ComponentType<SparPaginationNavButtonProps>,
  icon: ReactNode,
  getLabel: (labels: PaginationOwnContextValue['labels']) => string,
) => {
  const NavButton = <T extends ElementType = 'button'>(props: PaginationNavButtonProps<T>) => {
    const theme = useComponentTheme(themeName);
    const { labels } = usePaginationOwnContext(displayName);
    const { rootAttrs, rest } = composeRootAttrs(base, props as PaginationNavButtonProps<'button'>, theme);
    const { children, ref, 'aria-label': ariaLabel, ...spar } = rest;

    return (
      <SparPart {...spar} ref={ref} {...rootAttrs} aria-label={ariaLabel ?? getLabel(labels)}>
        {children ?? icon}
      </SparPart>
    );
  };
  NavButton.displayName = displayName;
  return NavButton;
};

export const PaginationFirst = createNavButton(
  'PaginationFirst',
  'Pagination.First',
  PaginationFirstBase,
  SparPaginationFirst,
  <DoubleChevronLeftIconOutlinedRounded aria-hidden />,
  labels => labels.firstPage,
);

export const PaginationPrevious = createNavButton(
  'PaginationPrevious',
  'Pagination.Previous',
  PaginationPreviousBase,
  SparPaginationPrevious,
  <ChevronLeftIconOutlinedRounded aria-hidden />,
  labels => labels.previousPage,
);

export const PaginationNext = createNavButton(
  'PaginationNext',
  'Pagination.Next',
  PaginationNextBase,
  SparPaginationNext,
  <ChevronRightIconOutlinedRounded aria-hidden />,
  labels => labels.nextPage,
);

export const PaginationLast = createNavButton(
  'PaginationLast',
  'Pagination.Last',
  PaginationLastBase,
  SparPaginationLast,
  <DoubleChevronRightIconOutlinedRounded aria-hidden />,
  labels => labels.lastPage,
);
