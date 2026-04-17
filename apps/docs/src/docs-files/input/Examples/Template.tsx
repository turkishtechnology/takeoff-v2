import { useState } from 'react';
import RenderedDemo from '../../../components/RenderedDemo';
// TODO(takeoff-icons): SearchIcon is a temporary Lucide-sourced placeholder.
// Replace with the official Takeoff icon set before the first public release.
import { Input, ReactSparDemoRoot, SearchIcon } from './shared';

const code = `// TODO(takeoff-icons): Swap the placeholder icon below for the official
// Takeoff icon component when it is available.
import { SearchIcon } from './placeholder-icons';

export function InputTemplateDemo() {
  const [query, setQuery] = useState('');

  return (
    <div style={{ display: 'grid', gap: 16, width: 'min(100%, 28rem)' }}>
      <Input
        aria-label="Search reservations"
        icon={<SearchIcon />}
        placeholder="PNR or surname"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        clearable
        suffix={
          <kbd
            style={{
              fontSize: '0.75rem',
              padding: '0 4px',
              border: '1px solid currentColor',
              borderRadius: 4,
            }}
          >
            /
          </kbd>
        }
      />
    </div>
  );
}`;

function InputTemplateDemo() {
  const [query, setQuery] = useState('');

  return (
    <div style={{ display: 'grid', gap: 16, width: 'min(100%, 28rem)' }}>
      <Input
        aria-label="Search reservations"
        icon={<SearchIcon />}
        placeholder="PNR or surname"
        value={query}
        onChange={event => setQuery(event.target.value)}
        clearable
        suffix={
          <kbd
            style={{
              fontSize: '0.75rem',
              padding: '0 4px',
              border: '1px solid currentColor',
              borderRadius: 4,
            }}
          >
            /
          </kbd>
        }
      />
    </div>
  );
}

export default function Template() {
  return (
    <RenderedDemo code={code} previewWrapper={ReactSparDemoRoot}>
      <InputTemplateDemo />
    </RenderedDemo>
  );
}
