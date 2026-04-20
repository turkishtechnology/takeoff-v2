import RenderedDemo from '../../../components/RenderedDemo';
import { Button, ReactSparDemoRoot } from './shared';

const code = `export function VariantDemo() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
      <Button variant="primary"><Button.Label>Primary</Button.Label></Button>
      <Button variant="secondary"><Button.Label>Secondary</Button.Label></Button>
      <Button variant="success"><Button.Label>Success</Button.Label></Button>
      <Button variant="warning"><Button.Label>Warning</Button.Label></Button>
      <Button variant="danger"><Button.Label>Danger</Button.Label></Button>
      <Button variant="neutral"><Button.Label>Neutral</Button.Label></Button>
    </div>
  );
}`;

function VariantDemo() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
      <Button variant="primary">
        <Button.Label>Primary</Button.Label>
      </Button>
      <Button variant="secondary">
        <Button.Label>Secondary</Button.Label>
      </Button>
      <Button variant="success">
        <Button.Label>Success</Button.Label>
      </Button>
      <Button variant="warning">
        <Button.Label>Warning</Button.Label>
      </Button>
      <Button variant="danger">
        <Button.Label>Danger</Button.Label>
      </Button>
      <Button variant="neutral">
        <Button.Label>Neutral</Button.Label>
      </Button>
    </div>
  );
}

export default function Variant() {
  return (
    <RenderedDemo code={code} previewWrapper={ReactSparDemoRoot}>
      <VariantDemo />
    </RenderedDemo>
  );
}
