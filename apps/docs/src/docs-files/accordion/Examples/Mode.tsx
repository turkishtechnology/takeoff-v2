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

const code = `export function ModeDemo() {
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
        <p style={sectionLabelStyle}>Default</p>
        <Accordion mode="default">
          <Accordion.Item>
            <Accordion.Header>
              <Accordion.Title>Panel 1 Title</Accordion.Title>
              <Accordion.Arrow />
            </Accordion.Header>
            <Accordion.Content>Panel 1 Content</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item>
            <Accordion.Header>
              <Accordion.Title>Panel 2 Title</Accordion.Title>
              <Accordion.Arrow />
            </Accordion.Header>
            <Accordion.Content>Panel 2 Content</Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <p style={sectionLabelStyle}>Compact</p>
        <Accordion mode="compact">
          <Accordion.Item>
            <Accordion.Header>
              <Accordion.Title>Panel 1 Title</Accordion.Title>
              <Accordion.Arrow />
            </Accordion.Header>
            <Accordion.Content>Panel 1 Content</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item>
            <Accordion.Header>
              <Accordion.Title>Panel 2 Title</Accordion.Title>
              <Accordion.Arrow />
            </Accordion.Header>
            <Accordion.Content>Panel 2 Content</Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </div>
    </div>
  );
}`;

function ModeDemo() {
  return (
    <div style={{ display: 'grid', gap: 24, width: 'min(100%, 40rem)' }}>
      <div style={{ display: 'grid', gap: 8 }}>
        <p style={sectionLabelStyle}>Default</p>
        <Accordion mode="default">
          <Accordion.Item>
            <Accordion.Header>
              <Accordion.Title>Panel 1 Title</Accordion.Title>
              <Accordion.Arrow />
            </Accordion.Header>
            <Accordion.Content>Panel 1 Content</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item>
            <Accordion.Header>
              <Accordion.Title>Panel 2 Title</Accordion.Title>
              <Accordion.Arrow />
            </Accordion.Header>
            <Accordion.Content>Panel 2 Content</Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <p style={sectionLabelStyle}>Compact</p>
        <Accordion mode="compact">
          <Accordion.Item>
            <Accordion.Header>
              <Accordion.Title>Panel 1 Title</Accordion.Title>
              <Accordion.Arrow />
            </Accordion.Header>
            <Accordion.Content>Panel 1 Content</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item>
            <Accordion.Header>
              <Accordion.Title>Panel 2 Title</Accordion.Title>
              <Accordion.Arrow />
            </Accordion.Header>
            <Accordion.Content>Panel 2 Content</Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </div>
    </div>
  );
}

export default function Mode() {
  return (
    <RenderedDemo code={code} previewWrapper={ReactSparDemoRoot}>
      <ModeDemo />
    </RenderedDemo>
  );
}
