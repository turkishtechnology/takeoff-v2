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
        type="email"
        invalid={invalid}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      >
        <Input.Label>Email</Input.Label>
        <Input.Container>
          <Input.LeadingIcon><MailIcon /></Input.LeadingIcon>
          <Input.Field onBlur={() => setTouched(true)} />
        </Input.Container>
        <Input.Description>We use this to send your itinerary.</Input.Description>
        <Input.ErrorMessage>Enter a valid email address.</Input.ErrorMessage>
      </Input>
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
      <Input type="email" invalid={invalid} value={email} onChange={event => setEmail(event.target.value)}>
        <Input.Label>Email</Input.Label>
        <Input.Container>
          <Input.LeadingIcon>
            <MailIcon />
          </Input.LeadingIcon>
          <Input.Field onBlur={() => setTouched(true)} />
        </Input.Container>
        <Input.Description>We use this to send your itinerary.</Input.Description>
        <Input.ErrorMessage>Enter a valid email address.</Input.ErrorMessage>
      </Input>
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
