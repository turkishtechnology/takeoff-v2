import RenderedDemo from '../../../components/RenderedDemo';
import { Checkbox, ReactSparDemoRoot } from './shared';

const code = `export function CheckboxStatesDemo() {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Checkbox size="small">
        <Checkbox.Indicator>
          <Checkbox.Icon />
        </Checkbox.Indicator>
        <Checkbox.Content>
          <Checkbox.Label>Default</Checkbox.Label>
          <Checkbox.Description>Uncontrolled, small</Checkbox.Description>
        </Checkbox.Content>
      </Checkbox>
      <Checkbox defaultValue={true}>
        <Checkbox.Indicator>
          <Checkbox.Icon />
        </Checkbox.Indicator>
        <Checkbox.Content>
          <Checkbox.Label>Checked</Checkbox.Label>
        </Checkbox.Content>
      </Checkbox>
      <Checkbox indeterminate>
        <Checkbox.Indicator>
          <Checkbox.Icon />
        </Checkbox.Indicator>
        <Checkbox.Content>
          <Checkbox.Label>Indeterminate</Checkbox.Label>
        </Checkbox.Content>
      </Checkbox>
      <Checkbox disabled defaultValue={true}>
        <Checkbox.Indicator>
          <Checkbox.Icon />
        </Checkbox.Indicator>
        <Checkbox.Content>
          <Checkbox.Label>Disabled</Checkbox.Label>
        </Checkbox.Content>
      </Checkbox>
      <Checkbox readOnly defaultValue={true}>
        <Checkbox.Indicator>
          <Checkbox.Icon />
        </Checkbox.Indicator>
        <Checkbox.Content>
          <Checkbox.Label>Read only</Checkbox.Label>
        </Checkbox.Content>
      </Checkbox>
      <Checkbox type="card" defaultValue={true}>
        <Checkbox.Indicator>
          <Checkbox.Icon />
        </Checkbox.Indicator>
        <Checkbox.Content>
          <Checkbox.Label>Card variant</Checkbox.Label>
        </Checkbox.Content>
      </Checkbox>
    </div>
  );
}`;

function CheckboxStatesDemo() {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Checkbox size="small">
        <Checkbox.Indicator>
          <Checkbox.Icon />
        </Checkbox.Indicator>
        <Checkbox.Content>
          <Checkbox.Label>Default</Checkbox.Label>
          <Checkbox.Description>Uncontrolled, small</Checkbox.Description>
        </Checkbox.Content>
      </Checkbox>
      <Checkbox defaultValue={true}>
        <Checkbox.Indicator>
          <Checkbox.Icon />
        </Checkbox.Indicator>
        <Checkbox.Content>
          <Checkbox.Label>Checked</Checkbox.Label>
        </Checkbox.Content>
      </Checkbox>
      <Checkbox indeterminate>
        <Checkbox.Indicator>
          <Checkbox.Icon />
        </Checkbox.Indicator>
        <Checkbox.Content>
          <Checkbox.Label>Indeterminate</Checkbox.Label>
        </Checkbox.Content>
      </Checkbox>
      <Checkbox disabled defaultValue={true}>
        <Checkbox.Indicator>
          <Checkbox.Icon />
        </Checkbox.Indicator>
        <Checkbox.Content>
          <Checkbox.Label>Disabled</Checkbox.Label>
        </Checkbox.Content>
      </Checkbox>
      <Checkbox readOnly defaultValue={true}>
        <Checkbox.Indicator>
          <Checkbox.Icon />
        </Checkbox.Indicator>
        <Checkbox.Content>
          <Checkbox.Label>Read only</Checkbox.Label>
        </Checkbox.Content>
      </Checkbox>
      <Checkbox type="card" defaultValue={true}>
        <Checkbox.Indicator>
          <Checkbox.Icon />
        </Checkbox.Indicator>
        <Checkbox.Content>
          <Checkbox.Label>Card variant</Checkbox.Label>
        </Checkbox.Content>
      </Checkbox>
    </div>
  );
}

export default function States() {
  return (
    <RenderedDemo code={code} previewWrapper={ReactSparDemoRoot}>
      <CheckboxStatesDemo />
    </RenderedDemo>
  );
}
