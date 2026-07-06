import { Children, isValidElement, useCallback, useMemo, useState, type ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useControllableState } from '../../hooks';
import { useComponentTheme } from '../../provider';

import { StepperBase } from './base';
import { StepperItemIndexProvider, StepperProvider, type StepperContextValue, type StepperStepMeta, type StepperStepStatusOptions } from './context';
import { DEFAULT_ACTIVE, DEFAULT_MODE, DEFAULT_ORIENTATION, DEFAULT_SIZE } from './defaults';
import type { StepperProps, StepperStepStatus } from './types';

export const Stepper = <T extends ElementType = 'ol'>(props: StepperProps<T>) => {
  const theme = useComponentTheme('Stepper');

  const { rootAttrs, rest } = composeRootAttrs(StepperBase, props as StepperProps<'ol'>, theme, {
    stateAttrs: ({ orientation = DEFAULT_ORIENTATION, mode = DEFAULT_MODE, size = DEFAULT_SIZE, linear = false, reverse = false }) => ({
      'data-orientation': orientation,
      'data-mode': mode,
      'data-size': size,
      'data-linear': linear ? '' : undefined,
      'data-reverse': reverse ? '' : undefined,
    }),
  });

  const {
    active: controlledActive,
    defaultActive = DEFAULT_ACTIVE,
    onActiveChange,
    onStepClick,
    // Consumed only as root data-* hooks above; destructured so the <ol>
    // doesn't receive unknown DOM attributes.
    orientation: _orientation,
    mode = DEFAULT_MODE,
    size: _size,
    linear = false,
    reverse: _reverse,
    as,
    children,
    ref,
    ...nativeProps
  } = rest;

  const [activeValue, setActive] = useControllableState(controlledActive, defaultActive, onActiveChange);
  const active = activeValue ?? DEFAULT_ACTIVE;

  const [stepsMeta, setStepsMeta] = useState<ReadonlyMap<number, StepperStepMeta>>(new Map());

  const registerStep = useCallback((index: number, meta: StepperStepMeta) => {
    setStepsMeta(previous => new Map(previous).set(index, meta));
    return () => {
      setStepsMeta(previous => {
        const next = new Map(previous);
        next.delete(index);
        return next;
      });
    };
  }, []);

  // Memoized so parent-driven root re-renders keep referential identity and
  // skip re-rendering every item; invalidates only with selection state.
  // `registerStep` stays outside — its stability keeps item register effects
  // from cycling on every active-step change.
  const contextValue = useMemo<StepperContextValue>(() => {
    // Mirrors Takeoff Core's canStepBeSelected: the target must be clickable
    // and enabled; under linear progression only previous steps, or the next
    // step while the current one is neither errored nor disabled, qualify.
    // The registry fills in effects, so items querying their own gating during
    // render (first paint, SSR) pass `selfMeta`; the linear rule's neighbor
    // lookup stays optimistic until the registry catches up.
    const canSelectStep = (index: number, selfMeta?: StepperStepMeta): boolean => {
      const target = stepsMeta.get(index) ?? selfMeta;
      if (!target || target.disabled || !target.isClickable) return false;
      if (!linear) return true;
      if (index < active) return true;
      if (index === active + 1) {
        const current = stepsMeta.get(active);
        return !current?.error && !current?.disabled;
      }
      return false;
    };

    const getStepStatus = (options: StepperStepStatusOptions): StepperStepStatus => {
      const { index, error, disabled } = options;
      if (disabled) return 'disabled';
      if (error) return 'error';
      if (index < active) return 'completed';
      if (index === active) return 'active';
      return 'inactive';
    };

    return {
      active,
      mode,
      getStepStatus,
      registerStep,
      canSelectStep,
      selectStep: index => {
        if (index !== active && canSelectStep(index)) {
          setActive(index);
        }
      },
      emitStepClick: detail => {
        onStepClick?.(detail);
      },
    };
  }, [active, mode, linear, stepsMeta, registerStep, setActive, onStepClick]);

  const Component = (as ?? 'ol') as ElementType;

  // Only valid elements consume a step index: a stray text node between items
  // must not shift every following step's position.
  let stepIndex = 0;

  return (
    <StepperProvider value={contextValue}>
      <Component {...nativeProps} {...rootAttrs} ref={ref}>
        {Children.toArray(children).map(child => {
          if (!isValidElement(child)) return child;
          const index = stepIndex++;
          return (
            <StepperItemIndexProvider key={child.key ?? index} value={{ index }}>
              {child}
            </StepperItemIndexProvider>
          );
        })}
      </Component>
    </StepperProvider>
  );
};

Stepper.displayName = 'Stepper';
