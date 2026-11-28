import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { GlobeSpinnerLabelBase } from './base';
import { useGlobeSpinnerContext } from './context';
import { LABEL_TEXT_LENGTH } from './paths';
import type { GlobeSpinnerLabelProps, GlobeSpinnerLabelSlot } from './types';

export const GlobeSpinnerLabel = (props: GlobeSpinnerLabelProps) => {
  const { labelPathId } = useGlobeSpinnerContext('GlobeSpinner.Label');
  const theme = useComponentTheme('GlobeSpinnerLabel');

  const { rootAttrs, rest } = composeRootAttrs<GlobeSpinnerLabelProps, GlobeSpinnerLabelSlot>(GlobeSpinnerLabelBase, props, theme);
  const { children } = rest;

  return (
    <text {...rootAttrs} dominantBaseline="central">
      {/* Stretching to a fixed length keeps short and long labels filling the arc evenly. */}
      <textPath href={`#${labelPathId}`} lengthAdjust="spacing" startOffset="50%" textAnchor="middle" textLength={LABEL_TEXT_LENGTH}>
        {children}
      </textPath>
    </text>
  );
};

GlobeSpinnerLabel.displayName = 'GlobeSpinner.Label';
