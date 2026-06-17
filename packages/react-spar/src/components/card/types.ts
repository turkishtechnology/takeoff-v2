import type { ElementType } from 'react';
import type { PolymorphicProps } from '@turkish-technology/spar';

import type { ClassNamesMap, SlotPropsMap } from '../../core';

export type CardHeaderType = 'basic' | 'divided' | 'light' | 'dark' | 'primary';

export type CardFooterType = 'basic' | 'divided' | 'light';

export type CardSlot = 'root';
export type CardHeaderSlot = 'root';
export type CardTitleSlot = 'root';
export type CardDescriptionSlot = 'root';
export type CardBodySlot = 'root';
export type CardFooterSlot = 'root';

export interface CardOwnProps {
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<CardSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<CardSlot>;
}

export type CardProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, CardOwnProps>;

export interface CardHeaderOwnProps {
  /**
   * Type of the header.
   * @defaultValue 'basic'
   */
  headerType?: CardHeaderType;
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<CardHeaderSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<CardHeaderSlot>;
}

export type CardHeaderProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, CardHeaderOwnProps>;

export interface CardTitleOwnProps {
  /**
   * Semantic heading level used when `as` is not provided.
   * @defaultValue 5
   */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<CardTitleSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<CardTitleSlot>;
}

export type CardTitleProps<T extends ElementType = 'h5'> = PolymorphicProps<'h5', T, CardTitleOwnProps>;

export interface CardDescriptionOwnProps {
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<CardDescriptionSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<CardDescriptionSlot>;
}

export type CardDescriptionProps<T extends ElementType = 'p'> = PolymorphicProps<'p', T, CardDescriptionOwnProps>;

export interface CardBodyOwnProps {
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<CardBodySlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<CardBodySlot>;
}

export type CardBodyProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, CardBodyOwnProps>;

export interface CardFooterOwnProps {
  /**
   * Type of the footer.
   * @defaultValue 'basic'
   */
  footerType?: CardFooterType;
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<CardFooterSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<CardFooterSlot>;
}

export type CardFooterProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, CardFooterOwnProps>;

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    Card: import('../../core').ComponentThemeConfig<CardProps, CardSlot>;
    CardHeader: import('../../core').ComponentThemeConfig<CardHeaderProps, CardHeaderSlot>;
    CardTitle: import('../../core').ComponentThemeConfig<CardTitleProps, CardTitleSlot>;
    CardDescription: import('../../core').ComponentThemeConfig<CardDescriptionProps, CardDescriptionSlot>;
    CardBody: import('../../core').ComponentThemeConfig<CardBodyProps, CardBodySlot>;
    CardFooter: import('../../core').ComponentThemeConfig<CardFooterProps, CardFooterSlot>;
  }
}
