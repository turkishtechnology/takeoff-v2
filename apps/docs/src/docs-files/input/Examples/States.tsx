import RenderedDemo from '../../../components/RenderedDemo';
import { Input, ReactSparDemoRoot } from './shared';

const code = `export function InputStatesDemo() {
  return (
    <div style={{ display: 'grid', gap: 16, width: 'min(100%, 28rem)' }}>
      <Input label="Default" placeholder="Type here" />
      <Input label="Disabled" disabled defaultValue="Locked" />
      <Input label="Read only" readOnly defaultValue="View only" />
      <Input label="Small" size="small" placeholder="Compact" />
      <Input label="Large" size="large" placeholder="Spacious" />
    </div>
  );
}`;

function InputStatesDemo() {
  return (
    <div style={{ display: 'grid', gap: 16, width: 'min(100%, 28rem)' }}>
      <Input label="Default" placeholder="Type here" />
      <Input label="Disabled" disabled defaultValue="Locked" />
      <Input label="Read only" readOnly defaultValue="View only" />
      <Input label="Small" size="small" placeholder="Compact" />
      <Input label="Large" size="large" placeholder="Spacious" />
    </div>
  );
}

export default function States() {
  return (
    <RenderedDemo code={code} previewWrapper={ReactSparDemoRoot}>
      <InputStatesDemo />
    </RenderedDemo>
  );
}
