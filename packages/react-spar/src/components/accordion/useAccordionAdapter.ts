import { Children, cloneElement, isValidElement, useEffect, useMemo, useRef, useState, type ReactElement, type ReactNode } from 'react';

import { decodeAccordionItemValue, encodeAccordionItemValue, type AccordionAdapterContextValue, type AccordionItemKey } from './AccordionBase';
import type { AccordionArrowPosition, AccordionItemProps, AccordionMode, AccordionProps, AccordionType } from './types';

const dedupeValues = <T extends AccordionItemKey | string>(values: T[]): T[] => {
  const seen = new Set<T>();

  return values.filter(value => {
    if (seen.has(value)) {
      return false;
    }

    seen.add(value);
    return true;
  });
};

export const normalizeAccordionItemKeys = (value: AccordionItemKey | AccordionItemKey[] | undefined, allowMultiple: boolean): AccordionItemKey[] => {
  if (value === undefined) {
    return [];
  }

  const values = dedupeValues(Array.isArray(value) ? value : [value]);

  if (allowMultiple) {
    return values;
  }

  const lastValue = values[values.length - 1];
  return lastValue !== undefined ? [lastValue] : [];
};

export const normalizeEncodedAccordionValues = (values: string[], allowMultiple: boolean): string[] => {
  const uniqueValues = dedupeValues(values);

  if (allowMultiple) {
    return uniqueValues;
  }

  const lastValue = uniqueValues[uniqueValues.length - 1];
  return lastValue !== undefined ? [lastValue] : [];
};

export const toPublicActiveIndex = (values: string[], allowMultiple: boolean): AccordionItemKey | AccordionItemKey[] | undefined => {
  const decodedValues = values.map(decodeAccordionItemValue);

  if (allowMultiple) {
    return decodedValues;
  }

  return decodedValues[decodedValues.length - 1];
};

export const areEncodedValueArraysEqual = (left: string[], right: string[]): boolean => {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
};

interface AccordionItemDescriptor {
  encodedValue: string;
  originalValue: AccordionItemKey;
  active: boolean | undefined;
  onActiveChange: AccordionItemProps['onActiveChange'];
}

interface InternalAccordionItemProps extends AccordionItemProps {
  __tkAccordionValue?: string;
}

interface UseAccordionAdapterOptions {
  children: ReactNode;
  controlledActiveIndex: AccordionProps['activeIndex'];
  defaultActiveIndex: AccordionProps['defaultActiveIndex'];
  allowMultiple: boolean;
  onActiveIndexChange: AccordionProps['onActiveIndexChange'];
  type: AccordionType;
  mode: AccordionMode;
  arrowPosition: AccordionArrowPosition;
  expandIcon: ReactNode;
  collapseIcon: ReactNode;
  hideArrows: boolean;
}

interface UseAccordionAdapterResult {
  processedChildren: ReactNode;
  adapterContext: AccordionAdapterContextValue;
  sparValue: string | string[];
  handleValueChange: (nextValue: string | string[]) => void;
}

const buildActivePropSignature = (itemDescriptors: AccordionItemDescriptor[]) =>
  itemDescriptors
    .filter(itemDescriptor => itemDescriptor.active !== undefined)
    .map(itemDescriptor => `${itemDescriptor.encodedValue}:${itemDescriptor.active ? '1' : '0'}`)
    .join('|');

export const useAccordionAdapter = ({
  children,
  controlledActiveIndex,
  defaultActiveIndex,
  allowMultiple,
  onActiveIndexChange,
  type,
  mode,
  arrowPosition,
  expandIcon,
  collapseIcon,
  hideArrows,
}: UseAccordionAdapterOptions): UseAccordionAdapterResult => {
  const { itemDescriptors, processedChildren } = useMemo(() => {
    let itemIndex = 0;
    const descriptors: AccordionItemDescriptor[] = [];

    const resolvedChildren = Children.map(children, child => {
      if (!isValidElement(child) || typeof child.type === 'symbol') {
        return child;
      }

      const childProps = child.props as AccordionItemProps;
      const originalValue = childProps.itemKey ?? itemIndex;
      const encodedValue = encodeAccordionItemValue(originalValue);

      descriptors.push({
        encodedValue,
        originalValue,
        active: childProps.active,
        onActiveChange: childProps.onActiveChange,
      });

      itemIndex += 1;

      return cloneElement(child as ReactElement<InternalAccordionItemProps>, {
        __tkAccordionValue: encodedValue,
      });
    });

    return {
      itemDescriptors: descriptors,
      processedChildren: resolvedChildren,
    };
  }, [children]);

  const itemDescriptorMap = useMemo(() => new Map(itemDescriptors.map(itemDescriptor => [itemDescriptor.encodedValue, itemDescriptor])), [itemDescriptors]);

  const activeValuesFromItems = useMemo(
    () =>
      normalizeEncodedAccordionValues(
        itemDescriptors.filter(itemDescriptor => itemDescriptor.active).map(itemDescriptor => itemDescriptor.encodedValue),
        allowMultiple,
      ),
    [allowMultiple, itemDescriptors],
  );

  const controlledValues = useMemo(
    () => normalizeAccordionItemKeys(controlledActiveIndex, allowMultiple).map(activeKey => encodeAccordionItemValue(activeKey)),
    [allowMultiple, controlledActiveIndex],
  );

  const [internalOpenValues, setInternalOpenValues] = useState<string[]>(() => {
    const defaultValues =
      defaultActiveIndex !== undefined
        ? normalizeAccordionItemKeys(defaultActiveIndex, allowMultiple).map(activeKey => encodeAccordionItemValue(activeKey))
        : activeValuesFromItems;

    return normalizeEncodedAccordionValues(defaultValues, allowMultiple);
  });

  const controlledMode = controlledActiveIndex !== undefined;
  const activePropSignature = useMemo(() => buildActivePropSignature(itemDescriptors), [itemDescriptors]);
  const previousActivePropSignatureRef = useRef(activePropSignature);

  useEffect(() => {
    if (controlledMode) {
      previousActivePropSignatureRef.current = activePropSignature;
      return;
    }

    setInternalOpenValues(previousOpenValues => {
      const nextOpenValues = normalizeEncodedAccordionValues(
        previousOpenValues.filter(openValue => itemDescriptorMap.has(openValue)),
        allowMultiple,
      );

      return areEncodedValueArraysEqual(previousOpenValues, nextOpenValues) ? previousOpenValues : nextOpenValues;
    });
  }, [allowMultiple, controlledMode, itemDescriptorMap]);

  useEffect(() => {
    if (controlledMode) {
      previousActivePropSignatureRef.current = activePropSignature;
      return;
    }

    if (previousActivePropSignatureRef.current === activePropSignature) {
      return;
    }

    previousActivePropSignatureRef.current = activePropSignature;

    setInternalOpenValues(previousOpenValues => {
      const explicitActiveValues = new Set(itemDescriptors.filter(itemDescriptor => itemDescriptor.active !== undefined).map(itemDescriptor => itemDescriptor.encodedValue));
      const nextExplicitOpenValues = new Set(itemDescriptors.filter(itemDescriptor => itemDescriptor.active).map(itemDescriptor => itemDescriptor.encodedValue));
      const mergedOpenValues = itemDescriptors
        .filter(
          itemDescriptor =>
            nextExplicitOpenValues.has(itemDescriptor.encodedValue) ||
            (!explicitActiveValues.has(itemDescriptor.encodedValue) && previousOpenValues.includes(itemDescriptor.encodedValue)),
        )
        .map(itemDescriptor => itemDescriptor.encodedValue);
      const nextOpenValues = normalizeEncodedAccordionValues(mergedOpenValues, allowMultiple);

      return areEncodedValueArraysEqual(previousOpenValues, nextOpenValues) ? previousOpenValues : nextOpenValues;
    });
  }, [activePropSignature, allowMultiple, controlledMode, itemDescriptors]);

  const openItemValues = controlledMode ? controlledValues : internalOpenValues;
  const openItemValueSet = useMemo(() => new Set(openItemValues), [openItemValues]);
  const sparValue = allowMultiple ? openItemValues : (openItemValues[0] ?? '');

  const handleValueChange = (nextValue: string | string[]) => {
    const nextOpenValues = normalizeEncodedAccordionValues(Array.isArray(nextValue) ? nextValue : nextValue ? [nextValue] : [], allowMultiple);
    const previousOpenValueSet = new Set(openItemValues);
    const nextOpenValueSet = new Set(nextOpenValues);

    itemDescriptors.forEach(itemDescriptor => {
      if (previousOpenValueSet.has(itemDescriptor.encodedValue) === nextOpenValueSet.has(itemDescriptor.encodedValue)) {
        return;
      }

      itemDescriptor.onActiveChange?.(nextOpenValueSet.has(itemDescriptor.encodedValue));
    });

    onActiveIndexChange?.(toPublicActiveIndex(nextOpenValues, allowMultiple));

    if (!controlledMode) {
      setInternalOpenValues(nextOpenValues);
    }
  };

  const adapterContext = useMemo(
    () => ({
      openItemValues: openItemValueSet,
      type,
      mode,
      arrowPosition,
      expandIcon,
      collapseIcon,
      hideArrows,
    }),
    [arrowPosition, collapseIcon, expandIcon, hideArrows, mode, openItemValueSet, type],
  );

  return {
    processedChildren,
    adapterContext,
    sparValue,
    handleValueChange,
  };
};
