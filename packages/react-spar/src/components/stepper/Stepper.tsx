import { Children, isValidElement, useCallback, useMemo, useRef, useState, type ElementType, type KeyboardEvent, type KeyboardEventHandler } from 'react';

import { composeRootAttrs } from '../../core';
import { useControllableState } from '../../hooks';
import { useComponentTheme } from '../../provider';

import { StepperBase } from './base';
import { StepperItemIndexProvider, StepperProvider, type StepperContextValue, type StepperStepMeta, type StepperStepStatusOptions } from './context';
import { DEFAULT_ACTIVE, DEFAULT_COMPLETED_LABEL, DEFAULT_ERROR_LABEL, DEFAULT_MODE, DEFAULT_ORIENTATION, DEFAULT_SIZE } from './defaults';
import type { StepperProps, StepperStepClickDetail, StepperStepStatus } from './types';

// Focus-movement candidates for arrow-key navigation: skips natively disabled
// triggers and non-clickable ones (tabindex -1), matching the tab order.
const FOCUSABLE_TRIGGER_SELECTOR = '.tk-stepper-trigger:not(:disabled):not([tabindex="-1"])';

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
    orientation = DEFAULT_ORIENTATION,
    mode = DEFAULT_MODE,
    // Consumed only as root data-* hooks above; destructured so the <ol>
    // doesn't receive unknown DOM attributes.
    size: _size,
    linear = false,
    reverse: _reverse,
    completedLabel = DEFAULT_COMPLETED_LABEL,
    errorLabel = DEFAULT_ERROR_LABEL,
    onKeyDown: nativeOnKeyDown,
    as,
    children,
    ref,
    ...nativeProps
  } = rest;

  // Idiomatic usage passes `onActiveChange`/`onStepClick` as inline functions,
  // which get a new identity every render. Read them through refs kept fresh
  // on every render, and expose stable (empty-deps) wrappers instead — so
  // neither identity leaks into `setActive` (via `useControllableState`'s
  // `onChange` dep) or the `contextValue` memo below, which is the whole
  // point of memoizing it.
  const onActiveChangeRef = useRef(onActiveChange);
  onActiveChangeRef.current = onActiveChange;
  const stableOnActiveChange = useCallback((index: number) => {
    onActiveChangeRef.current?.(index);
  }, []);

  const onStepClickRef = useRef(onStepClick);
  onStepClickRef.current = onStepClick;
  const stableOnStepClick = useCallback((detail: StepperStepClickDetail) => {
    onStepClickRef.current?.(detail);
  }, []);

  const [activeValue, setActive] = useControllableState(controlledActive, defaultActive, stableOnActiveChange);
  const active = activeValue ?? DEFAULT_ACTIVE;

  const [stepsMeta, setStepsMeta] = useState<ReadonlyMap<number, StepperStepMeta>>(new Map());

  // One traversal feeds both the index providers and the render-time meta
  // snapshot. Only valid elements consume a step index: a stray text node
  // between items must not shift every following step's position.
  const { items, renderStepsMeta } = useMemo(() => {
    const meta = new Map<number, StepperStepMeta>();
    let stepIndex = 0;

    const items = Children.toArray(children).map(child => {
      if (!isValidElement<Partial<StepperStepMeta>>(child)) return child;
      const index = stepIndex++;
      const { error = false, disabled = false, isClickable = true } = child.props;
      meta.set(index, { error, disabled, isClickable });
      return (
        <StepperItemIndexProvider key={child.key ?? index} value={{ index }}>
          {child}
        </StepperItemIndexProvider>
      );
    });

    return { items, renderStepsMeta: meta };
  }, [children]);

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
  // from cycling on every active-step change. `setActive` and
  // `stableOnStepClick` are likewise stable across renders (see above), so an
  // inline `onActiveChange`/`onStepClick` prop can't defeat this memo either.
  const contextValue = useMemo<StepperContextValue>(() => {
    // Mirrors Takeoff Core's canStepBeSelected: the target must be clickable
    // and enabled; under linear progression only previous steps, or the next
    // step while the current one is neither errored nor disabled, qualify.
    // The registry fills in effects, so items querying their own gating during
    // render (first paint, SSR) pass `selfMeta`; the linear rule's neighbor
    // lookup falls back to the root's child-prop snapshot until the registry
    // catches up.
    const canSelectStep = (index: number, selfMeta?: StepperStepMeta): boolean => {
      const target = stepsMeta.get(index) ?? selfMeta ?? renderStepsMeta.get(index);
      if (!target || target.disabled || !target.isClickable) return false;
      if (!linear) return true;
      if (index < active) return true;
      if (index === active + 1) {
        const current = stepsMeta.get(active) ?? renderStepsMeta.get(active);
        return !current?.error && !current?.disabled;
      }
      return false;
    };

    const getStepStatus = (options: StepperStepStatusOptions): StepperStepStatus => {
      const { index } = options;
      if (index < active) return 'completed';
      if (index === active) return 'active';
      return 'inactive';
    };

    return {
      active,
      mode,
      completedLabel,
      errorLabel,
      getStepStatus,
      registerStep,
      canSelectStep,
      selectStep: index => {
        if (index !== active && canSelectStep(index)) {
          setActive(index);
        }
      },
      emitStepClick: detail => {
        stableOnStepClick(detail);
      },
    };
  }, [active, mode, completedLabel, errorLabel, linear, stepsMeta, renderStepsMeta, registerStep, setActive, stableOnStepClick]);

  // Root slotProps take the same precedence over the prop-level handler they
  // already had via spread order; the composed handler then adds arrow-key
  // focus movement between step triggers unless the consumer prevented it.
  const { onKeyDown: slotOnKeyDown, ...restRootAttrs } = rootAttrs as typeof rootAttrs & { onKeyDown?: KeyboardEventHandler<HTMLElement> };
  const userOnKeyDown = slotOnKeyDown ?? (nativeOnKeyDown as KeyboardEventHandler<HTMLElement> | undefined);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    userOnKeyDown?.(event);
    if (event.defaultPrevented) return;

    const forwardKey = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
    const backwardKey = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
    if (event.key !== forwardKey && event.key !== backwardKey && event.key !== 'Home' && event.key !== 'End') return;
    const pressedTrigger = event.target instanceof HTMLElement ? event.target.closest('.tk-stepper-trigger') : null;
    // A step's children can render an arbitrarily nested Stepper of its own;
    // only react when the pressed trigger's nearest `.tk-stepper` ancestor is
    // this list, so a descendant stepper's keydown (bubbling up) doesn't get
    // mistaken for one of this list's own triggers.
    if (!pressedTrigger || pressedTrigger.closest('.tk-stepper') !== event.currentTarget) return;

    // Consumed even when focus cannot move (list edges, focus on a
    // non-clickable trigger): a matched navigation key falling through to
    // page scroll mid-interaction would feel broken.
    event.preventDefault();

    // Scoped to triggers whose nearest `.tk-stepper` ancestor is this list,
    // so a nested Stepper's own triggers never join this list's tab/arrow-key
    // sequence.
    const triggers = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>(FOCUSABLE_TRIGGER_SELECTOR)).filter(
      trigger => trigger.closest('.tk-stepper') === event.currentTarget,
    );
    const currentIndex = triggers.indexOf(pressedTrigger as HTMLButtonElement);
    if (triggers.length === 0 || (currentIndex === -1 && event.key !== 'Home' && event.key !== 'End')) return;

    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? triggers.length - 1 : event.key === forwardKey ? currentIndex + 1 : currentIndex - 1;
    triggers[nextIndex]?.focus();
  };

  const Component = (as ?? 'ol') as ElementType;

  return (
    <StepperProvider value={contextValue}>
      <Component {...nativeProps} {...restRootAttrs} ref={ref} onKeyDown={handleKeyDown}>
        {items}
      </Component>
    </StepperProvider>
  );
};

Stepper.displayName = 'Stepper';
