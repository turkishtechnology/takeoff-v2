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
        <Input aria-label="Search">
          <Input.Container>
            <Input.LeadingIcon><SearchIcon /></Input.LeadingIcon>
            <Input.Field placeholder="Search flights" />
          </Input.Container>
        </Input>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <p style={sectionLabelStyle}>Suffix text</p>
        <Input>
          <Input.Label>Domain</Input.Label>
          <Input.Container>
            <Input.Field placeholder="turkishairlines" />
            <Input.Suffix>.com</Input.Suffix>
          </Input.Container>
        </Input>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <p style={sectionLabelStyle}>Prefix text</p>
        <Input type="number">
          <Input.Label>Amount</Input.Label>
          <Input.Container>
            <Input.Prefix>TRY</Input.Prefix>
            <Input.Field placeholder="0" />
          </Input.Container>
        </Input>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <p style={sectionLabelStyle}>Loading spinner</p>
        <Input aria-label="Search" loading>
          <Input.Container>
            <Input.LeadingIcon><SearchIcon /></Input.LeadingIcon>
            <Input.Field />
            <Input.Spinner />
          </Input.Container>
        </Input>
      </div>
    </div>
  );
}`;

function InputAdornmentsDemo() {
  return (
    <div style={{ display: 'grid', gap: 20, width: 'min(100%, 28rem)' }}>
      <div style={{ display: 'grid', gap: 8 }}>
        <p style={sectionLabelStyle}>Leading icon</p>
        <Input aria-label="Search">
          <Input.Container>
            <Input.LeadingIcon>
              <SearchIcon />
            </Input.LeadingIcon>
            <Input.Field placeholder="Search flights" />
          </Input.Container>
        </Input>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <p style={sectionLabelStyle}>Suffix text</p>
        <Input>
          <Input.Label>Domain</Input.Label>
          <Input.Container>
            <Input.Field placeholder="turkishairlines" />
            <Input.Suffix>.com</Input.Suffix>
          </Input.Container>
        </Input>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <p style={sectionLabelStyle}>Prefix text</p>
        <Input type="number">
          <Input.Label>Amount</Input.Label>
          <Input.Container>
            <Input.Prefix>TRY</Input.Prefix>
            <Input.Field placeholder="0" />
          </Input.Container>
        </Input>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <p style={sectionLabelStyle}>Loading spinner</p>
        <Input aria-label="Search" loading>
          <Input.Container>
            <Input.LeadingIcon>
              <SearchIcon />
            </Input.LeadingIcon>
            <Input.Field />
            <Input.Spinner />
          </Input.Container>
        </Input>
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
