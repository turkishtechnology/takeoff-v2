import RenderedDemo from '../../../components/RenderedDemo';
// TODO(takeoff-icons): SearchIcon is a temporary Lucide-sourced placeholder.
// Replace with the official Takeoff icon set before the first public release.
import { Input, ReactSparDemoRoot, SearchIcon } from './shared';

const sectionLabelStyle = {
  margin: 0,
  color: 'var(--primary-base)',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
};

const code = `// TODO(takeoff-icons): Swap the placeholder icon below for the official
// Takeoff icon component when it is available.
import { SearchIcon } from './placeholder-icons';

const sectionLabelStyle = {
  margin: 0,
  color: 'var(--primary-base)',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
};

export function InputAdornmentsDemo() {
  return (
    <div style={{ display: 'grid', gap: 20, width: 'min(100%, 28rem)' }}>
      <div style={{ display: 'grid', gap: 8 }}>
        <p style={sectionLabelStyle}>Leading icon</p>
        <Input aria-label="Search" icon={<SearchIcon />} placeholder="Search flights" />
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <p style={sectionLabelStyle}>Suffix text</p>
        <Input label="Domain" suffix=".com" placeholder="turkishairlines" />
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <p style={sectionLabelStyle}>Prefix text</p>
        <Input label="Amount" prefix="TRY" type="number" placeholder="0" />
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <p style={sectionLabelStyle}>Loading spinner</p>
        <Input aria-label="Search" icon={<SearchIcon />} loading />
      </div>
    </div>
  );
}`;

function InputAdornmentsDemo() {
  return (
    <div style={{ display: 'grid', gap: 20, width: 'min(100%, 28rem)' }}>
      <div style={{ display: 'grid', gap: 8 }}>
        <p style={sectionLabelStyle}>Leading icon</p>
        <Input aria-label="Search" icon={<SearchIcon />} placeholder="Search flights" />
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <p style={sectionLabelStyle}>Suffix text</p>
        <Input label="Domain" suffix=".com" placeholder="turkishairlines" />
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <p style={sectionLabelStyle}>Prefix text</p>
        <Input label="Amount" prefix="TRY" type="number" placeholder="0" />
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <p style={sectionLabelStyle}>Loading spinner</p>
        <Input aria-label="Search" icon={<SearchIcon />} loading />
      </div>
    </div>
  );
}

export default function Adornments() {
  return (
    <RenderedDemo code={code} previewWrapper={ReactSparDemoRoot}>
      <InputAdornmentsDemo />
    </RenderedDemo>
  );
}
