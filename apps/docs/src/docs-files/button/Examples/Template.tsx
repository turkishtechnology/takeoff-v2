import RenderedDemo from '../../../components/RenderedDemo';
// TODO(takeoff-icons): ArrowForwardIcon / FlightIcon are temporary
// Lucide-sourced placeholders. Replace with the official Takeoff icon set
// before the first public release.
import { ArrowForwardIcon, Button, FlightIcon, ReactSparDemoRoot } from './shared';

const labelStyle = {
  display: 'grid',
  gap: 4,
  flex: 1,
  minWidth: 0,
  justifyItems: 'start' as const,
  textAlign: 'left' as const,
};

const trailingIconStyle = {
  marginInlineStart: 'auto',
};

const code = `// TODO(takeoff-icons): Swap the placeholder icons below for the official
// Takeoff icon components when they are available.
import { ArrowForwardIcon, FlightIcon } from './placeholder-icons';

export function ButtonTemplateDemo() {
  const labelStyle = {
    display: 'grid',
    gap: 4,
    flex: 1,
    minWidth: 0,
    justifyItems: 'start',
    textAlign: 'left',
  };
  const trailingIconStyle = {
    marginInlineStart: 'auto',
  };

  return (
    <div style={{ width: 'min(100%, 28rem)' }}>
      <Button
        fullWidth
        size="large"
        type="filled"
        variant="primary"
        slotProps={{
          root: {
            style: {
              alignItems: 'center',
              padding: '0.9375rem 1rem',
              borderRadius: 24,
              boxShadow: '0 18px 32px rgba(201, 0, 25, 0.18)',
            },
          },
        }}
      >
        <Button.LeadingIcon>
          <FlightIcon width={16} height={16} strokeWidth={1.8} />
        </Button.LeadingIcon>
        <Button.Label style={labelStyle}>
          <span style={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1.2 }}>
            Continue with Business Flex
          </span>
          <span style={{ fontSize: '0.8125rem', lineHeight: 1.35, color: 'rgba(255, 255, 255, 0.82)' }}>
            Priority check-in | extra baggage | flexible refund
          </span>
        </Button.Label>
        <Button.TrailingIcon style={trailingIconStyle}>
          <ArrowForwardIcon width={18} height={18} strokeWidth={1.8} />
        </Button.TrailingIcon>
      </Button>
    </div>
  );
}`;

function ButtonTemplateDemo() {
  return (
    <div style={{ width: 'min(100%, 28rem)' }}>
      <Button
        fullWidth
        size="large"
        type="filled"
        variant="primary"
        slotProps={{
          root: {
            style: {
              alignItems: 'center',
              padding: '0.9375rem 1rem',
              borderRadius: 24,
              boxShadow: '0 18px 32px rgba(201, 0, 25, 0.18)',
            },
          },
        }}
      >
        <Button.LeadingIcon>
          <FlightIcon width={16} height={16} strokeWidth={1.8} />
        </Button.LeadingIcon>
        <Button.Label style={labelStyle}>
          <span style={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1.2 }}>Continue with Business Flex</span>
          <span style={{ fontSize: '0.8125rem', lineHeight: 1.35, color: 'rgba(255, 255, 255, 0.82)' }}>Priority check-in | extra baggage | flexible refund</span>
        </Button.Label>
        <Button.TrailingIcon style={trailingIconStyle}>
          <ArrowForwardIcon width={18} height={18} strokeWidth={1.8} />
        </Button.TrailingIcon>
      </Button>
    </div>
  );
}

export default function Template() {
  return (
    <RenderedDemo code={code} previewWrapper={ReactSparDemoRoot}>
      <ButtonTemplateDemo />
    </RenderedDemo>
  );
}
