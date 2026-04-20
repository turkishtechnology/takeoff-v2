import { useState } from 'react';
import RenderedDemo from '../../../components/RenderedDemo';
import { Accordion, ReactSparDemoRoot } from './shared';

function toArray(value: string | number | (string | number)[] | undefined): (string | number)[] {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}

const code = `import { useState } from 'react';

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}

export function ActiveIndexDemo() {
  const [active, setActive] = useState([0, 1]);

  return (
    <div style={{ width: 'min(100%, 40rem)' }}>
      <Accordion
        allowMultiple
        activeIndex={active}
        onActiveIndexChange={(next) => setActive(toArray(next))}
      >
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

function ActiveIndexDemo() {
  const [active, setActive] = useState<(string | number)[]>([0, 1]);

  return (
    <div style={{ width: 'min(100%, 40rem)' }}>
      <Accordion allowMultiple activeIndex={active} onActiveIndexChange={next => setActive(toArray(next))}>
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

export default function ActiveIndex() {
  return (
    <RenderedDemo code={code} previewWrapper={ReactSparDemoRoot}>
      <ActiveIndexDemo />
    </RenderedDemo>
  );
}
