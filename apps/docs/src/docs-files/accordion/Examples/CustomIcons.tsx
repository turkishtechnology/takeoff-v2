import RenderedDemo from '../../../components/RenderedDemo';
// TODO(takeoff-icons): AddIcon / RemoveIcon / FlightIcon are temporary
// Lucide-sourced placeholders. Replace with the official Takeoff icon set
// before the first public release.
import { Accordion, AddIcon, FlightIcon, ReactSparDemoRoot, RemoveIcon } from './shared';

const code = `// TODO(takeoff-icons): Swap the placeholder icons below for the official
// Takeoff icon components when they are available.
import { AddIcon, FlightIcon, RemoveIcon } from './placeholder-icons';

export function CustomIconsDemo() {
  return (
    <div style={{ width: 'min(100%, 40rem)' }}>
      <Accordion>
        <Accordion.Item>
          <Accordion.Header>
            <Accordion.Icon><FlightIcon /></Accordion.Icon>
            <Accordion.Title>Panel 1 Title</Accordion.Title>
            <Accordion.Arrow expandIcon={<AddIcon />} collapseIcon={<RemoveIcon />} />
          </Accordion.Header>
          <Accordion.Content>Panel 1 Content</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item>
          <Accordion.Header>
            <Accordion.Icon><FlightIcon /></Accordion.Icon>
            <Accordion.Title>Panel 2 Title</Accordion.Title>
            <Accordion.Arrow expandIcon={<AddIcon />} collapseIcon={<RemoveIcon />} />
          </Accordion.Header>
          <Accordion.Content>Panel 2 Content</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}`;

function CustomIconsDemo() {
  return (
    <div style={{ width: 'min(100%, 40rem)' }}>
      <Accordion>
        <Accordion.Item>
          <Accordion.Header>
            <Accordion.Icon>
              <FlightIcon />
            </Accordion.Icon>
            <Accordion.Title>Panel 1 Title</Accordion.Title>
            <Accordion.Arrow expandIcon={<AddIcon />} collapseIcon={<RemoveIcon />} />
          </Accordion.Header>
          <Accordion.Content>Panel 1 Content</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item>
          <Accordion.Header>
            <Accordion.Icon>
              <FlightIcon />
            </Accordion.Icon>
            <Accordion.Title>Panel 2 Title</Accordion.Title>
            <Accordion.Arrow expandIcon={<AddIcon />} collapseIcon={<RemoveIcon />} />
          </Accordion.Header>
          <Accordion.Content>Panel 2 Content</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}

export default function CustomIcons() {
  return (
    <RenderedDemo code={code} previewWrapper={ReactSparDemoRoot}>
      <CustomIconsDemo />
    </RenderedDemo>
  );
}
