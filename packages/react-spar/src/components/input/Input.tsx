import {
  Input as SparInput,
  InputField as SparInputField,
  InputLabel as SparInputLabel,
  InputDescription as SparInputDescription,
  InputErrorMessage as SparInputErrorMessage,
} from '@turkish-technology/spar';
import { clsx } from 'clsx';
import { useCallback, useRef, useState, type ChangeEvent, type KeyboardEvent, type MouseEvent, type ReactNode, type Ref, type SyntheticEvent } from 'react';

import { useComponentTheme } from '../../provider';
import { renderIconSymbol } from '../../utils';
import { applyThemeDefaults, buildSlotAttrs, mergeClassNames, mergeSlotProps } from '../../customization';
// TODO(takeoff-icons): Default clear-button SVG is a Lucide-sourced placeholder.
// Replace with the Takeoff icon (currently `close` in takeoff-ui) before the
// first public release.
import { PlaceholderClose } from '../../utils/placeholderIcons';
import { InputBase } from './InputBase';
import type { InputDescriptionPartProps, InputLabelPartProps, InputErrorMessagePartProps, InputProps } from './types';

const hasContent = (value: ReactNode): boolean => {
  if (value === null || value === undefined || value === false) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.some(hasContent);
  }

  return true;
};

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
    label,
    description,
    error,
    icon,
    iconPosition,
    leadingIcon,
    trailingIcon,
    prefix,
    suffix,
    spinner,
    className,
    classNames: instanceClassNames,
    slotProps: instanceSlotProps,
    renderLeadingIcon,
    renderTrailingIcon,
    renderSpinner,
    renderClearIcon,
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

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setUncontrolledValue(event.target.value);
    }
    onChange?.(event);
  };

  const dispatchClear = (event: SyntheticEvent<HTMLButtonElement>) => {
    if (disabled || readOnly) {
      return;
    }

    const input = fieldRef.current;
    if (input) {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      setter?.call(input, '');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (!isControlled) {
      setUncontrolledValue('');
    }

    onClearClick?.(event);
  };

  const handleClearClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dispatchClear(event);
  };

  const handleClearKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      dispatchClear(event);
    }
  };

  const resolvedLoading = Boolean(loading);
  const resolvedInvalid = Boolean(invalid);
  const resolvedDisabled = Boolean(disabled);
  const resolvedReadOnly = Boolean(readOnly);
  const resolvedRequired = Boolean(required);
  const hasLabel = hasContent(label);
  const hasDescription = hasContent(description);
  const hasError = hasContent(error);
  const hasPrefix = hasContent(prefix);
  const hasSuffix = hasContent(suffix);
  const resolvedLeadingIconNode = hasContent(leadingIcon) ? leadingIcon : iconPosition === 'left' ? icon : null;
  const resolvedTrailingIconNode = hasContent(trailingIcon) ? trailingIcon : iconPosition === 'right' ? icon : null;
  const hasValue = currentValue !== undefined && currentValue !== null && String(currentValue).length > 0;
  const showClearButton = Boolean(clearable) && hasValue && !resolvedDisabled && !resolvedReadOnly;
  const showSpinner = resolvedLoading && !showClearButton;

  const buildIconSlot = (slotKey: 'leadingIcon' | 'trailingIcon', node: ReactNode, renderOverride: ((defaultIcon: ReactNode) => ReactNode) | undefined) => {
    if (!hasContent(node)) {
      return null;
    }

    const dataSlot = slotKey === 'leadingIcon' ? 'leading-icon' : 'trailing-icon';
    const attrs = buildSlotAttrs(InputBase.getSlotProps(slotKey, { 'aria-hidden': 'true' }), resolvedSlotProps, slotKey, resolvedClassNames?.[slotKey]);
    attrs['data-slot'] = dataSlot;

    const defaultNode = renderIconNode(node);
    const content = renderOverride ? renderOverride(defaultNode) : defaultNode;

    return <span {...attrs}>{content}</span>;
  };

  const leadingIconNode = buildIconSlot('leadingIcon', resolvedLeadingIconNode, renderLeadingIcon);
  const trailingIconNode = buildIconSlot('trailingIcon', resolvedTrailingIconNode, renderTrailingIcon);

  const prefixNode = hasPrefix ? <span {...buildSlotAttrs(InputBase.getSlotProps('prefix'), resolvedSlotProps, 'prefix', resolvedClassNames?.prefix)}>{prefix}</span> : null;

  const suffixNode = hasSuffix ? <span {...buildSlotAttrs(InputBase.getSlotProps('suffix'), resolvedSlotProps, 'suffix', resolvedClassNames?.suffix)}>{suffix}</span> : null;

  const spinnerNode = (() => {
    if (!showSpinner) {
      return null;
    }

    const attrs = buildSlotAttrs(InputBase.getSlotProps('spinner', { 'aria-hidden': 'true' }), resolvedSlotProps, 'spinner', resolvedClassNames?.spinner);
    const defaultNode = hasContent(spinner) ? spinner : <DefaultSpinner />;
    const content = renderSpinner ? renderSpinner(defaultNode) : defaultNode;

    return <span {...attrs}>{content}</span>;
  })();

  const clearButtonNode = (() => {
    if (!showClearButton) {
      return null;
    }

    const attrs = buildSlotAttrs(InputBase.getSlotProps('clearButton'), resolvedSlotProps, 'clearButton', resolvedClassNames?.clearButton);
    const iconAttrs = buildSlotAttrs(InputBase.getSlotProps('clearIcon', { 'aria-hidden': 'true' }), resolvedSlotProps, 'clearIcon', resolvedClassNames?.clearIcon);
    // TODO(takeoff-icons): Replace placeholder close SVG with Takeoff icon.
    const defaultIconContent = renderIconSymbol(<PlaceholderClose />, 'tk-input-clear-icon-symbol');
    const iconContent = renderClearIcon ? renderClearIcon(defaultIconContent) : defaultIconContent;

    return (
      <button type="button" aria-label="Clear input" {...attrs} onClick={handleClearClick} onKeyDown={handleClearKeyDown} tabIndex={-1}>
        <span {...iconAttrs}>{iconContent}</span>
      </button>
    );
  })();

  const labelAttrs = buildSlotAttrs(InputBase.getSlotProps('label'), resolvedSlotProps, 'label', resolvedClassNames?.label);
  const { className: labelClassName, ...labelRest } = labelAttrs as { className: string; [key: string]: unknown };
  const asteriskAttrs = buildSlotAttrs(InputBase.getSlotProps('asterisk', { 'aria-hidden': 'true' }), resolvedSlotProps, 'asterisk', resolvedClassNames?.asterisk);
  const containerAttrs = buildSlotAttrs(
    InputBase.getSlotProps('container', {
      'data-size': size,
      'data-disabled': resolvedDisabled ? '' : undefined,
      'data-invalid': resolvedInvalid ? '' : undefined,
      'data-readonly': resolvedReadOnly ? '' : undefined,
      'data-loading': showSpinner ? '' : undefined,
      'data-clearable': clearable ? '' : undefined,
    }),
    resolvedSlotProps,
    'container',
    resolvedClassNames?.container,
  );
  const fieldAttrs = buildSlotAttrs(InputBase.getSlotProps('field'), resolvedSlotProps, 'field', resolvedClassNames?.field);
  const { className: fieldClassName, ...fieldRest } = fieldAttrs as { className: string; [key: string]: unknown };
  const descriptionAttrs = buildSlotAttrs(InputBase.getSlotProps('description'), resolvedSlotProps, 'description', resolvedClassNames?.description);
  const { className: descriptionClassName, ...descriptionRest } = descriptionAttrs as { className: string; [key: string]: unknown };
  const errorAttrs = buildSlotAttrs(InputBase.getSlotProps('errorMessage'), resolvedSlotProps, 'errorMessage', resolvedClassNames?.errorMessage);
  const { className: errorClassName, ...errorRest } = errorAttrs as { className: string; [key: string]: unknown };
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

  return (
    <SparInput
      id={id}
      isInvalid={resolvedInvalid}
      disabled={resolvedDisabled}
      required={resolvedRequired}
      readOnly={resolvedReadOnly}
      style={style}
      {...rootRest}
      className={rootClassName}
    >
      {hasLabel ? (
        <SparInputLabel {...labelRest} className={labelClassName}>
          {label}
          {resolvedRequired ? <span {...asteriskAttrs}>*</span> : null}
        </SparInputLabel>
      ) : null}
      <div {...containerAttrs}>
        {prefixNode}
        {leadingIconNode}
        <SparInputField
          {...restProps}
          {...fieldRest}
          ref={setFieldRef}
          type={type}
          className={fieldClassName}
          value={isControlled ? (value ?? '') : undefined}
          defaultValue={isControlled ? undefined : defaultValue}
          onChange={handleChange}
          data-slot="field"
        />
        {trailingIconNode}
        {spinnerNode}
        {clearButtonNode}
        {suffixNode}
      </div>
      {hasError && resolvedInvalid ? (
        <SparInputErrorMessage {...errorRest} className={clsx(errorClassName)}>
          {error}
        </SparInputErrorMessage>
      ) : hasDescription ? (
        <SparInputDescription {...descriptionRest} className={descriptionClassName}>
          {description}
        </SparInputDescription>
      ) : null}
    </SparInput>
  );
}

Input.displayName = 'Input';

const InputLabelPart = ({ children, className }: InputLabelPartProps) => <SparInputLabel {...InputBase.getSlotProps('label', { className })}>{children}</SparInputLabel>;
InputLabelPart.displayName = 'Input.Label';

const InputDescriptionPart = ({ children, className }: InputDescriptionPartProps) => (
  <SparInputDescription {...InputBase.getSlotProps('description', { className })}>{children}</SparInputDescription>
);
InputDescriptionPart.displayName = 'Input.Description';

const InputErrorMessagePart = ({ children, className }: InputErrorMessagePartProps) => (
  <SparInputErrorMessage {...InputBase.getSlotProps('errorMessage', { className })}>{children}</SparInputErrorMessage>
);
InputErrorMessagePart.displayName = 'Input.ErrorMessage';

const InputCompound = Object.assign(Input, {
  Label: InputLabelPart,
  Description: InputDescriptionPart,
  ErrorMessage: InputErrorMessagePart,
});

export { InputCompound as Input };
