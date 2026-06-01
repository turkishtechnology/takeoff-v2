import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { InputStrengthBase } from './base';
import { useInputOwnContext } from './context';
import type { InputStrengthProps } from './types';

const SEGMENT_COUNT = 4;
type StrengthLevel = 'weak' | 'medium' | 'strong';

// Mirrors the takeoff-ui tk-input strength heuristic: one point each for
// length, upper/lower case, digits, and symbols (max 5).
const computeStrength = (value: string): number => {
  let strength = 0;
  if (value.length >= 8) strength += 1;
  if (/[A-Z]/.test(value)) strength += 1;
  if (/[a-z]/.test(value)) strength += 1;
  if (/[0-9]/.test(value)) strength += 1;
  if (/[^A-Za-z0-9]/.test(value)) strength += 1;
  return strength;
};

const levelFor = (strength: number): StrengthLevel => (strength < 3 ? 'weak' : strength < 4 ? 'medium' : 'strong');

export const InputStrength = <T extends ElementType = 'div'>(props: InputStrengthProps<T>) => {
  const theme = useComponentTheme('InputStrength');
  const { fieldValue } = useInputOwnContext('Input.Strength');
  const Component = (props.as ?? 'div') as ElementType;

  const { rootAttrs, rest } = composeRootAttrs(InputStrengthBase, props as InputStrengthProps<'div'>, theme);

  const { as: _as, children: _children, ref, ...rendered } = rest;

  const strength = computeStrength(fieldValue);
  const filled = Math.min(strength, SEGMENT_COUNT);
  const level = levelFor(strength);

  return (
    <Component {...rendered} ref={ref} {...rootAttrs}>
      {Array.from({ length: SEGMENT_COUNT }, (_, index) => (
        <span key={index} className="tk-input-strength-segment" data-level={index < filled ? level : undefined} />
      ))}
    </Component>
  );
};

InputStrength.displayName = 'Input.Strength';
