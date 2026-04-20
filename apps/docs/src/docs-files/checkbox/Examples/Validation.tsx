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
        required
        invalid={invalid}
        value={accepted}
        onChange={(next) => {
          setAccepted(Boolean(next));
          setTouched(true);
        }}
      >
        <Checkbox.Indicator>
          <Checkbox.Icon />
        </Checkbox.Indicator>
        <Checkbox.Content>
          <Checkbox.Label>I have read the fare rules</Checkbox.Label>
          {!invalid && (
            <Checkbox.Description>Required before you continue.</Checkbox.Description>
          )}
        </Checkbox.Content>
      </Checkbox>
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
        required
        invalid={invalid}
        value={accepted}
        onChange={next => {
          setAccepted(Boolean(next));
          setTouched(true);
        }}
      >
        <Checkbox.Indicator>
          <Checkbox.Icon />
        </Checkbox.Indicator>
        <Checkbox.Content>
          <Checkbox.Label>I have read the fare rules</Checkbox.Label>
          {!invalid && <Checkbox.Description>Required before you continue.</Checkbox.Description>}
        </Checkbox.Content>
      </Checkbox>
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
