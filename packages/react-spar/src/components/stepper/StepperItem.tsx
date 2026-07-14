import { useCallback, useEffect, useMemo, useState, type CSSProperties, type ElementType, type MouseEvent, type ReactNode } from 'react';
import { CheckIconOutlinedRounded } from '@takeoff-icons/react/check';
import { CloseIconOutlinedRounded } from '@takeoff-icons/react/close';

import { buildSlotAttrs, composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { StepperItemBase } from './base';
import { StepperItemProvider, useStepperContext, useStepperItemIndex, type StepperItemContextValue } from './context';
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
  const { active, mode, completedLabel, errorLabel, getStepStatus, registerStep, canSelectStep, selectStep, emitStepClick } = useStepperContext('Stepper.Item');
  const { index } = useStepperItemIndex('Stepper.Item');

  const { rootAttrs, rest } = composeRootAttrs<StepperItemProps, StepperItemSlot>(StepperItemBase, props as StepperItemProps<'li'>, theme, {
    stateAttrs: ({ error = false, disabled = false, isClickable = true }) => ({
      'data-state': getStepStatus({ index }),
      'data-error': error ? '' : undefined,
      'data-disabled': disabled ? '' : undefined,
      // The active step is excluded: pressing it re-emits `onStepClick` but
      // can never change the selection, which is what this hook advertises.
      'data-clickable': index !== active && canSelectStep(index, { error, disabled, isClickable }) ? '' : undefined,
    }),
  });

  const { error = false, disabled = false, isClickable = true, indicator, as, children, ref, ...nativeProps } = rest;

  useEffect(() => registerStep(index, { error, disabled, isClickable }), [registerStep, index, error, disabled, isClickable]);

  const status = getStepStatus({ index });
  const selectable = canSelectStep(index, { error, disabled, isClickable });
  const isActive = index === active;

  // `aria-disabled` marks steps whose press cannot change the active step —
  // except the active one: it already carries `aria-current="step"`, and
  // announcing it disabled at the same time would contradict that.
  const ariaDisabled = selectable || isActive ? undefined : true;

  // Empty root labels drop the suffix entirely.
  const statusLabel = error ? errorLabel : status === 'completed' ? completedLabel : undefined;

  // Registered by Stepper.Description so the trigger only references an id
  // that actually exists — a dangling `aria-describedby` is invalid ARIA.
  const [descriptionId, setDescriptionId] = useState<string>();
  const registerDescription = useCallback((id: string) => {
    setDescriptionId(id);
    return () => {
      setDescriptionId(current => (current === id ? undefined : current));
    };
  }, []);
  const itemContextValue = useMemo<StepperItemContextValue>(() => ({ registerDescription }), [registerDescription]);

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
  // consumer content, error/complete glyphs, and finally the basic dot. An
  // indicator render function that returns `undefined` OR `null` opts back
  // into the built-in glyphs for that status — `status === 'completed' ? null
  // : n` ("hide my own content once completed") is the natural way to write
  // that opt-out, so `null` can't be treated as "render nothing".
  const resolvedIndicator = typeof indicator === 'function' ? indicator({ status, index }) : indicator;
  let indicatorContent: ReactNode = null;
  if (!disabled) {
    if (resolvedIndicator != null) {
      indicatorContent = resolvedIndicator;
    } else if (error) {
      indicatorContent = <CloseIconOutlinedRounded />;
    } else if (status === 'completed') {
      indicatorContent = <CheckIconOutlinedRounded />;
    }
  }

  const handleTriggerClick = (event: MouseEvent<HTMLButtonElement>) => {
    triggerSlotOnClick?.(event);
    if (event.defaultPrevented) return;
    // The active step still emits `onStepClick` on re-press, but only while
    // it is clickable — non-clickable steps stay silent in every state.
    if (!selectable && !(isActive && isClickable)) return;
    emitStepClick({ index, status });
    selectStep(index);
  };

  const Component = (as ?? 'li') as ElementType;

  return (
    <StepperItemProvider value={itemContextValue}>
      <Component {...nativeProps} {...rootAttrs} ref={ref}>
        {mode !== 'compact' && <span aria-hidden="true" {...railAttrs} />}
        <button
          {...triggerAttrs}
          // Locked after the spread (like Chip's remove button): a slotProps
          // override must not be able to turn the trigger into a form
          // submitter, silently drop it from the tab/arrow-key order, or
          // sever its link to the active state / registered description.
          type="button"
          disabled={disabled}
          onClick={handleTriggerClick}
          aria-current={isActive ? 'step' : undefined}
          aria-disabled={ariaDisabled}
          aria-describedby={descriptionId}
          tabIndex={isClickable ? undefined : -1}
        >
          <span aria-hidden="true" {...indicatorAttrs}>
            {indicatorContent}
          </span>
          <span {...contentAttrs}>{children}</span>
          {/* The separator lives inside the text: accessible-name computation
              may join adjacent inline elements without whitespace. */}
          {statusLabel ? <span style={visuallyHidden}>{`, ${statusLabel}`}</span> : null}
        </button>
      </Component>
    </StepperItemProvider>
  );
};

StepperItem.displayName = 'Stepper.Item';
