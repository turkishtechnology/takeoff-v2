import { useState } from 'react';
import RenderedDemo from '../../../components/RenderedDemo';
import { Input, ReactSparDemoRoot } from './shared';

const code = `export function BasicInputDemo() {
  const [value, setValue] = useState('');

  return (
    <div style={{ display: 'grid', gap: 16, width: 'min(100%, 28rem)' }}>
      <Input
        required
        value={value}
        onChange={(event) => setValue(event.target.value)}
        clearable
      >
        <Input.Label>
          Full name <Input.Asterisk />
        </Input.Label>
        <Input.Container>
          <Input.Field placeholder="Ada Lovelace" />
          <Input.ClearButton />
        </Input.Container>
        <Input.Description>Written exactly as it appears on your passport.</Input.Description>
      </Input>
    </div>
  );
}`;

function BasicInputDemo() {
  const [value, setValue] = useState('');

  return (
    <div style={{ display: 'grid', gap: 16, width: 'min(100%, 28rem)' }}>
      <Input required value={value} onChange={event => setValue(event.target.value)} clearable>
        <Input.Label>
          Full name <Input.Asterisk />
        </Input.Label>
        <Input.Container>
          <Input.Field placeholder="Ada Lovelace" />
          <Input.ClearButton />
        </Input.Container>
        <Input.Description>Written exactly as it appears on your passport.</Input.Description>
      </Input>
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
