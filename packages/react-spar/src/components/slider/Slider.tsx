import { useCallback, useEffect, useMemo, useRef, useState, type ElementType, type ReactNode } from 'react';
import { InputField as SparInputField, useOptionalFieldContext } from '@turkish-technology/spar';

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

// Dev-only: dedupes the inverted-range warning by a *stable* key (not the
// interpolated message) so a slider whose bounds are re-derived every render
// neither floods the console nor grows this set with each distinct config.
const warnedRanges = new Set<string>();

// Test-only: the dedup set is module-level, so without a reset one suite's
// cases leak into the next (a later render with the same warning would silently
// no-op). Cleared in the test `beforeEach`; not re-exported from the barrel.
export const resetSliderDevWarnings = (): void => warnedRanges.clear();

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
    if (!warnedRanges.has('inverted-range')) {
      warnedRanges.add('inverted-range');
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
  // Latest settle emitter, read from the unmount cleanup below — an `[]`-deps
  // effect would otherwise close over the first render's `range`.
  const emitChangeEndRef = useRef(emitChangeEnd);
  emitChangeEndRef.current = emitChangeEnd;

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
  // The `pointerId` that owns the active drag. The document listeners below
  // check every event against it so a second finger's `pointermove` can't
  // hijack the grabbed thumb, and a stray pointer's `pointerup` can't end a
  // drag it never started.
  const dragPointerRef = useRef<number | null>(null);

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
    (index: number, point: number, seek: boolean, pointerId: number) => {
      if (disabled || readOnly || thumbDisabledRef.current[index]) return;
      gestureStartRef.current = valuesRef.current;
      dragPointerRef.current = pointerId;
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
    // The pointer that owns this gesture, captured when the drag started. A swap
    // re-runs this effect but keeps `dragPointerRef` set, so the same pointer
    // stays in control across the rebind.
    const ownerId = dragPointerRef.current;
    const isOwner = (event: PointerEvent) => ownerId === null || event.pointerId === ownerId;

    const settle = () => {
      setDraggingIndex(null);
      // Report the settled value once, but only if the gesture moved it.
      if (gestureStartRef.current && !valuesEqual(valuesRef.current, gestureStartRef.current)) emitChangeEnd(valuesRef.current);
      gestureStartRef.current = null;
      dragPointerRef.current = null;
    };

    const handleMove = (event: PointerEvent) => {
      // A second finger's move (or any other pointer's) must not drive the
      // thumb the first one grabbed.
      if (!isOwner(event)) return;
      // No button is held — a `pointerup` was missed (released outside the
      // window), so the drag would otherwise stick to the bare cursor. Settle it.
      if (event.buttons === 0) {
        settle();
        return;
      }
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
    const handleEnd = (event: PointerEvent) => {
      // Ignore a stray pointer's release (e.g. a second finger lifting) so it
      // can't end the drag the owning pointer is still running.
      if (!isOwner(event)) return;
      settle();
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

  // A slider unmounted mid-drag (a popover that closes on release, say) never
  // sees the `pointerup` that settles the value, so `onValueChangeEnd` would be
  // dropped. Emit it once here — scoped to a genuine unmount with `[]` deps so a
  // thumb-swap re-run of the drag effect above can't fire it spuriously. Reads
  // live values / emitter through refs since the closure is fixed at mount.
  useEffect(
    () => () => {
      if (gestureStartRef.current && !valuesEqual(valuesRef.current, gestureStartRef.current)) emitChangeEndRef.current(valuesRef.current);
      gestureStartRef.current = null;
    },
    [],
  );

  const Component = (as ?? 'div') as ElementType;

  // `nativeProps` is the leftover HTML surface; the resolved shape above only
  // models the component's own props, so the attributes read back here are
  // typed at the point of use.
  const htmlProps = nativeProps as { 'role'?: string; 'aria-label'?: string; 'aria-labelledby'?: string };

  // Each thumb owns `role="slider"`, so a range root groups the pair; a single
  // slider needs no extra role above its one thumb.
  const groupAttrs = range
    ? {
        'role': htmlProps.role ?? 'group',
        'aria-labelledby': htmlProps['aria-labelledby'] ?? field?.labelId,
      }
    : {};

  // A single slider's accessible name belongs on the thumb (the role="slider"
  // element), not the roleless wrapper: an `aria-label` / `aria-labelledby` on a
  // bare `<Slider>` would otherwise sit on a generic <div> — where assistive
  // tech ignores it — and never name the control. Forward them through context
  // to the thumb and strip them from the wrapper. A range names its role="group"
  // wrapper instead (each thumb keeps its own Minimum/Maximum name), so it
  // leaves them in place.
  const { 'aria-label': rootAriaLabel, 'aria-labelledby': rootAriaLabelledby, ...singleWrapperProps } = htmlProps;
  const wrapperProps = range ? nativeProps : (singleWrapperProps as typeof nativeProps);

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
        // Only a single slider forwards the root name to its thumb; a range
        // carries it on the group wrapper above.
        rootAriaLabel: range ? undefined : rootAriaLabel,
        rootAriaLabelledby: range ? undefined : rootAriaLabelledby,
      }}
    >
      <Component {...wrapperProps} {...groupAttrs} {...rootAttrs} ref={ref}>
        {/* The track is the whole default anatomy. Any indicator below it
            (e.g. `Slider.Ticks`) is anatomy, so it is added by composition
            rather than selected by a content prop — see the
            Input-modes-as-composition exception in the authoring contract. */}
        {children ?? <SliderTrack />}
        {/* Submitted alongside the form rather than through a focusable
            control: the thumb is the interactive element, so a paired input
            would double the tab stops. A disabled slider submits nothing,
            matching a disabled native control. Rendered through Spar's
            `InputField` rather than a bare `<input>` so every form field in the
            library goes through the same primitive; `type="hidden"` keeps it
            out of the tab order and unstyled (no `.tk-input` class), and the
            primitive adds nothing of its own here — it is used outside an
            `Input` root, so there is no context to inherit id / aria / state
            from, and its `data-*` hooks stay off for a field that never
            focuses. */}
        {name &&
          !disabled &&
          (range ? (
            // One input per handle so a 3+ thumb range submits every value; a
            // two-handle range keeps the conventional `-min` / `-max` pair.
            values.map((entry, index) => <SparInputField key={index} type="hidden" name={rangeInputName(name, index, values.length)} value={entry} form={form} />)
          ) : (
            <SparInputField type="hidden" name={name} value={values[0]} form={form} />
          ))}
      </Component>
    </SliderProvider>
  );
};

Slider.displayName = 'Slider';
