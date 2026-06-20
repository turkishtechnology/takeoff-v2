import { buildSlotAttrs, composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { SpinnerBase } from './base';
import { DEFAULT_APPEARANCE, DEFAULT_ARIA_LABEL, DEFAULT_SIZE, DEFAULT_VARIANT } from './defaults';
import type { SpinnerAppearance, SpinnerProps, SpinnerSlot } from './types';

const SPINNER_RADIAL_PARTS = 8;
const SPINNER_THREE_DOT_PARTS = 3;

const renderIndicatorContent = (appearance: SpinnerAppearance) => {
  if (appearance === 'rounded') {
    return (
      <>
        <svg aria-hidden="true" focusable="false" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="16.6667" />
        </svg>
        <svg aria-hidden="true" focusable="false" viewBox="0 0 40 40">
          <path d="M20 3.3333A16.6667 16.6667 0 0 1 36.6667 20" />
        </svg>
      </>
    );
  }

  if (appearance === 'loader') {
    return (
      <svg aria-hidden="true" focusable="false" viewBox="0 0 40 40">
        <path d="M20 3.3333A16.6667 16.6667 0 0 1 31.7851 8.2149" />
      </svg>
    );
  }

  if (appearance === 'dots') {
    return Array.from({ length: SPINNER_RADIAL_PARTS }, (_, index) => <span className="tk-spinner-dot" key={index} />);
  }

  if (appearance === 'lines') {
    return Array.from({ length: SPINNER_RADIAL_PARTS }, (_, index) => <span className="tk-spinner-line" key={index} />);
  }

  if (appearance === 'threeDots') {
    return Array.from({ length: SPINNER_THREE_DOT_PARTS }, (_, index) => <span className="tk-spinner-dot" key={index} />);
  }

  if (appearance === 'logo') {
    return (
      <svg aria-hidden="true" focusable="false" viewBox="0 0 48 48">
        <path
          clipRule="evenodd"
          d="M24 0C10.7452 0 0 10.7452 0 24C0 37.2548 10.7452 48 24 48C37.2548 48 48 37.2548 48 24V4C48 1.79086 46.2091 0 44 0H24ZM24 8C15.1634 8 8 15.1634 8 24C8 32.8366 15.1634 40 24 40C32.8366 40 40 32.8366 40 24C40 15.1634 32.8366 8 24 8Z"
          fillRule="evenodd"
        />
      </svg>
    );
  }

  return null;
};

export const Spinner = (props: SpinnerProps) => {
  const theme = useComponentTheme('Spinner');

  const { rootAttrs, rest } = composeRootAttrs<SpinnerProps, SpinnerSlot>(SpinnerBase, props, theme, {
    stateAttrs: ({ variant = DEFAULT_VARIANT, size = DEFAULT_SIZE, appearance = DEFAULT_APPEARANCE }) => ({
      'data-variant': variant,
      'data-size': size,
      'data-type': appearance,
    }),
  });

  const { variant: _variant, size: _size, appearance = DEFAULT_APPEARANCE, ref, ...nativeProps } = rest;

  const indicatorSlotAttrs = buildSlotAttrs(SpinnerBase.getSlotProps('indicator'), 'indicator' as SpinnerSlot, {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: props.slotProps,
    instanceClassNames: props.classNames,
  });

  const isDecorative = nativeProps['aria-hidden'] === true || nativeProps['aria-hidden'] === 'true';
  const accessibilityAttrs = isDecorative
    ? {}
    : {
        'role': nativeProps.role ?? 'status',
        'aria-label': nativeProps['aria-label'] ?? (nativeProps['aria-labelledby'] ? undefined : DEFAULT_ARIA_LABEL),
      };

  return (
    <span {...accessibilityAttrs} {...nativeProps} {...rootAttrs} ref={ref}>
      <span {...indicatorSlotAttrs} aria-hidden="true">
        {renderIndicatorContent(appearance)}
      </span>
    </span>
  );
};

Spinner.displayName = 'Spinner';
