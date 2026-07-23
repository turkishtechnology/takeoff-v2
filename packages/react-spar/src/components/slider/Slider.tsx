import { useCallback, useEffect, useMemo, useRef, useState, type ElementType, type ReactNode } from 'react';
import { useOptionalFieldContext } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useControllableState } from '../../hooks';
import { useComponentTheme } from '../../provider';
import { isDevelopment } from '../../utils';

import { SliderBase } from './base';
import { SliderProvider } from './context';
import { DEFAULT_MIN_DISTANCE, DEFAULT_ORIENTATION, DEFAULT_SIZE, DEFAULT_TOOLTIP, DEFAULT_TRACK, DEFAULT_VARIANT } from './defaults';
import { normalizeValues, pointerCoord, rangeInputName, resolveBounds, toCommittedValue, valueFromPointer, valuesEqual, withThumbClamped, withThumbSwapped } from './helpers';
import { SliderTrack } from './SliderTrack';
import type { SliderOwnProps, SliderProps, SliderValue } from './types';

// Dev-only: dedupes the inverted-range warning per distinct message so a
// slider whose bounds are re-derived every render can't flood the console.
const warnedRanges = new Set<string>();

// The public props are a discriminated union (`range` decides whether the
// value is a number or a tuple), which is the right surface for consumers but
// awkward to destructure — a union of callbacks has no callable signature.
// The root narrows to this internal shape once, then re-widens on commit
// through `toCommittedValue`.
type SliderResolvedProps = Omit<SliderOwnProps, 'classNames' | 'slotProps'> & {
  range?: boolean;
  value?: SliderValue;
  defaultValue?: SliderValue;
  onValueChange?: (value: SliderValue) => void;
  onValueChangeEnd?: (value: SliderValue) => void;
  as?: ElementType;
  ref?: React.Ref<Element>;
  children?: ReactNode;
};

export const Slider = <T extends ElementType = 'div'>(props: SliderProps<T>) => {
  const theme = useComponentTheme('Slider');
  // Composing inside a Field wires the accessible name and the shared control
  // state for free: direct props still win over the inherited values.
  const field = useOptionalFieldContext();

  const { rootAttrs, rest } = composeRootAttrs(SliderBase, props as SliderProps<'div'>, theme, {
    stateAttrs: merged => {
      const {
        size = DEFAULT_SIZE,
        variant = DEFAULT_VARIANT,
        orientation = DEFAULT_ORIENTATION,
        tooltip = DEFAULT_TOOLTIP,
        track = DEFAULT_TRACK,
        range,
        disabled,
        readOnly,
        invalid,
        required,
      } = merged as SliderResolvedProps;
      return {
        'data-size': size,
        'data-variant': variant,
        'data-orientation': orientation,
        'data-tooltip': tooltip,
        'data-track': track,
        'data-range': range ? '' : undefined,
        'data-disabled': (disabled ?? field?.disabled) ? '' : undefined,
        'data-readonly': (readOnly ?? field?.readOnly) ? '' : undefined,
        'data-invalid': (invalid ?? field?.invalid) ? '' : undefined,
        'data-required': (required ?? field?.required) ? '' : undefined,
      };
    },
  });

  const {
    // Consumed through the resolved state below (and as the root data-* hooks);
    // destructured so the <div> doesn't receive unknown DOM attributes.
    min: rawMin,
    max: rawMax,
    step: rawStep,
    range = false,
    value,
    defaultValue,
    onValueChange,
    onValueChangeEnd,
    disabled: ownDisabled,
    readOnly: ownReadOnly,
    invalid: ownInvalid,
    required: ownRequired,
    minDistance = DEFAULT_MIN_DISTANCE,
    orientation = DEFAULT_ORIENTATION,
    size: _size,
    variant: _variant,
    // Consumed as the `data-tooltip` / `data-track` root hooks above (the recipe
    // drives the value bubble and the inverted/none fill off them); pulled out
    // so they never land on the <div> as unknown attributes.
    tooltip: _tooltip,
    track: _track,
    formatValue,
    name,
    form,
    as,
    children,
    ref,
    ...nativeProps
  } = rest as SliderResolvedProps;

  const disabled = ownDisabled ?? field?.disabled ?? false;
  const readOnly = ownReadOnly ?? field?.readOnly ?? false;
  const invalid = ownInvalid ?? field?.invalid ?? false;
  const required = ownRequired ?? field?.required ?? false;

  const bounds = resolveBounds(rawMin, rawMax, rawStep);

  if (isDevelopment() && typeof rawMax === 'number' && Number.isFinite(rawMax) && rawMax <= bounds.min) {
    const message = `[Slider] \`max\` (${rawMax}) must be greater than \`min\` (${bounds.min}); falling back to ${bounds.max}.`;
    if (!warnedRanges.has(message)) {
      warnedRanges.add(message);
      // eslint-disable-next-line no-console
      console.warn(message);
    }
  }

  // Both branches normalize through the same path, so a controlled prop and an
  // uncontrolled default are clamped and snapped identically.
  const controlledValues = value === undefined ? undefined : normalizeValues(value, range, bounds);
  const initialValues = normalizeValues(defaultValue, range, bounds);

  // `onValueChange` is read through a ref so `handleCommit` — and the
  // `setValues`/`commit`/drag-effect chain built on it — keeps a stable identity
  // even when the consumer passes an inline handler; otherwise the document
  // pointer listeners would rebind on every drag frame.
  const onValueChangeRef = useRef(onValueChange);
  onValueChangeRef.current = onValueChange;
  const handleCommit = useCallback((next: number[]) => onValueChangeRef.current?.(toCommittedValue(next, range)), [range]);
  const [rawValues = initialValues, setValues] = useControllableState<number[]>(controlledValues, initialValues, handleCommit);

  // Re-normalize the stored values against the *current* bounds every render so
  // a runtime `min` / `max` / `step` change can't leave an uncontrolled value
  // off-grid or out of range (the controlled path already re-derives from the
  // prop each render). Pure derivation — it never commits, so `onValueChange`
  // does not fire on a bounds change.
  const values = useMemo(() => normalizeValues(toCommittedValue(rawValues, range), range, bounds), [rawValues, range, bounds.min, bounds.max, bounds.step]);

  // `onValueChangeEnd` fires once when an interaction settles; kept in a ref so
  // the drag effect's listeners don't rebind when the handler identity changes.
  const onValueChangeEndRef = useRef(onValueChangeEnd);
  onValueChangeEndRef.current = onValueChangeEnd;
  const emitChangeEnd = useCallback((vals: number[]) => onValueChangeEndRef.current?.(toCommittedValue(vals, range)), [range]);

  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  // Each thumb registers its node here by index, so a drag or track press can
  // move focus onto the handle it activates — including the swapped handle when
  // a drag crosses its neighbour.
  const thumbRefs = useRef<(HTMLElement | null)[]>([]);
  // Each thumb registers its resolved disabled state here, so the root can skip
  // a disabled handle as a drag target and treat it as a wall a neighbour
  // cannot push past.
  const thumbDisabledRef = useRef<boolean[]>([]);
  // The committed values when a pointer gesture began; compared on release so
  // `onValueChangeEnd` fires only when the drag actually moved the value.
  const gestureStartRef = useRef<number[] | null>(null);

  // The pointer handlers are bound once per drag, so they read the live values
  // from a ref instead of closing over the render they were created in.
  const valuesRef = useRef(values);
  valuesRef.current = values;

  // Trim the by-index disabled mirror to the current thumb count so a range
  // that shrank (3 handles down to 2) can't leave a stale trailing entry a
  // neighbour would treat as a phantom wall. `thumbRefs` self-heals through
  // React's ref cleanup; this mirror is written during each thumb's render, so
  // the root trims it here. Children render after the root and rewrite indices
  // 0…n-1, so trimming first never drops a live entry.
  thumbDisabledRef.current.length = values.length;

  const valueFromPoint = useCallback(
    (point: number): number => {
      const track = trackRef.current;
      if (!track) return bounds.min;
      return valueFromPointer(track.getBoundingClientRect(), point, bounds, orientation);
    },
    [bounds.min, bounds.max, bounds.step, orientation],
  );

  const commit = useCallback(
    (next: number[]) => {
      if (!valuesEqual(next, valuesRef.current)) setValues(next);
    },
    [setValues],
  );

  // Keyboard path: a thumb may never jump past its neighbour, keeps any
  // `minDistance` gap, and a disabled handle never moves. Each keystroke is a
  // settled change, so it reports through `onValueChangeEnd` too.
  const setThumbValue = useCallback(
    (index: number, next: number) => {
      if (disabled || readOnly || thumbDisabledRef.current[index]) return;
      const before = valuesRef.current;
      const updated = withThumbClamped(before, index, next, bounds, minDistance);
      commit(updated);
      if (!valuesEqual(updated, before)) emitChangeEnd(updated);
    },
    [disabled, readOnly, commit, emitChangeEnd, minDistance, bounds.min, bounds.max, bounds.step],
  );

  // Pointer path: crossing a neighbour swaps the two thumbs instead of
  // sticking, so the pointer keeps controlling the handle it grabbed — unless a
  // `minDistance` gap or a disabled neighbour turns crossing off.
  const startDrag = useCallback(
    (index: number, point: number, seek: boolean) => {
      if (disabled || readOnly || thumbDisabledRef.current[index]) return;
      gestureStartRef.current = valuesRef.current;
      // A thumb grab starts the drag in place: it must not jump the value, so
      // nothing is committed here — the value only moves once the pointer does
      // (the drag effect below). A track press instead seeks the grabbed handle
      // to the pressed point, which is the whole point of press-to-seek.
      if (!seek) {
        setDraggingIndex(index);
        thumbRefs.current[index]?.focus();
        return;
      }
      const { values: next, index: active } = withThumbSwapped(valuesRef.current, index, valueFromPoint(point), bounds, minDistance, thumbDisabledRef.current);
      setDraggingIndex(active);
      // Focus follows the nearest handle the rail press grabbed, so an arrow key
      // after the gesture moves the same thumb.
      thumbRefs.current[active]?.focus();
      commit(next);
    },
    [disabled, readOnly, commit, valueFromPoint, minDistance, bounds.min, bounds.max, bounds.step],
  );

  useEffect(() => {
    if (draggingIndex === null) return;

    const handleMove = (event: PointerEvent) => {
      const { values: next, index: active } = withThumbSwapped(
        valuesRef.current,
        draggingIndex,
        valueFromPoint(pointerCoord(event, orientation)),
        bounds,
        minDistance,
        thumbDisabledRef.current,
      );
      if (active !== draggingIndex) {
        setDraggingIndex(active);
        // The pointer now controls the swapped handle — carry focus with it so
        // the keyboard keeps driving the thumb the user is dragging.
        thumbRefs.current[active]?.focus();
      }
      commit(next);
    };
    const handleEnd = () => {
      setDraggingIndex(null);
      // Report the settled value once, but only if the gesture moved it.
      if (gestureStartRef.current && !valuesEqual(valuesRef.current, gestureStartRef.current)) emitChangeEnd(valuesRef.current);
      gestureStartRef.current = null;
    };

    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', handleEnd);
    document.addEventListener('pointercancel', handleEnd);
    return () => {
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleEnd);
      document.removeEventListener('pointercancel', handleEnd);
    };
  }, [draggingIndex, valueFromPoint, commit, emitChangeEnd, minDistance, orientation, bounds.min, bounds.max, bounds.step]);

  const Component = (as ?? 'div') as ElementType;

  // `nativeProps` is the leftover HTML surface; the resolved shape above only
  // models the component's own props, so the two attributes read back here
  // are typed at the point of use.
  const htmlProps = nativeProps as { 'role'?: string; 'aria-labelledby'?: string };

  // Each thumb owns `role="slider"`, so a range root groups the pair; a single
  // slider needs no extra role above its one thumb.
  const groupAttrs = range
    ? {
        'role': htmlProps.role ?? 'group',
        'aria-labelledby': htmlProps['aria-labelledby'] ?? field?.labelId,
      }
    : {};

  return (
    <SliderProvider
      value={{
        values,
        bounds,
        range,
        minDistance,
        orientation,
        disabled,
        readOnly,
        invalid,
        required,
        draggingIndex,
        trackRef,
        thumbRefs,
        thumbDisabledRef,
        formatValue,
        setThumbValue,
        startDrag,
        valueFromPoint,
        fieldId: field?.fieldId,
        labelId: field?.labelId,
        describedBy: invalid ? field?.errorId : field?.descriptionId,
      }}
    >
      <Component {...nativeProps} {...groupAttrs} {...rootAttrs} ref={ref}>
        {/* The track is the whole default anatomy. Any indicator below it
            (e.g. `Slider.Ticks`) is anatomy, so it is added by composition
            rather than selected by a content prop — see the
            Input-modes-as-composition exception in the authoring contract. */}
        {children ?? <SliderTrack />}
        {/* Submitted alongside the form rather than through a focusable
            control: the thumb is the interactive element, so a paired input
            would double the tab stops. A disabled slider submits nothing,
            matching a disabled native control. */}
        {name &&
          !disabled &&
          (range ? (
            // One input per handle so a 3+ thumb range submits every value; a
            // two-handle range keeps the conventional `-min` / `-max` pair.
            values.map((entry, index) => <input key={index} type="hidden" name={rangeInputName(name, index, values.length)} value={entry} form={form} />)
          ) : (
            <input type="hidden" name={name} value={values[0]} form={form} />
          ))}
      </Component>
    </SliderProvider>
  );
};

Slider.displayName = 'Slider';
