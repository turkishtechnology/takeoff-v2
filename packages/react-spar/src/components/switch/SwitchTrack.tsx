import { SwitchTrack as SparSwitchTrack } from '@turkish-technology/spar';

import { buildSlotAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { SwitchBase } from './base';
import { useSwitchOwnContext } from './context';
import type { SwitchTrackProps } from './types';

export const SwitchTrack = (props: SwitchTrackProps) => {
  const theme = useComponentTheme('Switch');
  const { classNames, slotProps } = useSwitchOwnContext('Switch.Track');
  const { className, children, ref, ...spar } = props;

  const trackAttrs = buildSlotAttrs(SwitchBase.getSlotProps('track', { className }), 'track', {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: slotProps,
    instanceClassNames: classNames,
  });

  return (
    <SparSwitchTrack {...spar} {...trackAttrs} ref={ref}>
      {children}
    </SparSwitchTrack>
  );
};

SwitchTrack.displayName = 'Switch.Track';
