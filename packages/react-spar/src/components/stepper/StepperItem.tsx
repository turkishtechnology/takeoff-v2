import { useEffect, type CSSProperties, type ElementType, type MouseEvent, type ReactNode } from 'react';
import { CheckIconOutlinedRounded } from '@takeoff-icons/react/check';
import { CloseIconOutlinedRounded } from '@takeoff-icons/react/close';

import { buildSlotAttrs, composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { StepperItemBase } from './base';
import { useStepperContext, useStepperItemIndex } from './context';
import { DEFAULT_COMPLETED_LABEL, DEFAULT_ERROR_LABEL } from './defaults';
import type { StepperItemProps, StepperItemSlot } from './types';

// The design system ships no sr-only utility and the recipe must stay a
// purely visual dependency, so the status suffix hides itself inline.
const visuallyHidden: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

export const StepperItem = <T extends ElementType = 'li'>(props: StepperItemProps<T>) => {
  const theme = useComponentTheme('StepperItem');
  const { mode, getStepStatus, registerStep, canSelectStep, selectStep, emitStepClick } = useStepperContext('Stepper.Item');
  const { index } = useStepperItemIndex('Stepper.Item');

  const { rootAttrs, rest } = composeRootAttrs<StepperItemProps, StepperItemSlot>(StepperItemBase, props as StepperItemProps<'li'>, theme, {
    stateAttrs: ({ error = false, disabled = false, isClickable = true }) => ({
      'data-state': getStepStatus({ index, error, disabled }),
      'data-clickable': canSelectStep(index, { error, disabled, isClickable }) ? '' : undefined,
    }),
  });

  const { error = false, disabled = false, isClickable = true, indicator, as, children, ref, ...nativeProps } = rest;

  useEffect(() => registerStep(index, { error, disabled, isClickable }), [registerStep, index, error, disabled, isClickable]);

  const status = getStepStatus({ index, error, disabled });
  const selectable = canSelectStep(index, { error, disabled, isClickable });

  // `aria-disabled` marks steps whose press cannot change the active step —
  // except the active one: it already carries `aria-current="step"`, and
  // announcing it disabled at the same time would contradict that.
  const ariaDisabled = selectable || status === 'active' ? undefined : true;

  const statusLabel = status === 'completed' ? DEFAULT_COMPLETED_LABEL : status === 'error' ? DEFAULT_ERROR_LABEL : undefined;

  const slotLayering = {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: props.slotProps,
    instanceClassNames: props.classNames,
  };

  const triggerSlotAttrs = buildSlotAttrs(StepperItemBase.getSlotProps('trigger'), 'trigger', slotLayering);
  const { onClick: triggerSlotOnClick, ...triggerAttrs } = triggerSlotAttrs as typeof triggerSlotAttrs & {
    onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  };
  const railAttrs = buildSlotAttrs(StepperItemBase.getSlotProps('rail'), 'rail', slotLayering);
  const indicatorAttrs = buildSlotAttrs(StepperItemBase.getSlotProps('indicator'), 'indicator', slotLayering);
  const contentAttrs = buildSlotAttrs(StepperItemBase.getSlotProps('content'), 'content', slotLayering);

  // Default indicator glyph, mirroring Core's precedence: a disabled step
  // always shows the neutral dot (recipe-painted on the empty indicator), then
  // consumer content, error/complete glyphs, and finally the basic dot.
  let indicatorContent: ReactNode = null;
  if (!disabled) {
    if (indicator !== undefined) {
      indicatorContent = indicator;
    } else if (error) {
      indicatorContent = <CloseIconOutlinedRounded />;
    } else if (status === 'completed') {
      indicatorContent = <CheckIconOutlinedRounded />;
    }
  }

  const handleTriggerClick = (event: MouseEvent<HTMLButtonElement>) => {
    triggerSlotOnClick?.(event);
    if (event.defaultPrevented) return;
    emitStepClick({ index, status });
    selectStep(index);
  };

  const Component = (as ?? 'li') as ElementType;

  return (
    <Component {...nativeProps} {...rootAttrs} ref={ref}>
      {mode !== 'compact' && <span aria-hidden="true" {...railAttrs} />}
      <button
        aria-current={status === 'active' ? 'step' : undefined}
        aria-disabled={ariaDisabled}
        tabIndex={isClickable ? undefined : -1}
        {...triggerAttrs}
        // Locked after the spread (like Chip's remove button): a slotProps
        // `type` override could turn the trigger into a form submitter.
        type="button"
        disabled={disabled}
        onClick={handleTriggerClick}
      >
        <span aria-hidden="true" {...indicatorAttrs}>
          {indicatorContent}
        </span>
        <span {...contentAttrs}>{children}</span>
        {/* The separator lives inside the text: accessible-name computation
            may join adjacent inline elements without whitespace. */}
        {statusLabel !== undefined && <span style={visuallyHidden}>{`, ${statusLabel}`}</span>}
      </button>
    </Component>
  );
};

StepperItem.displayName = 'Stepper.Item';
