import RenderedDemo from '../../../components/RenderedDemo';
import { Checkbox, ReactSparDemoRoot } from './shared';

const code = `export function CheckboxStatesDemo() {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Checkbox label="Default" description="Uncontrolled, small" size="small" />
      <Checkbox label="Checked" defaultValue={true} />
      <Checkbox label="Indeterminate" indeterminate />
      <Checkbox label="Disabled" disabled defaultValue={true} />
      <Checkbox label="Read only" readOnly defaultValue={true} />
      <Checkbox label="Card variant" type="card" defaultValue={true} />
    </div>
  );
}`;

function CheckboxStatesDemo() {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Checkbox label="Default" description="Uncontrolled, small" size="small" />
      <Checkbox label="Checked" defaultValue={true} />
      <Checkbox label="Indeterminate" indeterminate />
      <Checkbox label="Disabled" disabled defaultValue={true} />
      <Checkbox label="Read only" readOnly defaultValue={true} />
      <Checkbox label="Card variant" type="card" defaultValue={true} />
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
