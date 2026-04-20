import RenderedDemo from '../../../components/RenderedDemo';
import { Accordion, ReactSparDemoRoot } from './shared';

const sectionLabelStyle = {
  margin: 0,
  color: 'var(--primary-base)',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
};

const code = `export function SizeDemo() {
  const sectionLabelStyle = {
    margin: 0,
    color: 'var(--primary-base)',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  };

  return (
    <div style={{ display: 'grid', gap: 24, width: 'min(100%, 40rem)' }}>
      <div style={{ display: 'grid', gap: 8 }}>
        <p style={sectionLabelStyle}>Base</p>
        <Accordion>
          <Accordion.Item size="base">
            <Accordion.Header>
              <Accordion.Title>Panel 1 Title</Accordion.Title>
              <Accordion.Arrow />
            </Accordion.Header>
            <Accordion.Content>Panel content at base size.</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item size="base">
            <Accordion.Header>
              <Accordion.Title>Panel 2 Title</Accordion.Title>
              <Accordion.Arrow />
            </Accordion.Header>
            <Accordion.Content>Panel content at base size.</Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <p style={sectionLabelStyle}>Large</p>
        <Accordion>
          <Accordion.Item size="large">
            <Accordion.Header>
              <Accordion.Title>Panel 1 Title</Accordion.Title>
              <Accordion.Arrow />
            </Accordion.Header>
            <Accordion.Content>Panel content at large size.</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item size="large">
            <Accordion.Header>
              <Accordion.Title>Panel 2 Title</Accordion.Title>
              <Accordion.Arrow />
            </Accordion.Header>
            <Accordion.Content>Panel content at large size.</Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </div>
    </div>
  );
}`;

function SizeDemo() {
  return (
    <div style={{ display: 'grid', gap: 24, width: 'min(100%, 40rem)' }}>
      <div style={{ display: 'grid', gap: 8 }}>
        <p style={sectionLabelStyle}>Base</p>
        <Accordion>
          <Accordion.Item size="base">
            <Accordion.Header>
              <Accordion.Title>Panel 1 Title</Accordion.Title>
              <Accordion.Arrow />
            </Accordion.Header>
            <Accordion.Content>Panel content at base size.</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item size="base">
            <Accordion.Header>
              <Accordion.Title>Panel 2 Title</Accordion.Title>
              <Accordion.Arrow />
            </Accordion.Header>
            <Accordion.Content>Panel content at base size.</Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <p style={sectionLabelStyle}>Large</p>
        <Accordion>
          <Accordion.Item size="large">
            <Accordion.Header>
              <Accordion.Title>Panel 1 Title</Accordion.Title>
              <Accordion.Arrow />
            </Accordion.Header>
            <Accordion.Content>Panel content at large size.</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item size="large">
            <Accordion.Header>
              <Accordion.Title>Panel 2 Title</Accordion.Title>
              <Accordion.Arrow />
            </Accordion.Header>
            <Accordion.Content>Panel content at large size.</Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </div>
    </div>
  );
}

export default function Size() {
  return (
    <RenderedDemo code={code} previewWrapper={ReactSparDemoRoot}>
      <SizeDemo />
    </RenderedDemo>
  );
}
