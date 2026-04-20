import RenderedDemo from '../../../components/RenderedDemo';
// TODO(takeoff-icons): FlightIcon / HotelIcon are temporary Lucide-sourced
// placeholders. Replace with the official Takeoff icon set before the first
// public release.
import { Accordion, FlightIcon, HotelIcon, ReactSparDemoRoot } from './shared';

const sectionLabelStyle = {
  margin: 0,
  color: 'var(--primary-base)',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
};

const code = `// TODO(takeoff-icons): Swap the placeholder icons below for the official
// Takeoff icon components when they are available.
import { FlightIcon, HotelIcon } from './placeholder-icons';

export function ArrowPositionDemo() {
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
        <p style={sectionLabelStyle}>Right (default)</p>
        <Accordion>
          <Accordion.Item>
            <Accordion.Header>
              <Accordion.Icon><FlightIcon /></Accordion.Icon>
              <Accordion.Title>Panel 1 Title</Accordion.Title>
              <Accordion.Arrow />
            </Accordion.Header>
            <Accordion.Content>Panel 1 Content</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item>
            <Accordion.Header>
              <Accordion.Icon><HotelIcon /></Accordion.Icon>
              <Accordion.Title>Panel 2 Title</Accordion.Title>
              <Accordion.Arrow />
            </Accordion.Header>
            <Accordion.Content>Panel 2 Content</Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <p style={sectionLabelStyle}>Left</p>
        <Accordion>
          <Accordion.Item>
            <Accordion.Header>
              <Accordion.Arrow />
              <Accordion.Icon><FlightIcon /></Accordion.Icon>
              <Accordion.Title>Panel 1 Title</Accordion.Title>
            </Accordion.Header>
            <Accordion.Content>Panel 1 Content</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item>
            <Accordion.Header>
              <Accordion.Arrow />
              <Accordion.Icon><HotelIcon /></Accordion.Icon>
              <Accordion.Title>Panel 2 Title</Accordion.Title>
            </Accordion.Header>
            <Accordion.Content>Panel 2 Content</Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </div>
    </div>
  );
}`;

function ArrowPositionDemo() {
  return (
    <div style={{ display: 'grid', gap: 24, width: 'min(100%, 40rem)' }}>
      <div style={{ display: 'grid', gap: 8 }}>
        <p style={sectionLabelStyle}>Right (default)</p>
        <Accordion>
          <Accordion.Item>
            <Accordion.Header>
              <Accordion.Icon>
                <FlightIcon />
              </Accordion.Icon>
              <Accordion.Title>Panel 1 Title</Accordion.Title>
              <Accordion.Arrow />
            </Accordion.Header>
            <Accordion.Content>Panel 1 Content</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item>
            <Accordion.Header>
              <Accordion.Icon>
                <HotelIcon />
              </Accordion.Icon>
              <Accordion.Title>Panel 2 Title</Accordion.Title>
              <Accordion.Arrow />
            </Accordion.Header>
            <Accordion.Content>Panel 2 Content</Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <p style={sectionLabelStyle}>Left</p>
        <Accordion>
          <Accordion.Item>
            <Accordion.Header>
              <Accordion.Arrow />
              <Accordion.Icon>
                <FlightIcon />
              </Accordion.Icon>
              <Accordion.Title>Panel 1 Title</Accordion.Title>
            </Accordion.Header>
            <Accordion.Content>Panel 1 Content</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item>
            <Accordion.Header>
              <Accordion.Arrow />
              <Accordion.Icon>
                <HotelIcon />
              </Accordion.Icon>
              <Accordion.Title>Panel 2 Title</Accordion.Title>
            </Accordion.Header>
            <Accordion.Content>Panel 2 Content</Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </div>
    </div>
  );
}

export default function ArrowPosition() {
  return (
    <RenderedDemo code={code} previewWrapper={ReactSparDemoRoot}>
      <ArrowPositionDemo />
    </RenderedDemo>
  );
}
