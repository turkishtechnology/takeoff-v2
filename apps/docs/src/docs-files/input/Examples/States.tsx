import RenderedDemo from '../../../components/RenderedDemo';
import { Input, ReactSparDemoRoot } from './shared';

const code = `export function InputStatesDemo() {
  return (
    <div style={{ display: 'grid', gap: 16, width: 'min(100%, 28rem)' }}>
      <Input>
        <Input.Label>Default</Input.Label>
        <Input.Container>
          <Input.Field placeholder="Type here" />
        </Input.Container>
      </Input>
      <Input disabled defaultValue="Locked">
        <Input.Label>Disabled</Input.Label>
        <Input.Container>
          <Input.Field />
        </Input.Container>
      </Input>
      <Input readOnly defaultValue="View only">
        <Input.Label>Read only</Input.Label>
        <Input.Container>
          <Input.Field />
        </Input.Container>
      </Input>
      <Input size="small">
        <Input.Label>Small</Input.Label>
        <Input.Container>
          <Input.Field placeholder="Compact" />
        </Input.Container>
      </Input>
      <Input size="large">
        <Input.Label>Large</Input.Label>
        <Input.Container>
          <Input.Field placeholder="Spacious" />
        </Input.Container>
      </Input>
    </div>
  );
}`;

function InputStatesDemo() {
  return (
    <div style={{ display: 'grid', gap: 16, width: 'min(100%, 28rem)' }}>
      <Input>
        <Input.Label>Default</Input.Label>
        <Input.Container>
          <Input.Field placeholder="Type here" />
        </Input.Container>
      </Input>
      <Input disabled defaultValue="Locked">
        <Input.Label>Disabled</Input.Label>
        <Input.Container>
          <Input.Field />
        </Input.Container>
      </Input>
      <Input readOnly defaultValue="View only">
        <Input.Label>Read only</Input.Label>
        <Input.Container>
          <Input.Field />
        </Input.Container>
      </Input>
      <Input size="small">
        <Input.Label>Small</Input.Label>
        <Input.Container>
          <Input.Field placeholder="Compact" />
        </Input.Container>
      </Input>
      <Input size="large">
        <Input.Label>Large</Input.Label>
        <Input.Container>
          <Input.Field placeholder="Spacious" />
        </Input.Container>
      </Input>
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
