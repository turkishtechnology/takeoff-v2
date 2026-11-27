import { render, screen } from '@testing-library/react';
import { Field, FieldReset, useOptionalFieldContext } from '../index';

const Probe = () => {
  const field = useOptionalFieldContext();
  return <span data-testid="probe">{field ? field.labelId : 'none'}</span>;
};

describe('FieldReset', () => {
  it('hides the surrounding Field context from its subtree', () => {
    render(
      <Field id="outer">
        <FieldReset>
          <Probe />
        </FieldReset>
      </Field>,
    );
    expect(screen.getByTestId('probe')).toHaveTextContent('none');
  });

  it('leaves siblings outside the reset wired to the Field', () => {
    render(
      <Field id="outer">
        <Probe />
        <FieldReset>
          <span>inner</span>
        </FieldReset>
      </Field>,
    );
    expect(screen.getByTestId('probe')).toHaveTextContent('outer-label');
  });

  it('lets a nested Field inside the reset provide its own context', () => {
    render(
      <Field id="outer">
        <FieldReset>
          <Field id="inner">
            <Probe />
          </Field>
        </FieldReset>
      </Field>,
    );
    expect(screen.getByTestId('probe')).toHaveTextContent('inner-label');
  });

  it('renders children without a Field ancestor', () => {
    render(
      <FieldReset>
        <Probe />
      </FieldReset>,
    );
    expect(screen.getByTestId('probe')).toHaveTextContent('none');
  });
});
