import { useState } from 'react';
import RenderedDemo from '../../../components/RenderedDemo';
// TODO(takeoff-icons): MailIcon is a temporary Lucide-sourced placeholder.
// Replace with the official Takeoff icon set before the first public release.
import { Input, MailIcon, ReactSparDemoRoot } from './shared';

const code = `// TODO(takeoff-icons): Swap the placeholder icon below for the official
// Takeoff icon component when it is available.
import { MailIcon } from './placeholder-icons';

function isEmailLike(value) {
  return value.length === 0 || value.includes('@');
}

export function InputValidationDemo() {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const invalid = touched && !isEmailLike(email);

  return (
    <div style={{ display: 'grid', gap: 16, width: 'min(100%, 28rem)' }}>
      <Input
        label="Email"
        type="email"
        icon={<MailIcon />}
        description="We use this to send your itinerary."
        invalid={invalid}
        error="Enter a valid email address."
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        onBlur={() => setTouched(true)}
      />
    </div>
  );
}`;

function isEmailLike(value: string) {
  return value.length === 0 || value.includes('@');
}

function InputValidationDemo() {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const invalid = touched && !isEmailLike(email);

  return (
    <div style={{ display: 'grid', gap: 16, width: 'min(100%, 28rem)' }}>
      <Input
        label="Email"
        type="email"
        icon={<MailIcon />}
        description="We use this to send your itinerary."
        invalid={invalid}
        error="Enter a valid email address."
        value={email}
        onChange={event => setEmail(event.target.value)}
        onBlur={() => setTouched(true)}
      />
    </div>
  );
}

export default function Validation() {
  return (
    <RenderedDemo code={code} previewWrapper={ReactSparDemoRoot}>
      <InputValidationDemo />
    </RenderedDemo>
  );
}
