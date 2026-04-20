import {
  Input as SparInput,
  InputField as SparInputField,
  InputLabel as SparInputLabel,
  InputDescription as SparInputDescription,
  InputErrorMessage as SparInputErrorMessage,
} from '@turkish-technology/spar';
import { useCallback, useRef, useState, type ChangeEvent, type KeyboardEvent, type MouseEvent, type ReactNode, type Ref, type SyntheticEvent } from 'react';

import { useComponentTheme } from '../../provider';
import { renderIconSymbol } from '../../utils';
import { applyThemeDefaults, buildSlotAttrs, mergeClassNames, mergeSlotProps } from '../../customization';
// TODO(takeoff-icons): Default clear-button SVG is a Lucide-sourced placeholder.
// Replace with the Takeoff icon before the first public release.
import { PlaceholderClose } from '../../utils/placeholderIcons';
import { InputBase, InputProvider, useInputContext } from './InputBase';
import type {
  InputAsteriskProps,
  InputClearButtonProps,
  InputContainerProps,
  InputDescriptionProps,
  InputErrorMessageProps,
  InputFieldProps,
  InputLabelProps,
  InputLeadingIconProps,
  InputPrefixProps,
  InputProps,
  InputSpinnerProps,
  InputSuffixProps,
  InputTrailingIconProps,
} from './types';

const renderIconNode = (icon: ReactNode) => renderIconSymbol(icon, 'tk-input-icon-symbol');

const DefaultSpinner = () => <span className="tk-input-default-spinner" data-slot="spinner-indicator" aria-hidden="true" />;

function Input({ ref, ...rawProps }: InputProps & { ref?: Ref<HTMLInputElement> }) {
  const themeConfig = useComponentTheme('Input');
  const {
    id,
    type,
    size,
    disabled,
    readOnly,
    required,
    invalid,
    clearable,
    loading,
    value,
    defaultValue,
    onChange,
    onClearClick,
    children,
    className,
    classNames: instanceClassNames,
    slotProps: instanceSlotProps,
    style,
    ...restProps
  } = InputBase.resolveProps(applyThemeDefaults(themeConfig?.defaultProps, rawProps));
  const resolvedClassNames = mergeClassNames(themeConfig?.classNames, instanceClassNames);
  const resolvedSlotProps = mergeSlotProps(themeConfig?.slotProps, instanceSlotProps);

  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<string | number | undefined>(defaultValue);
  const currentValue = isControlled ? value : uncontrolledValue;
  const fieldRef = useRef<HTMLInputElement | null>(null);

  const setFieldRef = useCallback(
    (node: HTMLInputElement | null) => {
      fieldRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref && typeof ref === 'object') {
        (ref as { current: HTMLInputElement | null }).current = node;
      }
    },
    [ref],
  );

  const resolvedLoading = Boolean(loading);
  const resolvedInvalid = Boolean(invalid);
  const resolvedDisabled = Boolean(disabled);
  const resolvedReadOnly = Boolean(readOnly);
  const resolvedRequired = Boolean(required);
  const resolvedClearable = Boolean(clearable);
  const hasValue = currentValue !== undefined && currentValue !== null && String(currentValue).length > 0;
  const showClearButton = resolvedClearable && hasValue && !resolvedDisabled && !resolvedReadOnly;
  const showSpinner = resolvedLoading && !showClearButton;

  const contextValue = {
    currentValue,
    isControlled,
    size: size ?? 'base',
    type: type ?? 'text',
    disabled: resolvedDisabled,
    readOnly: resolvedReadOnly,
    required: resolvedRequired,
    invalid: resolvedInvalid,
    clearable: resolvedClearable,
    loading: resolvedLoading,
    fieldRef: setFieldRef,
    fieldRefObject: fieldRef,
    classNames: resolvedClassNames,
    slotProps: resolvedSlotProps,
    onChange,
    onClearClick,
    setUncontrolledValue,
  };

  const rootAttrs = buildSlotAttrs(
    InputBase.getSlotProps('root', {
      className,
      'data-size': size,
    }),
    resolvedSlotProps,
    'root',
    resolvedClassNames?.root,
  );
  const { className: rootClassName, ...rootRest } = rootAttrs as { className: string; [key: string]: unknown };

  // Note: `showSpinner` and `showClearButton` are driven by context state, but
  // consumers opt into rendering via <Input.Spinner /> / <Input.ClearButton />.
  void showSpinner;

  return (
    <InputProvider value={contextValue}>
      <SparInput
        id={id}
        isInvalid={resolvedInvalid}
        disabled={resolvedDisabled}
        required={resolvedRequired}
        readOnly={resolvedReadOnly}
        style={style}
        {...restProps}
        {...rootRest}
        className={rootClassName}
      >
        {children}
      </SparInput>
    </InputProvider>
  );
}

Input.displayName = 'Input';

function InputLabel({ children, className, ...rest }: InputLabelProps) {
  const context = useInputContext('Input.Label');
  const attrs = buildSlotAttrs(InputBase.getSlotProps('label', { className }), context.slotProps, 'label', context.classNames?.label);
  const { className: labelClassName, ...labelRest } = attrs as { className: string; [key: string]: unknown };

  return (
    <SparInputLabel {...(labelRest as unknown as Record<string, unknown>)} {...rest} className={labelClassName}>
      {children}
    </SparInputLabel>
  );
}
InputLabel.displayName = 'Input.Label';

function InputAsterisk({ children, className, ...rest }: InputAsteriskProps) {
  const context = useInputContext('Input.Asterisk');
  if (!context.required) {
    return null;
  }
  const attrs = buildSlotAttrs(InputBase.getSlotProps('asterisk', { 'aria-hidden': 'true', className }), context.slotProps, 'asterisk', context.classNames?.asterisk);
  return (
    <span {...attrs} {...rest}>
      {children ?? '*'}
    </span>
  );
}
InputAsterisk.displayName = 'Input.Asterisk';

function InputContainer({ children, className, ...rest }: InputContainerProps) {
  const context = useInputContext('Input.Container');
  const hasValueAtRender = context.currentValue !== undefined && context.currentValue !== null && String(context.currentValue).length > 0;
  const showSpinner = context.loading && !(context.clearable && hasValueAtRender);

  const attrs = buildSlotAttrs(
    InputBase.getSlotProps('container', {
      className,
      'data-size': context.size,
      'data-disabled': context.disabled ? '' : undefined,
      'data-invalid': context.invalid ? '' : undefined,
      'data-readonly': context.readOnly ? '' : undefined,
      'data-loading': showSpinner ? '' : undefined,
      'data-clearable': context.clearable ? '' : undefined,
    }),
    context.slotProps,
    'container',
    context.classNames?.container,
  );

  return (
    <div {...attrs} {...rest}>
      {children}
    </div>
  );
}
InputContainer.displayName = 'Input.Container';

function InputField({ onChange: onChangeOverride, ...rest }: InputFieldProps) {
  const context = useInputContext('Input.Field');
  const attrs = buildSlotAttrs(InputBase.getSlotProps('field'), context.slotProps, 'field', context.classNames?.field);
  const { className: fieldClassName, ...fieldRest } = attrs as { className: string; [key: string]: unknown };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!context.isControlled) {
      context.setUncontrolledValue(event.target.value);
    }
    context.onChange?.(event);
    onChangeOverride?.(event);
  };

  return (
    <SparInputField
      {...rest}
      {...fieldRest}
      ref={context.fieldRef}
      type={context.type}
      className={fieldClassName}
      value={context.isControlled ? (context.currentValue ?? '') : undefined}
      defaultValue={context.isControlled ? undefined : (context.currentValue as string | number | undefined)}
      onChange={handleChange}
      data-slot="field"
    />
  );
}
InputField.displayName = 'Input.Field';

function InputLeadingIcon({ children, className, ...rest }: InputLeadingIconProps) {
  const context = useInputContext('Input.LeadingIcon');
  const attrs = buildSlotAttrs(InputBase.getSlotProps('leadingIcon', { 'aria-hidden': 'true', className }), context.slotProps, 'leadingIcon', context.classNames?.leadingIcon);
  attrs['data-slot'] = 'leading-icon';
  return (
    <span {...attrs} {...rest}>
      {renderIconNode(children)}
    </span>
  );
}
InputLeadingIcon.displayName = 'Input.LeadingIcon';

function InputTrailingIcon({ children, className, ...rest }: InputTrailingIconProps) {
  const context = useInputContext('Input.TrailingIcon');
  const attrs = buildSlotAttrs(InputBase.getSlotProps('trailingIcon', { 'aria-hidden': 'true', className }), context.slotProps, 'trailingIcon', context.classNames?.trailingIcon);
  attrs['data-slot'] = 'trailing-icon';
  return (
    <span {...attrs} {...rest}>
      {renderIconNode(children)}
    </span>
  );
}
InputTrailingIcon.displayName = 'Input.TrailingIcon';

function InputPrefix({ children, className, ...rest }: InputPrefixProps) {
  const context = useInputContext('Input.Prefix');
  const attrs = buildSlotAttrs(InputBase.getSlotProps('prefix', { className }), context.slotProps, 'prefix', context.classNames?.prefix);
  return (
    <span {...attrs} {...rest}>
      {children}
    </span>
  );
}
InputPrefix.displayName = 'Input.Prefix';

function InputSuffix({ children, className, ...rest }: InputSuffixProps) {
  const context = useInputContext('Input.Suffix');
  const attrs = buildSlotAttrs(InputBase.getSlotProps('suffix', { className }), context.slotProps, 'suffix', context.classNames?.suffix);
  return (
    <span {...attrs} {...rest}>
      {children}
    </span>
  );
}
InputSuffix.displayName = 'Input.Suffix';

function InputSpinner({ children, className, ...rest }: InputSpinnerProps) {
  const context = useInputContext('Input.Spinner');
  const hasValueAtRender = context.currentValue !== undefined && context.currentValue !== null && String(context.currentValue).length > 0;
  const showClearButton = context.clearable && hasValueAtRender && !context.disabled && !context.readOnly;
  if (!context.loading || showClearButton) {
    return null;
  }

  const attrs = buildSlotAttrs(InputBase.getSlotProps('spinner', { 'aria-hidden': 'true', className }), context.slotProps, 'spinner', context.classNames?.spinner);
  return (
    <span {...attrs} {...rest}>
      {children ?? <DefaultSpinner />}
    </span>
  );
}
InputSpinner.displayName = 'Input.Spinner';

function InputClearButton({ children, className, ...rest }: InputClearButtonProps) {
  const context = useInputContext('Input.ClearButton');
  const hasValueAtRender = context.currentValue !== undefined && context.currentValue !== null && String(context.currentValue).length > 0;
  const visible = context.clearable && hasValueAtRender && !context.disabled && !context.readOnly;
  if (!visible) {
    return null;
  }

  const attrs = buildSlotAttrs(InputBase.getSlotProps('clearButton', { className }), context.slotProps, 'clearButton', context.classNames?.clearButton);
  const iconAttrs = buildSlotAttrs(InputBase.getSlotProps('clearIcon', { 'aria-hidden': 'true' }), context.slotProps, 'clearIcon', context.classNames?.clearIcon);

  const dispatchClear = (event: SyntheticEvent<HTMLButtonElement>) => {
    if (context.disabled || context.readOnly) {
      return;
    }
    const input = context.fieldRefObject?.current;
    if (input) {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      setter?.call(input, '');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (!context.isControlled) {
      context.setUncontrolledValue('');
    }
    context.onClearClick?.(event);
  };

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dispatchClear(event);
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      dispatchClear(event);
    }
  };

  const defaultIcon = renderIconSymbol(<PlaceholderClose />, 'tk-input-clear-icon-symbol');

  return (
    <button type="button" aria-label="Clear input" {...attrs} {...rest} onClick={handleClick} onKeyDown={handleKeyDown} tabIndex={-1}>
      <span {...iconAttrs}>{children ?? defaultIcon}</span>
    </button>
  );
}
InputClearButton.displayName = 'Input.ClearButton';

function InputDescription({ children, className, ...rest }: InputDescriptionProps) {
  const context = useInputContext('Input.Description');
  if (context.invalid) {
    return null;
  }
  const attrs = buildSlotAttrs(InputBase.getSlotProps('description', { className }), context.slotProps, 'description', context.classNames?.description);
  const { className: descriptionClassName, ...descriptionRest } = attrs as { className: string; [key: string]: unknown };
  return (
    <SparInputDescription {...(descriptionRest as unknown as Record<string, unknown>)} {...rest} className={descriptionClassName}>
      {children}
    </SparInputDescription>
  );
}
InputDescription.displayName = 'Input.Description';

function InputErrorMessage({ children, className, ...rest }: InputErrorMessageProps) {
  const context = useInputContext('Input.ErrorMessage');
  if (!context.invalid) {
    return null;
  }
  const attrs = buildSlotAttrs(InputBase.getSlotProps('errorMessage', { className }), context.slotProps, 'errorMessage', context.classNames?.errorMessage);
  const { className: errorClassName, ...errorRest } = attrs as { className: string; [key: string]: unknown };
  return (
    <SparInputErrorMessage {...(errorRest as unknown as Record<string, unknown>)} {...rest} className={errorClassName}>
      {children}
    </SparInputErrorMessage>
  );
}
InputErrorMessage.displayName = 'Input.ErrorMessage';

const InputCompound = Object.assign(Input, {
  Label: InputLabel,
  Asterisk: InputAsterisk,
  Container: InputContainer,
  Field: InputField,
  LeadingIcon: InputLeadingIcon,
  TrailingIcon: InputTrailingIcon,
  Prefix: InputPrefix,
  Suffix: InputSuffix,
  Spinner: InputSpinner,
  ClearButton: InputClearButton,
  Description: InputDescription,
  ErrorMessage: InputErrorMessage,
});

export { InputCompound as Input };
