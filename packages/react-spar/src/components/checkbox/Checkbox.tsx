import { Checkbox as SparCheckbox } from '@turkish-technology/spar';
import { useCallback, useState, type FocusEvent, type KeyboardEvent, type MouseEvent, type Ref } from 'react';

import { useComponentTheme } from '../../provider';
import { renderIconSymbol } from '../../utils';
import { applyThemeDefaults, buildSlotAttrs, mergeClassNames, mergeSlotProps } from '../../customization';
// TODO(takeoff-icons): Default check / indeterminate glyphs are Lucide-sourced
// placeholders. Replace with the Takeoff icon set before the first public release.
import { PlaceholderCheck, PlaceholderRemove } from '../../utils/placeholderIcons';
import { CheckboxBase, CheckboxProvider, useCheckboxContext } from './CheckboxBase';
import type { CheckboxContentProps, CheckboxDescriptionProps, CheckboxIconProps, CheckboxIndicatorProps, CheckboxLabelProps, CheckboxProps, CheckboxValue } from './types';

type SparCheckedState = boolean | 'indeterminate';

const toSparChecked = (value: CheckboxValue): SparCheckedState => (value === null ? 'indeterminate' : value);

const fromSparChecked = (value: SparCheckedState): CheckboxValue => (value === 'indeterminate' ? null : value);

const renderDefaultIcon = (node: React.ReactNode) => renderIconSymbol(node, 'tk-checkbox-icon-symbol');

function Checkbox({ ref, ...rawProps }: CheckboxProps & { ref?: Ref<HTMLElement> }) {
  const themeConfig = useComponentTheme('Checkbox');
  const {
    value,
    defaultValue,
    indeterminate,
    onChange,
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
    children,
    className,
    classNames: instanceClassNames,
    slotProps: instanceSlotProps,
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
  const resolvedRequired = Boolean(required);

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

  const contextValue = {
    checked: isChecked,
    indeterminate: isIndeterminate,
    disabled: resolvedDisabled,
    readOnly: resolvedReadOnly,
    invalid: resolvedInvalid,
    required: resolvedRequired,
    classNames: resolvedClassNames,
    slotProps: resolvedSlotProps,
  };

  return (
    <CheckboxProvider value={contextValue}>
      <SparCheckbox
        ref={ref}
        id={id}
        checked={toSparChecked(currentValue)}
        onChange={handleChange}
        disabled={resolvedDisabled}
        readOnly={resolvedReadOnly}
        required={resolvedRequired}
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
        {children}
      </SparCheckbox>
    </CheckboxProvider>
  );
}

Checkbox.displayName = 'Checkbox';

function CheckboxIndicator({ children, className, ...rest }: CheckboxIndicatorProps) {
  const context = useCheckboxContext('Checkbox.Indicator');
  const attrs = buildSlotAttrs(CheckboxBase.getSlotProps('indicator', { 'aria-hidden': 'true', className }), context.slotProps, 'indicator', context.classNames?.indicator);
  return (
    <span {...attrs} {...rest}>
      {children ?? <CheckboxIcon />}
    </span>
  );
}
CheckboxIndicator.displayName = 'Checkbox.Indicator';

function CheckboxIcon({ children, className, ...rest }: CheckboxIconProps) {
  const context = useCheckboxContext('Checkbox.Icon');
  const attrs = buildSlotAttrs(CheckboxBase.getSlotProps('icon', { 'aria-hidden': 'true', className }), context.slotProps, 'icon', context.classNames?.icon);

  const state = { checked: context.checked, indeterminate: context.indeterminate };
  let content: React.ReactNode;
  if (typeof children === 'function') {
    content = children(state);
  } else if (children !== undefined) {
    content = children;
  } else if (context.indeterminate) {
    content = renderDefaultIcon(<PlaceholderRemove />);
  } else if (context.checked) {
    content = renderDefaultIcon(<PlaceholderCheck />);
  } else {
    content = null;
  }

  return (
    <span {...attrs} {...rest}>
      {content}
    </span>
  );
}
CheckboxIcon.displayName = 'Checkbox.Icon';

function CheckboxContent({ children, className, ...rest }: CheckboxContentProps) {
  const context = useCheckboxContext('Checkbox.Content');
  const attrs = buildSlotAttrs(CheckboxBase.getSlotProps('content', { className }), context.slotProps, 'content', context.classNames?.content);
  return (
    <span {...attrs} {...rest}>
      {children}
    </span>
  );
}
CheckboxContent.displayName = 'Checkbox.Content';

function CheckboxLabel({ children, className, ...rest }: CheckboxLabelProps) {
  const context = useCheckboxContext('Checkbox.Label');
  const attrs = buildSlotAttrs(CheckboxBase.getSlotProps('label', { className }), context.slotProps, 'label', context.classNames?.label);
  return (
    <span {...attrs} {...rest}>
      {children}
    </span>
  );
}
CheckboxLabel.displayName = 'Checkbox.Label';

function CheckboxDescription({ children, className, ...rest }: CheckboxDescriptionProps) {
  const context = useCheckboxContext('Checkbox.Description');
  const attrs = buildSlotAttrs(CheckboxBase.getSlotProps('description', { className }), context.slotProps, 'description', context.classNames?.description);
  return (
    <span {...attrs} {...rest}>
      {children}
    </span>
  );
}
CheckboxDescription.displayName = 'Checkbox.Description';

const CheckboxCompound = Object.assign(Checkbox, {
  Indicator: CheckboxIndicator,
  Icon: CheckboxIcon,
  Content: CheckboxContent,
  Label: CheckboxLabel,
  Description: CheckboxDescription,
});

export { CheckboxCompound as Checkbox };
