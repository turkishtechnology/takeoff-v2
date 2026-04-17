import { useState } from 'react';
import RenderedDemo from '../../../components/RenderedDemo';
import { Checkbox, ReactSparDemoRoot } from './shared';

const code = `export function CheckboxTemplateDemo() {
  const [subscribed, setSubscribed] = useState(true);

  return (
    <Checkbox
      label="Subscribe to itinerary updates"
      description="We send you check-in and gate change alerts."
      type="card"
      value={subscribed}
      onChange={(next) => setSubscribed(Boolean(next))}
    />
  );
}`;

function CheckboxTemplateDemo() {
  const [subscribed, setSubscribed] = useState(true);

  return (
    <Checkbox
      label="Subscribe to itinerary updates"
      description="We send you check-in and gate change alerts."
      type="card"
      value={subscribed}
      onChange={next => setSubscribed(Boolean(next))}
    />
  );
}

export default function Template() {
  return (
    <RenderedDemo code={code} previewWrapper={ReactSparDemoRoot}>
      <CheckboxTemplateDemo />
    </RenderedDemo>
  );
}
