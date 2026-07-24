import { useState, type CSSProperties, type FocusEvent, type KeyboardEvent, type PointerEvent } from 'react';

import { buildSlotAttrs, composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { SliderThumbBase } from './base';
import { useSliderContext } from './context';
import { PAGE_STEP_MULTIPLIER } from './defaults';
import { formatValueText, offsetStyle, pointerCoord, thumbBounds, thumbLabel, toPercent } from './helpers';
import type { SliderThumbProps } from './types';

export const SliderThumb = (props: SliderThumbProps) => {
  const theme = useComponentTheme('SliderThumb');
  const {
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
    formatValue,
    setThumbValue,
    startDrag,
    thumbRefs,
    thumbDisabledRef,
    fieldId,
    labelId,
    describedBy,
    rootAriaLabel,
    rootAriaLabelledby,
  } = useSliderContext('Slider.Thumb');

  const [isFocused, setIsFocused] = useState(false);

  const { rootAttrs, rest } = composeRootAttrs(SliderThumbBase, props, theme);
  const { index = 0, disabled: ownDisabled, children, ref, style, onKeyDown, onPointerDown, onFocus, onBlur, ...nativeProps } = rest;

  const value = values[index] ?? bounds.min;
  const isDragging = draggingIndex === index;
  // Effective disabled: the whole slider, or just this handle. Registered by
  // index so the root skips it as a drag target and treats it as a wall a
  // neighbour cannot push past.
  const isDisabled = disabled || Boolean(ownDisabled);
  thumbDisabledRef.current[index] = isDisabled;

  // A thumb may never announce a range it cannot reach: in a range slider each
  // handle is bounded by its neighbour — offset by `minDistance` so the ARIA
  // surface matches the keyboard/drag clamp (which reads the same `thumbBounds`,
  // including its fall-back when `minDistance` over-constrains the gap).
  const { min: lowerBound, max: upperBound } = thumbBounds(values, index, bounds, minDistance);

  const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    onKeyDown?.(event);
    if (isDisabled || readOnly || event.defaultPrevented) return;

    const page = bounds.step * PAGE_STEP_MULTIPLIER;
    // Home/End target the absolute bounds; setThumbValue clamps them back to
    // the neighbour, so a range thumb stops against its partner.
    const next = {
      ArrowRight: value + bounds.step,
      ArrowUp: value + bounds.step,
      ArrowLeft: value - bounds.step,
      ArrowDown: value - bounds.step,
      PageUp: value + page,
      PageDown: value - page,
      Home: bounds.min,
      End: bounds.max,
    }[event.key];

    if (next === undefined) return;
    // The arrow keys would otherwise scroll the page out from under the drag.
    event.preventDefault();
    setThumbValue(index, next);
  };

  const handlePointerDown = (event: PointerEvent<HTMLSpanElement>) => {
    onPointerDown?.(event);
    if (isDisabled || readOnly || event.defaultPrevented || event.button !== 0) return;
    // The press starts the drag on THIS specific handle (not the nearest, as a
    // rail press does), so a thumb sharing a position with its partner still
    // grabs the one under the pointer. It grabs in place — no seek — so clicking
    // a handle never jumps its value; only a pointer move (the drag effect)
    // moves it. `startDrag` also lands focus on the handle.
    event.preventDefault();
    event.stopPropagation();
    startDrag(index, pointerCoord(event, orientation), false, event.pointerId);
  };

  // Canonical attrs for the DEFAULT bubble node (`data-slot="tooltip"` +
  // `tk-slider-tooltip`). A render-function child composes its own overlay, so
  // `classNames` / `slotProps.tooltip` apply solely to this default bubble.
  const tooltipAttrs = buildSlotAttrs(SliderThumbBase.getSlotProps('tooltip'), 'tooltip', {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: props.slotProps,
    instanceClassNames: props.classNames,
  });

  // The bubble's pointer. A real element (not the old `::after`) so its
  // size/colour can be overridden through `classNames.arrow` / `slotProps.arrow`
  // — the recipe draws a CSS triangle off `--tk-slider-arrow-*` custom props.
  const arrowAttrs = buildSlotAttrs(SliderThumbBase.getSlotProps('arrow'), 'arrow', {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: props.slotProps,
    instanceClassNames: props.classNames,
  });

  // One call, two forms: `formattedText` always renders, while the ARIA form
  // stays undefined without a formatter so `aria-valuetext` is dropped rather
  // than duplicating `aria-valuenow`.
  const formattedText = formatValueText(value, formatValue);
  const formatted = formatValue ? formattedText : undefined;
  const { style: slotStyle, ...slotAttrs } = rootAttrs as Record<string, unknown> & { style?: CSSProperties };

  // The value bubble's content. Consumer `children` replace it — a plain node
  // for static content, or a function for content that reads this thumb's
  // value / interaction state. Either way the handle and the bubble chrome are
  // preserved; children swap only what the bubble shows.
  const bubbleContent =
    children === undefined ? formattedText : typeof children === 'function' ? children({ value, formatted: formattedText, index, isDragging, isFocused }) : children;

  // A CSS-positioned value bubble parented to the handle. Deliberately NOT the
  // Tooltip component: a floating overlay observes the moving,
  // continuously-resizing bubble with a ResizeObserver, which both lags behind
  // the drag and trips the browser's benign "ResizeObserver loop" warning. A
  // CSS bubble anchored to the thumb has neither problem.
  //
  // The bubble is `aria-hidden` because the value is announced once, through
  // the thumb's aria-valuenow / aria-valuetext; the recipe reveals it on
  // data-dragging / data-focus.
  return (
    <span
      {...nativeProps}
      {...(slotAttrs as Record<string, unknown>)}
      role="slider"
      tabIndex={isDisabled ? -1 : 0}
      aria-valuemin={lowerBound}
      aria-valuemax={upperBound}
      aria-valuenow={value}
      aria-valuetext={formatted}
      aria-orientation={orientation}
      aria-disabled={isDisabled || undefined}
      aria-readonly={readOnly || undefined}
      aria-invalid={invalid || undefined}
      aria-required={required || undefined}
      // Every handle of a range needs a distinguishable name (thumbLabel gives
      // Minimum/Maximum/Value N); a single slider (thumbLabel → undefined) takes
      // its name from the surrounding Field, a root `aria-label`, or the
      // consumer's own `Slider.Thumb aria-label`.
      aria-label={nativeProps['aria-label'] ?? thumbLabel(index, values.length) ?? rootAriaLabel}
      // A range groups its thumbs under a role="group" that carries the Field /
      // root label, so each thumb keeps its own aria-label (Minimum/Maximum/
      // Value N); pointing aria-labelledby at the same label here would override
      // that and make every handle announce one identical name. A single slider
      // has no group, so its thumb takes the root aria-labelledby or the Field
      // label directly.
      aria-labelledby={nativeProps['aria-labelledby'] ?? (range ? undefined : (rootAriaLabelledby ?? labelId))}
      // Keeps the Field description/error: the value is already announced
      // through aria-valuenow / aria-valuetext, so the bubble adds nothing here.
      aria-describedby={nativeProps['aria-describedby'] ?? describedBy}
      // Only the first thumb adopts the Field id so `Field.Label`'s htmlFor
      // lands on a real focusable control instead of the layout wrapper.
      id={nativeProps.id ?? (index === 0 ? fieldId : undefined)}
      // Only the outer handles carry the min/max vocabulary — a middle handle
      // of a 3+ thumb range is neither, so it gets no attribute.
      data-thumb={range ? (index === 0 ? 'min' : index === values.length - 1 ? 'max' : undefined) : undefined}
      data-dragging={isDragging ? '' : undefined}
      data-focus={isFocused ? '' : undefined}
      // Per-thumb disabled hook — the recipe mutes just this handle even when
      // the rest of the slider stays interactive.
      data-disabled={isDisabled ? '' : undefined}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onFocus={(event: FocusEvent<HTMLSpanElement>) => {
        onFocus?.(event);
        setIsFocused(true);
      }}
      onBlur={(event: FocusEvent<HTMLSpanElement>) => {
        onBlur?.(event);
        setIsFocused(false);
      }}
      // The handle position is a continuous value, written inline rather than
      // as a data-* hook.
      style={{ ...style, ...slotStyle, ...offsetStyle(toPercent(value, bounds), orientation) }}
      ref={(node: HTMLSpanElement | null) => {
        // Register by index so the root can focus this handle on drag/swap/press.
        thumbRefs.current[index] = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
    >
      <span {...tooltipAttrs} aria-hidden="true">
        {bubbleContent}
        <span {...arrowAttrs} aria-hidden="true" />
      </span>
    </span>
  );
};

SliderThumb.displayName = 'Slider.Thumb';
