import RenderedDemo from '../../../components/RenderedDemo';
import { Accordion, ReactSparDemoRoot } from './shared';

const code = `export function AllowMultipleDemo() {
  return (
    <div style={{ width: 'min(100%, 40rem)' }}>
      <Accordion allowMultiple>
        <Accordion.Item>
          <Accordion.Header>
            <Accordion.Title>Panel 1</Accordion.Title>
            <Accordion.Arrow />
          </Accordion.Header>
          <Accordion.Content>Panel 1 Content</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item>
          <Accordion.Header>
            <Accordion.Title>Panel 2</Accordion.Title>
            <Accordion.Arrow />
          </Accordion.Header>
          <Accordion.Content>Panel 2 Content</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item>
          <Accordion.Header>
            <Accordion.Title>Panel 3</Accordion.Title>
            <Accordion.Arrow />
          </Accordion.Header>
          <Accordion.Content>Panel 3 Content</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}`;

function AllowMultipleDemo() {
  return (
    <div style={{ width: 'min(100%, 40rem)' }}>
      <Accordion allowMultiple>
        <Accordion.Item>
          <Accordion.Header>
            <Accordion.Title>Panel 1</Accordion.Title>
            <Accordion.Arrow />
          </Accordion.Header>
          <Accordion.Content>Panel 1 Content</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item>
          <Accordion.Header>
            <Accordion.Title>Panel 2</Accordion.Title>
            <Accordion.Arrow />
          </Accordion.Header>
          <Accordion.Content>Panel 2 Content</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item>
          <Accordion.Header>
            <Accordion.Title>Panel 3</Accordion.Title>
            <Accordion.Arrow />
          </Accordion.Header>
          <Accordion.Content>Panel 3 Content</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}

export default function AllowMultiple() {
  return (
    <RenderedDemo code={code} previewWrapper={ReactSparDemoRoot}>
      <AllowMultipleDemo />
    </RenderedDemo>
  );
}
