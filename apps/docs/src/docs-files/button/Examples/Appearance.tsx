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

const rowStyle = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  justifyContent: 'center',
  gap: 12,
};

const dividerStyle = {
  width: '100%',
  height: 1,
  background: 'var(--border-light)',
};

const code = `export function TypeDemo() {
  const sectionLabelStyle = {
    margin: 0,
    color: 'var(--primary-base)',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  };
  const rowStyle = { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 };
  const dividerStyle = { width: '100%', height: 1, background: 'var(--border-light)' };

  return (
    <div style={{ display: 'grid', gap: 16, width: 'min(100%, 45rem)', justifyItems: 'center' }}>
      <div style={{ display: 'grid', gap: 12, width: '100%', justifyItems: 'center' }}>
        <p style={sectionLabelStyle}>Type</p>
        <div style={rowStyle}>
          <Button type="filled"><Button.Label>Filled</Button.Label></Button>
          <Button type="outlined"><Button.Label>Outlined</Button.Label></Button>
          <Button type="text"><Button.Label>Text</Button.Label></Button>
          <Button type="elevated"><Button.Label>Elevated</Button.Label></Button>
        </div>
      </div>

      <div style={dividerStyle} />

      <div style={{ display: 'grid', gap: 12, width: '100%', justifyItems: 'center' }}>
        <p style={sectionLabelStyle}>With variant</p>
        <div style={rowStyle}>
          <Button type="filled" variant="secondary"><Button.Label>Filled secondary</Button.Label></Button>
          <Button type="outlined" variant="secondary"><Button.Label>Outlined secondary</Button.Label></Button>
          <Button type="text" variant="neutral"><Button.Label>Text neutral</Button.Label></Button>
          <Button type="elevated" variant="warning"><Button.Label>Elevated warning</Button.Label></Button>
        </div>
      </div>
    </div>
  );
}`;

function TypeDemo() {
  return (
    <div style={{ display: 'grid', gap: 16, width: 'min(100%, 45rem)', justifyItems: 'center' }}>
      <div style={{ display: 'grid', gap: 12, width: '100%', justifyItems: 'center' }}>
        <p style={sectionLabelStyle}>Type</p>
        <div style={rowStyle}>
          <Button type="filled">
            <Button.Label>Filled</Button.Label>
          </Button>
          <Button type="outlined">
            <Button.Label>Outlined</Button.Label>
          </Button>
          <Button type="text">
            <Button.Label>Text</Button.Label>
          </Button>
          <Button type="elevated">
            <Button.Label>Elevated</Button.Label>
          </Button>
        </div>
      </div>

      <div style={dividerStyle} />

      <div style={{ display: 'grid', gap: 12, width: '100%', justifyItems: 'center' }}>
        <p style={sectionLabelStyle}>With variant</p>
        <div style={rowStyle}>
          <Button type="filled" variant="secondary">
            <Button.Label>Filled secondary</Button.Label>
          </Button>
          <Button type="outlined" variant="secondary">
            <Button.Label>Outlined secondary</Button.Label>
          </Button>
          <Button type="text" variant="neutral">
            <Button.Label>Text neutral</Button.Label>
          </Button>
          <Button type="elevated" variant="warning">
            <Button.Label>Elevated warning</Button.Label>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function TypeExample() {
  return (
    <RenderedDemo code={code} previewWrapper={ReactSparDemoRoot}>
      <TypeDemo />
    </RenderedDemo>
  );
}
