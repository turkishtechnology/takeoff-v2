import { useState } from 'react';
import RenderedDemo from '../../../components/RenderedDemo';
import { Checkbox, ReactSparDemoRoot } from './shared';

const code = `export function BasicCheckboxDemo() {
  const [agreed, setAgreed] = useState(false);

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Checkbox
        label="Accept terms of service"
        description="You can still cancel up to 24 hours before departure."
        value={agreed}
        onChange={(next) => setAgreed(Boolean(next))}
      />
    </div>
  );
}`;

function BasicCheckboxDemo() {
  const [agreed, setAgreed] = useState(false);

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Checkbox label="Accept terms of service" description="You can still cancel up to 24 hours before departure." value={agreed} onChange={next => setAgreed(Boolean(next))} />
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
