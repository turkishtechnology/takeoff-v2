import { useState } from 'react';
import RenderedDemo from '../../../components/RenderedDemo';
import { Input, ReactSparDemoRoot } from './shared';

const code = `export function BasicInputDemo() {
  const [value, setValue] = useState('');

  return (
    <div style={{ display: 'grid', gap: 16, width: 'min(100%, 28rem)' }}>
      <Input
        label="Full name"
        required
        placeholder="Ada Lovelace"
        description="Written exactly as it appears on your passport."
        value={value}
        onChange={(event) => setValue(event.target.value)}
        clearable
      />
    </div>
  );
}`;

function BasicInputDemo() {
  const [value, setValue] = useState('');

  return (
    <div style={{ display: 'grid', gap: 16, width: 'min(100%, 28rem)' }}>
      <Input
        label="Full name"
        required
        placeholder="Ada Lovelace"
        description="Written exactly as it appears on your passport."
        value={value}
        onChange={event => setValue(event.target.value)}
        clearable
      />
    </div>
  );
}

export default function Basic() {
  return (
    <RenderedDemo code={code} previewWrapper={ReactSparDemoRoot}>
      <BasicInputDemo />
    </RenderedDemo>
  );
}
