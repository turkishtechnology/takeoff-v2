import { useState } from 'react';
import RenderedDemo from '../../../components/RenderedDemo';
import { Checkbox, ReactSparDemoRoot } from './shared';

const code = `export function CheckboxTemplateDemo() {
  const [subscribed, setSubscribed] = useState(true);

  return (
    <Checkbox
      type="card"
      value={subscribed}
      onChange={(next) => setSubscribed(Boolean(next))}
    >
      <Checkbox.Indicator>
        <Checkbox.Icon />
      </Checkbox.Indicator>
      <Checkbox.Content>
        <Checkbox.Label>Subscribe to itinerary updates</Checkbox.Label>
        <Checkbox.Description>
          We send you check-in and gate change alerts.
        </Checkbox.Description>
      </Checkbox.Content>
    </Checkbox>
  );
}`;

function CheckboxTemplateDemo() {
  const [subscribed, setSubscribed] = useState(true);

  return (
    <Checkbox type="card" value={subscribed} onChange={next => setSubscribed(Boolean(next))}>
      <Checkbox.Indicator>
        <Checkbox.Icon />
      </Checkbox.Indicator>
      <Checkbox.Content>
        <Checkbox.Label>Subscribe to itinerary updates</Checkbox.Label>
        <Checkbox.Description>We send you check-in and gate change alerts.</Checkbox.Description>
      </Checkbox.Content>
    </Checkbox>
  );
}

export default function Template() {
  return (
    <RenderedDemo code={code} previewWrapper={ReactSparDemoRoot}>
      <CheckboxTemplateDemo />
    </RenderedDemo>
  );
}
