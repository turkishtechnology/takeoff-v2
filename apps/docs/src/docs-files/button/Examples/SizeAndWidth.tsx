import RenderedDemo from '../../../components/RenderedDemo';
import { Button, ReactSparDemoRoot } from './shared';

const sectionLabelStyle = {
  margin: 0,
  color: 'var(--primary-base)',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
};

const dividerStyle = {
  width: '100%',
  height: 1,
  background: 'var(--border-light)',
};

const code = `export function SizeAndWidthDemo() {
  const sectionLabelStyle = {
    margin: 0,
    color: 'var(--primary-base)',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  };
  const dividerStyle = { width: '100%', height: 1, background: 'var(--border-light)' };

  return (
    <div style={{ display: 'grid', gap: 16, width: 'min(100%, 45rem)', justifyItems: 'center' }}>
      <div style={{ display: 'grid', gap: 12, width: '100%', justifyItems: 'center' }}>
        <p style={sectionLabelStyle}>Sizes</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Button size="small">Small</Button>
          <Button size="base">Base</Button>
          <Button size="large">Large</Button>
        </div>
      </div>

      <div style={dividerStyle} />

      <div style={{ display: 'grid', gap: 12, width: '100%', justifyItems: 'center' }}>
        <p style={sectionLabelStyle}>Full width</p>
        <div style={{ display: 'grid', gap: 12, width: 'min(100%, 22.5rem)' }}>
          <Button fullWidth>Continue to passenger details</Button>
          <Button fullWidth type="outlined" variant="secondary">
            Compare fare families
          </Button>
        </div>
      </div>
    </div>
  );
}`;

function SizeAndWidthDemo() {
  return (
    <div style={{ display: 'grid', gap: 16, width: 'min(100%, 45rem)', justifyItems: 'center' }}>
      <div style={{ display: 'grid', gap: 12, width: '100%', justifyItems: 'center' }}>
        <p style={sectionLabelStyle}>Sizes</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Button size="small">Small</Button>
          <Button size="base">Base</Button>
          <Button size="large">Large</Button>
        </div>
      </div>

      <div style={dividerStyle} />

      <div style={{ display: 'grid', gap: 12, width: '100%', justifyItems: 'center' }}>
        <p style={sectionLabelStyle}>Full width</p>
        <div style={{ display: 'grid', gap: 12, width: 'min(100%, 22.5rem)' }}>
          <Button fullWidth>Continue to passenger details</Button>
          <Button fullWidth type="outlined" variant="secondary">
            Compare fare families
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SizeAndWidth() {
  return (
    <RenderedDemo code={code} previewWrapper={ReactSparDemoRoot}>
      <SizeAndWidthDemo />
    </RenderedDemo>
  );
}
