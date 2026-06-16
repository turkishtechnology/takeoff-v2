import { createComponentBase } from '../../core';

import type { CardBodyProps, CardDescriptionProps, CardFooterProps, CardHeaderProps, CardProps, CardTitleProps } from './types';

export const CardBase = createComponentBase<CardProps, 'root'>({
  name: 'Card',
  slots: ['root'] as const,
  classes: { root: 'tk-card' },
});

export const CardHeaderBase = createComponentBase<CardHeaderProps, 'root'>({
  name: 'CardHeader',
  slots: ['root'] as const,
  classes: { root: 'tk-card-header' },
});

export const CardTitleBase = createComponentBase<CardTitleProps, 'root'>({
  name: 'CardTitle',
  slots: ['root'] as const,
  classes: { root: 'tk-card-title' },
});

export const CardDescriptionBase = createComponentBase<CardDescriptionProps, 'root'>({
  name: 'CardDescription',
  slots: ['root'] as const,
  classes: { root: 'tk-card-description' },
});

export const CardBodyBase = createComponentBase<CardBodyProps, 'root'>({
  name: 'CardBody',
  slots: ['root'] as const,
  classes: { root: 'tk-card-body' },
});

export const CardFooterBase = createComponentBase<CardFooterProps, 'root'>({
  name: 'CardFooter',
  slots: ['root'] as const,
  classes: { root: 'tk-card-footer' },
});
