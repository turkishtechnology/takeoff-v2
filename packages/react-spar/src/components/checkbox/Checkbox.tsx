import { Checkbox as SparCheckbox } from '@turkish-technology/spar';
import { useCallback, useState, type FocusEvent, type KeyboardEvent, type MouseEvent, type ReactNode, type Ref } from 'react';

import { useComponentTheme } from '../../provider';
import { renderIconSymbol } from '../../utils';
import { applyThemeDefaults, buildSlotAttrs, mergeClassNames, mergeSlotProps } from '../../customization';
// TODO(takeoff-icons): Default check / indeterminate glyphs are Lucide-sourced
// placeholders. Replace with the Takeoff icon set (`check` and `remove` in
// takeoff-ui) before the first public release.
import { PlaceholderCheck, PlaceholderRemove } from '../../utils/placeholderIcons';
import { CheckboxBase } from './CheckboxBase';
import type { CheckboxProps, CheckboxValue } from './types';

type SparCheckedState = boolean | 'indeterminate';

const toSparChecked = (value: CheckboxValue): SparCheckedState => (value === null ? 'indeterminate' : value);

const fromSparChecked = (value: SparCheckedState): CheckboxValue => (value === 'indeterminate' ? null : value);

const renderDefaultIcon = (node: ReactNode) => renderIconSymbol(node, 'tk-checkbox-icon-symbol');

export function Checkbox({ ref, ...rawProps }: CheckboxProps & { ref?: Ref<HTMLElement> }) {
  const themeConfig = useComponentTheme('Checkbox');
  const {
    value,
    defaultValue,
    indeterminate,
    onChange,
    label,
    description,
    size,
    type,
    disabled,
    readOnly,
    required,
    invalid,
    name,
    formValue,
    form,
    autoFocus,
    tabIndex,
    id,
    className,
    classNames: instanceClassNames,
    slotProps: instanceSlotProps,
    renderIcon,
    onFocus,
    onBlur,
    onClick,
    onKeyDown,
  } = CheckboxBase.resolveProps(applyThemeDefaults(themeConfig?.defaultProps, rawProps));

  const resolvedClassNames = mergeClassNames(themeConfig?.classNames, instanceClassNames);
  const resolvedSlotProps = mergeSlotProps(themeConfig?.slotProps, instanceSlotProps);

  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<CheckboxValue>(defaultValue !== undefined ? defaultValue : false);
  const currentValue: CheckboxValue = indeterminate ? null : isControlled ? (value as CheckboxValue) : uncontrolledValue;

  const handleChange = useCallback(
    (nextChecked: SparCheckedState) => {
      const nextValue = fromSparChecked(nextChecked);
      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }
      onChange?.(nextValue);
    },
    [isControlled, onChange],
  );

  const handleClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      onClick?.(event);
    },
    [onClick],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      onKeyDown?.(event);
    },
    [onKeyDown],
  );

  const handleFocus = useCallback(
    (event: FocusEvent<HTMLElement>) => {
      onFocus?.(event);
    },
    [onFocus],
  );

  const handleBlur = useCallback(
    (event: FocusEvent<HTMLElement>) => {
      onBlur?.(event);
    },
    [onBlur],
  );

  const isChecked = currentValue === true;
  const isIndeterminate = currentValue === null;
  const resolvedDisabled = Boolean(disabled);
  const resolvedReadOnly = Boolean(readOnly);
  const resolvedInvalid = Boolean(invalid);
  const hasLabel = label !== undefined && label !== null && label !== false && label !== '';
  const hasDescription = description !== undefined && description !== null && description !== false && description !== '';

  const indicatorAttrs = buildSlotAttrs(CheckboxBase.getSlotProps('indicator', { 'aria-hidden': 'true' }), resolvedSlotProps, 'indicator', resolvedClassNames?.indicator);
  const iconAttrs = buildSlotAttrs(CheckboxBase.getSlotProps('icon', { 'aria-hidden': 'true' }), resolvedSlotProps, 'icon', resolvedClassNames?.icon);
  const textAttrs = buildSlotAttrs(CheckboxBase.getSlotProps('text'), resolvedSlotProps, 'text', resolvedClassNames?.text);
  const labelAttrs = buildSlotAttrs(CheckboxBase.getSlotProps('label'), resolvedSlotProps, 'label', resolvedClassNames?.label);
  const descriptionAttrs = buildSlotAttrs(CheckboxBase.getSlotProps('description'), resolvedSlotProps, 'description', resolvedClassNames?.description);

  const rootSlotAttrs = buildSlotAttrs(
    CheckboxBase.getSlotProps('root', {
      className,
      'data-size': size,
      'data-type': type,
      'data-invalid': resolvedInvalid ? '' : undefined,
    }),
    resolvedSlotProps,
    'root',
    resolvedClassNames?.root,
  );

  const iconNode = (() => {
    const state = { checked: isChecked, indeterminate: isIndeterminate };
    if (renderIcon) {
      return renderIcon(state);
    }
    if (isIndeterminate) {
      return renderDefaultIcon(<PlaceholderRemove />);
    }
    if (isChecked) {
      return renderDefaultIcon(<PlaceholderCheck />);
    }
    return null;
  })();

  return (
    <SparCheckbox
      ref={ref}
      id={id}
      checked={toSparChecked(currentValue)}
      onChange={handleChange}
      disabled={resolvedDisabled}
      readOnly={resolvedReadOnly}
      required={required}
      name={name}
      value={formValue}
      form={form}
      autoFocus={autoFocus}
      tabIndex={tabIndex}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...rootSlotAttrs}
    >
      <span {...indicatorAttrs}>
        <span {...iconAttrs}>{iconNode}</span>
      </span>
      {(hasLabel || hasDescription) && (
        <span {...textAttrs}>
          {hasLabel ? <span {...labelAttrs}>{label}</span> : null}
          {hasDescription ? <span {...descriptionAttrs}>{description}</span> : null}
        </span>
      )}
    </SparCheckbox>
  );
}

Checkbox.displayName = 'Checkbox';
