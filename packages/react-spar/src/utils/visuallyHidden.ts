import type { CSSProperties } from 'react';

// The design system ships no sr-only utility and the recipes must stay a purely
// visual dependency, so text meant only for assistive technology hides itself
// inline with this style.
export const visuallyHidden: CSSProperties = {
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
