import { describe, it, expect } from 'vitest';
import { AccordionBase, AccordionItemBase, encodeAccordionItemValue, decodeAccordionItemValue } from './AccordionBase';
import { normalizeAccordionItemKeys, normalizeEncodedAccordionValues, toPublicActiveIndex, areEncodedValueArraysEqual } from './useAccordionAdapter';

describe('AccordionBase', () => {
  it('should have correct name', () => {
    expect(AccordionBase.name).toBe('Accordion');
  });

  it('should have root slot', () => {
    expect(AccordionBase.slots).toEqual(['root']);
    expect(AccordionBase.classes.root).toBe('tk-accordion');
  });

  it('should have correct default props', () => {
    expect(AccordionBase.defaultProps.allowMultiple).toBe(false);
    expect(AccordionBase.defaultProps.type).toBe('grouped');
    expect(AccordionBase.defaultProps.mode).toBe('default');
  });
});

describe('AccordionItemBase', () => {
  it('should have correct name', () => {
    expect(AccordionItemBase.name).toBe('AccordionItem');
  });

  it('should have all item slots', () => {
    expect(AccordionItemBase.slots).toEqual(['root', 'header', 'title', 'content', 'icon', 'arrow']);
  });

  it('should have correct class names', () => {
    expect(AccordionItemBase.classes.root).toBe('tk-accordion-item');
    expect(AccordionItemBase.classes.header).toBe('tk-accordion-item-header');
    expect(AccordionItemBase.classes.title).toBe('tk-accordion-item-title');
    expect(AccordionItemBase.classes.content).toBe('tk-accordion-item-content');
    expect(AccordionItemBase.classes.icon).toBe('tk-accordion-item-icon');
    expect(AccordionItemBase.classes.arrow).toBe('tk-accordion-item-arrow');
  });

  it('should have correct default props', () => {
    expect(AccordionItemBase.defaultProps.size).toBe('base');
  });
});

describe('encodeAccordionItemValue', () => {
  it('should encode number values with n: prefix', () => {
    expect(encodeAccordionItemValue(0)).toBe('n:0');
    expect(encodeAccordionItemValue(42)).toBe('n:42');
  });

  it('should encode string values with s: prefix', () => {
    expect(encodeAccordionItemValue('foo')).toBe('s:foo');
    expect(encodeAccordionItemValue('')).toBe('s:');
  });
});

describe('decodeAccordionItemValue', () => {
  it('should decode n: prefix to number', () => {
    expect(decodeAccordionItemValue('n:0')).toBe(0);
    expect(decodeAccordionItemValue('n:42')).toBe(42);
  });

  it('should decode s: prefix to string', () => {
    expect(decodeAccordionItemValue('s:foo')).toBe('foo');
    expect(decodeAccordionItemValue('s:')).toBe('');
  });

  it('should return raw value for unknown prefix', () => {
    expect(decodeAccordionItemValue('unknown')).toBe('unknown');
  });
});

describe('encode/decode roundtrip', () => {
  it('should roundtrip numbers', () => {
    expect(decodeAccordionItemValue(encodeAccordionItemValue(5))).toBe(5);
  });

  it('should roundtrip strings', () => {
    expect(decodeAccordionItemValue(encodeAccordionItemValue('hello'))).toBe('hello');
  });
});

describe('normalizeAccordionItemKeys', () => {
  it('should return empty array for undefined', () => {
    expect(normalizeAccordionItemKeys(undefined, false)).toEqual([]);
    expect(normalizeAccordionItemKeys(undefined, true)).toEqual([]);
  });

  it('should wrap single value in array', () => {
    expect(normalizeAccordionItemKeys(1, false)).toEqual([1]);
    expect(normalizeAccordionItemKeys('a', false)).toEqual(['a']);
  });

  it('should deduplicate values', () => {
    expect(normalizeAccordionItemKeys([1, 1, 2], true)).toEqual([1, 2]);
  });

  it('should keep only last value when allowMultiple is false', () => {
    expect(normalizeAccordionItemKeys([1, 2, 3], false)).toEqual([3]);
  });

  it('should keep all unique values when allowMultiple is true', () => {
    expect(normalizeAccordionItemKeys([1, 2, 3], true)).toEqual([1, 2, 3]);
  });
});

describe('normalizeEncodedAccordionValues', () => {
  it('should deduplicate encoded values', () => {
    expect(normalizeEncodedAccordionValues(['n:0', 'n:0', 'n:1'], true)).toEqual(['n:0', 'n:1']);
  });

  it('should keep only last when allowMultiple is false', () => {
    expect(normalizeEncodedAccordionValues(['n:0', 'n:1', 'n:2'], false)).toEqual(['n:2']);
  });

  it('should return empty array for empty input', () => {
    expect(normalizeEncodedAccordionValues([], false)).toEqual([]);
  });
});

describe('toPublicActiveIndex', () => {
  it('should return single decoded value when allowMultiple is false', () => {
    expect(toPublicActiveIndex(['n:0'], false)).toBe(0);
    expect(toPublicActiveIndex(['s:foo'], false)).toBe('foo');
  });

  it('should return undefined when empty and allowMultiple is false', () => {
    expect(toPublicActiveIndex([], false)).toBeUndefined();
  });

  it('should return array of decoded values when allowMultiple is true', () => {
    expect(toPublicActiveIndex(['n:0', 's:foo'], true)).toEqual([0, 'foo']);
  });

  it('should return empty array when empty and allowMultiple is true', () => {
    expect(toPublicActiveIndex([], true)).toEqual([]);
  });

  it('should return last value when multiple values and allowMultiple is false', () => {
    expect(toPublicActiveIndex(['n:0', 'n:1'], false)).toBe(1);
  });
});

describe('areEncodedValueArraysEqual', () => {
  it('should return true for identical arrays', () => {
    expect(areEncodedValueArraysEqual(['n:0', 'n:1'], ['n:0', 'n:1'])).toBe(true);
  });

  it('should return false for different lengths', () => {
    expect(areEncodedValueArraysEqual(['n:0'], ['n:0', 'n:1'])).toBe(false);
  });

  it('should return false for different values', () => {
    expect(areEncodedValueArraysEqual(['n:0'], ['n:1'])).toBe(false);
  });

  it('should return true for empty arrays', () => {
    expect(areEncodedValueArraysEqual([], [])).toBe(true);
  });

  it('should be order-sensitive', () => {
    expect(areEncodedValueArraysEqual(['n:0', 'n:1'], ['n:1', 'n:0'])).toBe(false);
  });
});
