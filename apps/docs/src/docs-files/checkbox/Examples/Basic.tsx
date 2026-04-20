import { useState } from 'react';
import RenderedDemo from '../../../components/RenderedDemo';
import { Checkbox, ReactSparDemoRoot } from './shared';

const code = `export function BasicCheckboxDemo() {
  const [agreed, setAgreed] = useState(false);

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Checkbox value={agreed} onChange={(next) => setAgreed(Boolean(next))}>
        <Checkbox.Indicator>
          <Checkbox.Icon />
        </Checkbox.Indicator>
        <Checkbox.Content>
          <Checkbox.Label>Accept terms of service</Checkbox.Label>
          <Checkbox.Description>
            You can still cancel up to 24 hours before departure.
          </Checkbox.Description>
        </Checkbox.Content>
      </Checkbox>
    </div>
  );
}`;

function BasicCheckboxDemo() {
  const [agreed, setAgreed] = useState(false);

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Checkbox value={agreed} onChange={next => setAgreed(Boolean(next))}>
        <Checkbox.Indicator>
          <Checkbox.Icon />
        </Checkbox.Indicator>
        <Checkbox.Content>
          <Checkbox.Label>Accept terms of service</Checkbox.Label>
          <Checkbox.Description>You can still cancel up to 24 hours before departure.</Checkbox.Description>
        </Checkbox.Content>
      </Checkbox>
    </div>
  );
}

export default function Basic() {
  return (
    <RenderedDemo code={code} previewWrapper={ReactSparDemoRoot}>
      <BasicCheckboxDemo />
    </RenderedDemo>
  );
}
