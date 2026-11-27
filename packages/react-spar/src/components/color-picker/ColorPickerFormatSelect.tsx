import { FieldReset } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';
import { Select } from '../select';

import { ColorPickerFormatSelectBase } from './base';
import { useColorPickerContext } from './context';
import { FORMATS } from './defaults';
import type { ColorPickerFormat, ColorPickerFormatSelectProps } from './types';

export const ColorPickerFormatSelect = (props: ColorPickerFormatSelectProps) => {
  const theme = useComponentTheme('ColorPickerFormatSelect');
  const ctx = useColorPickerContext('ColorPicker.FormatSelect');
  const { rootAttrs } = composeRootAttrs(ColorPickerFormatSelectBase, props, theme);

  return (
    <FieldReset>
      <Select
        size="small"
        value={ctx.format}
        onChange={(next: string) => ctx.setFormat(next as ColorPickerFormat)}
        disabled={ctx.disabled}
        readOnly={ctx.readOnly}
        className={rootAttrs.className}
      >
        <Select.Trigger aria-label={ctx.labels.format} />
        <Select.Content>
          {FORMATS.map(({ value, label }) => (
            <Select.Item key={value} value={value} label={label}>
              {label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </FieldReset>
  );
};

ColorPickerFormatSelect.displayName = 'ColorPicker.FormatSelect';
