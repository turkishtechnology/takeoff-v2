import { useState } from 'react';
import RenderedDemo from '../../../components/RenderedDemo';
import { Checkbox, ReactSparDemoRoot } from './shared';

const code = `export function CheckboxValidationDemo() {
  const [accepted, setAccepted] = useState(false);
  const [touched, setTouched] = useState(false);
  const invalid = touched && !accepted;

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Checkbox
        label="I have read the fare rules"
        description={invalid ? undefined : 'Required before you continue.'}
        required
        invalid={invalid}
        value={accepted}
        onChange={(next) => {
          setAccepted(Boolean(next));
          setTouched(true);
        }}
      />
    </div>
  );
}`;

function CheckboxValidationDemo() {
  const [accepted, setAccepted] = useState(false);
  const [touched, setTouched] = useState(false);
  const invalid = touched && !accepted;

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Checkbox
        label="I have read the fare rules"
        description={invalid ? undefined : 'Required before you continue.'}
        required
        invalid={invalid}
        value={accepted}
        onChange={next => {
          setAccepted(Boolean(next));
          setTouched(true);
        }}
      />
    </div>
  );
}

export default function Validation() {
  return (
    <RenderedDemo code={code} previewWrapper={ReactSparDemoRoot}>
      <CheckboxValidationDemo />
    </RenderedDemo>
  );
}
