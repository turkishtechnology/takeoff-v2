import { useCallback, useMemo, useRef } from 'react';

import type { AccordionActiveIndex, AccordionItemKey } from './types';

export interface UseAccordionAdapterInput {
  activeIndex?: AccordionActiveIndex;
  defaultActiveIndex?: AccordionActiveIndex;
  onActiveIndexChange?: (next: AccordionActiveIndex) => void;
  allowMultiple?: boolean;
  /**
   * Ordered identities of every direct Accordion item in declaration order.
   * The root walks children once to build this list and feeds it to the
   * adapter so the callback shape can round-trip Spar's stringified value
   * back to the original {@link AccordionItemKey} type.
   */
  itemKeys: readonly AccordionItemKey[];
}

export interface UseAccordionAdapterOutput {
  /** Spar primitive `type` discriminator (`'single'` vs `'multiple'`). */
  sparType: 'single' | 'multiple';
  /** Always `true` so single-mode panels can still collapse, matching Core. */
  sparIsCollapsible: true;
  /** Spar `value` (controlled). `undefined` when consumer is uncontrolled. */
  sparValue: string | string[] | undefined;
  /** Spar `defaultValue` (uncontrolled initial state). */
  sparDefaultValue: string | string[] | undefined;
  /**
   * Spar `onValueChange`. Translates Spar's stringified payload back to the
   * Takeoff-shaped {@link AccordionActiveIndex} and forwards exactly once per
   * user-visible state change.
   */
  sparOnValueChange: (next: string | string[]) => void;
}

/**
 * Bridge between the Takeoff-vocabulary Accordion API and the Spar primitive.
 *
 * Owns:
 *
 * - `activeIndex` ↔ `value` shape conversion (single vs multi, string vs
 *   number identities).
 * - `allowMultiple` → `type='single'|'multiple'` mapping.
 * - The `isCollapsible` default flip: Takeoff Core lets single-mode panels
 *   collapse; Spar defaults to `false` here, so the wrapper hard-codes `true`.
 * - Round-tripping the original {@link AccordionItemKey} shape on the
 *   `onActiveIndexChange` callback. Items declared with numeric `itemKey`
 *   emit numbers; items declared with string `itemKey` emit strings.
 *
 * The hook is intentionally JSX-free so the contract test can exercise it in
 * isolation and so the root component stays a thin assembly point.
 */
export const useAccordionAdapter = ({
  activeIndex,
  defaultActiveIndex,
  onActiveIndexChange,
  allowMultiple = false,
  itemKeys,
}: UseAccordionAdapterInput): UseAccordionAdapterOutput => {
  const sparType: 'single' | 'multiple' = allowMultiple ? 'multiple' : 'single';

  // Map "stringified spar value" → "original itemKey" so the callback can
  // re-emit the consumer's original shape. Built fresh per render because
  // `itemKeys` is the only source of truth for declaration order.
  const stringToOriginalKey = useMemo(() => {
    const map = new Map<string, AccordionItemKey>();
    itemKeys.forEach(key => {
      map.set(String(key), key);
    });
    return map;
  }, [itemKeys]);

  const stringToOriginalKeyRef = useRef(stringToOriginalKey);
  stringToOriginalKeyRef.current = stringToOriginalKey;

  const sparValue = useMemo(() => takeoffToSparValue(activeIndex, allowMultiple), [activeIndex, allowMultiple]);
  const sparDefaultValue = useMemo(() => takeoffToSparValue(defaultActiveIndex, allowMultiple), [defaultActiveIndex, allowMultiple]);

  const sparOnValueChange = useCallback(
    (next: string | string[]) => {
      if (!onActiveIndexChange) return;
      const restored = sparToTakeoffValue(next, allowMultiple, stringToOriginalKeyRef.current);
      onActiveIndexChange(restored);
    },
    [onActiveIndexChange, allowMultiple],
  );

  return {
    sparType,
    sparIsCollapsible: true,
    sparValue,
    sparDefaultValue,
    sparOnValueChange,
  };
};

const takeoffToSparValue = (input: AccordionActiveIndex | undefined, allowMultiple: boolean): string | string[] | undefined => {
  if (input === undefined) return undefined;
  if (Array.isArray(input)) {
    if (!allowMultiple) {
      // Single mode + array input → Spar wants a string. Mirror Core's rule
      // ("only the last value in the array will be used").
      const last = input.length > 0 ? input[input.length - 1] : undefined;
      return last === undefined ? '' : String(last);
    }
    return input.map(value => String(value));
  }
  // Scalar input. Single mode uses string; multi mode wraps into an array.
  return allowMultiple ? [String(input)] : String(input);
};

const sparToTakeoffValue = (next: string | string[], allowMultiple: boolean, lookup: Map<string, AccordionItemKey>): AccordionActiveIndex => {
  const restoreOne = (value: string): AccordionItemKey => lookup.get(value) ?? value;
  if (Array.isArray(next)) return next.map(restoreOne);
  if (allowMultiple) return next === '' ? [] : [restoreOne(next)];
  // Single mode + Spar reports collapse with empty string. Surface as the
  // empty Takeoff value (empty string scalar) so consumers see a stable
  // "nothing active" signal that matches Core.
  return next === '' ? '' : restoreOne(next);
};
