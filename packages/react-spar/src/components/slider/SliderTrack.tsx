import type { PointerEvent } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { SliderTrackBase } from './base';
import { useSliderContext } from './context';
import { closestThumbIndex, pointerCoord } from './helpers';
import { SliderRange } from './SliderRange';
import { SliderThumb } from './SliderThumb';
import type { SliderTrackProps } from './types';

export const SliderTrack = (props: SliderTrackProps) => {
  const theme = useComponentTheme('SliderTrack');
  const { values, disabled, readOnly, orientation, valueFromPoint, startDrag, trackRef, thumbDisabledRef } = useSliderContext('Slider.Track');

  const { rootAttrs, rest } = composeRootAttrs(SliderTrackBase, props, theme);
  const { children, ref, onPointerDown, ...nativeProps } = rest;

  // Press-to-seek: the rail grabs whichever thumb sits closest to the press
  // and starts dragging it, so a tap jumps the value and a drag continues
  // from there in one gesture.
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    onPointerDown?.(event);
    if (disabled || readOnly || event.defaultPrevented || event.button !== 0) return;
    // Keeps the press from selecting surrounding text mid-drag; the thumb
    // takes focus itself in its own handler.
    event.preventDefault();
    const point = pointerCoord(event, orientation);
    // A rail press seeks the grabbed thumb to the pressed point (seek = true),
    // unlike a thumb grab which starts in place.
    startDrag(closestThumbIndex(values, valueFromPoint(point), thumbDisabledRef.current), point, true);
  };

  return (
    <div
      {...nativeProps}
      {...rootAttrs}
      onPointerDown={handlePointerDown}
      ref={node => {
        trackRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
    >
      {children ?? (
        <>
          <SliderRange />
          {values.map((_, index) => (
            <SliderThumb key={index} index={index} />
          ))}
        </>
      )}
    </div>
  );
};

SliderTrack.displayName = 'Slider.Track';
