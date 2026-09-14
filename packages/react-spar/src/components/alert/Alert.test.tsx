import { createRef, useState, type FormEvent, type HTMLAttributes, type MouseEvent } from 'react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';

import { TakeoffSparProvider } from '../../provider';
import { render, screen, within } from '../../test-utils';
import { Button } from '../button';

import { Alert, type AlertAppearance, type AlertVariant } from './index';

const VARIANTS: AlertVariant[] = ['success', 'warning', 'info', 'danger', 'neutral'];
const APPEARANCES: AlertAppearance[] = ['filled', 'filledLight', 'outlined', 'gradient'];

// `data-*` keys are not part of `HTMLAttributes`, so slot overrides that try to
// hijack canonical hooks need an explicit template-literal index signature.
type SlotAttrs = HTMLAttributes<HTMLElement> & Record<`data-${string}`, string>;

let consoleError: MockInstance;

beforeEach(() => {
  consoleError = vi.spyOn(console, 'error');
});

afterEach(() => {
  try {
    // Guards against React act()/DOM-nesting/unknown-prop warnings leaking out of any test.
    expect(consoleError).not.toHaveBeenCalled();
  } finally {
    consoleError.mockRestore();
  }
});

describe('Alert (compound)', () => {
  describe('rendering', () => {
    it('renders the canonical anatomy with the tk-* class and data-slot on every part', () => {
      render(
        <Alert>
          <Alert.Content>
            <Alert.Title>Gate changed</Alert.Title>
            <Alert.Description>Your flight TK1983 now departs from gate A8.</Alert.Description>
          </Alert.Content>
          <Alert.Actions>
            <Button appearance="text">Details</Button>
          </Alert.Actions>
          <Alert.Close />
        </Alert>,
      );

      const root = screen.getByRole('status');
      expect(root.tagName).toBe('DIV');
      expect(root).toHaveClass('tk-alert');
      expect(root).toHaveAttribute('data-slot', 'root');

      const content = root.querySelector('.tk-alert-content');
      expect(content?.tagName).toBe('DIV');
      expect(content).toHaveAttribute('data-slot', 'root');
      expect(content?.parentElement).toBe(root);

      const title = screen.getByRole('heading', { name: 'Gate changed' });
      expect(title.tagName).toBe('H5');
      expect(title).toHaveClass('tk-alert-title');
      expect(title).toHaveAttribute('data-slot', 'root');
      expect(title.parentElement).toBe(content);

      const description = screen.getByText('Your flight TK1983 now departs from gate A8.');
      expect(description.tagName).toBe('P');
      expect(description).toHaveClass('tk-alert-description');
      expect(description).toHaveAttribute('data-slot', 'root');
      expect(description.parentElement).toBe(content);

      const actions = root.querySelector('.tk-alert-actions') as HTMLElement;
      expect(actions.tagName).toBe('DIV');
      expect(actions).toHaveAttribute('data-slot', 'root');
      expect(actions.parentElement).toBe(root);
      expect(within(actions).getByRole('button', { name: 'Details' })).toBeInTheDocument();

      const close = screen.getByRole('button', { name: 'Close' });
      expect(close).toHaveClass('tk-alert-close');
      expect(close).toHaveAttribute('data-slot', 'root');
      expect(close.parentElement).toBe(root);
    });

    it('emits the documented default data attributes on the root', () => {
      render(
        <Alert>
          <Alert.Content>
            <Alert.Title>Default</Alert.Title>
          </Alert.Content>
        </Alert>,
      );

      const root = screen.getByRole('status');
      expect(root).toHaveAttribute('data-variant', 'neutral');
      expect(root).toHaveAttribute('data-type', 'filled');
    });

    it.each(VARIANTS)('reflects variant="%s" as data-variant', variant => {
      render(
        <Alert variant={variant}>
          <Alert.Content>
            <Alert.Title>{variant}</Alert.Title>
          </Alert.Content>
        </Alert>,
      );

      expect(screen.getByRole('status')).toHaveAttribute('data-variant', variant);
    });

    it.each(APPEARANCES)('reflects appearance="%s" as data-type', appearance => {
      render(
        <Alert appearance={appearance}>
          <Alert.Content>
            <Alert.Title>{appearance}</Alert.Title>
          </Alert.Content>
        </Alert>,
      );

      expect(screen.getByRole('status')).toHaveAttribute('data-type', appearance);
    });

    it('keeps the visual props and onClose off the DOM while forwarding native attributes', () => {
      render(
        <Alert id="gate-alert" aria-label="Gate update" variant="info" appearance="outlined" onClose={() => {}}>
          <Alert.Content>
            <Alert.Title>Gate changed</Alert.Title>
          </Alert.Content>
        </Alert>,
      );

      const root = screen.getByRole('status');
      expect(root).toHaveAttribute('id', 'gate-alert');
      expect(root).toHaveAccessibleName('Gate update');
      expect(root).not.toHaveAttribute('variant');
      expect(root).not.toHaveAttribute('appearance');
      expect(root).not.toHaveAttribute('onclose');
    });

    it('renders every part through the as prop and forwards refs to the rendered element', () => {
      // Polymorphic refs intersect the default element's ref with the `as`
      // element's, so an HTMLDivElement ref satisfies both sides.
      const rootRef = createRef<HTMLDivElement>();
      const contentRef = createRef<HTMLDivElement>();
      const titleRef = createRef<HTMLDivElement>();
      const descriptionRef = createRef<HTMLDivElement>();
      const actionsRef = createRef<HTMLDivElement>();
      const closeRef = createRef<HTMLButtonElement>();

      const { container } = render(
        <Alert as="section" ref={rootRef}>
          <Alert.Content as="article" ref={contentRef}>
            <Alert.Title as="div" ref={titleRef}>
              Gate changed
            </Alert.Title>
            <Alert.Description as="div" ref={descriptionRef}>
              New gate A8.
            </Alert.Description>
          </Alert.Content>
          <Alert.Actions as="footer" ref={actionsRef}>
            <Button appearance="text">Details</Button>
          </Alert.Actions>
          <Alert.Close ref={closeRef} />
        </Alert>,
      );

      const root = container.querySelector('.tk-alert');
      expect(root?.tagName).toBe('SECTION');
      expect(rootRef.current).toBe(root);

      const content = container.querySelector('.tk-alert-content');
      expect(content?.tagName).toBe('ARTICLE');
      expect(contentRef.current).toBe(content);

      const title = container.querySelector('.tk-alert-title');
      expect(title?.tagName).toBe('DIV');
      expect(titleRef.current).toBe(title);

      const description = container.querySelector('.tk-alert-description');
      expect(description?.tagName).toBe('DIV');
      expect(descriptionRef.current).toBe(description);

      const actions = container.querySelector('.tk-alert-actions');
      expect(actions?.tagName).toBe('FOOTER');
      expect(actionsRef.current).toBe(actions);

      expect(closeRef.current).toBe(screen.getByRole('button', { name: 'Close' }));
    });

    it('updates the data hooks and heading level in place when the props change', () => {
      const { rerender } = render(
        <Alert variant="info" appearance="filled">
          <Alert.Content>
            <Alert.Title level={5}>Gate changed</Alert.Title>
          </Alert.Content>
        </Alert>,
      );

      const root = screen.getByRole('status');
      expect(root).toHaveAttribute('data-variant', 'info');
      expect(root).toHaveAttribute('data-type', 'filled');

      rerender(
        <Alert variant="danger" appearance="gradient">
          <Alert.Content>
            <Alert.Title level={2}>Gate changed</Alert.Title>
          </Alert.Content>
        </Alert>,
      );

      expect(screen.getByRole('status')).toBe(root);
      expect(root).toHaveAttribute('data-variant', 'danger');
      expect(root).toHaveAttribute('data-type', 'gradient');
      expect(screen.getByRole('heading', { level: 2, name: 'Gate changed' })).toHaveClass('tk-alert-title');
      expect(screen.queryByRole('heading', { level: 5 })).toBeNull();
    });
  });

  describe('live region role', () => {
    it('defaults the root to a polite status region', () => {
      render(
        <Alert>
          <Alert.Content>
            <Alert.Description>Informational message.</Alert.Description>
          </Alert.Content>
        </Alert>,
      );

      expect(screen.getByRole('status')).toHaveClass('tk-alert');
      expect(screen.queryByRole('alert')).toBeNull();
    });

    it('lets consumers opt into an assertive alert role', () => {
      render(
        <Alert role="alert" variant="danger">
          <Alert.Content>
            <Alert.Description>Payment failed.</Alert.Description>
          </Alert.Content>
        </Alert>,
      );

      expect(screen.getByRole('alert')).toHaveClass('tk-alert');
      expect(screen.queryByRole('status')).toBeNull();
    });
  });

  describe('Alert.Title', () => {
    it('renders a level-5 heading by default', () => {
      render(
        <Alert>
          <Alert.Content>
            <Alert.Title>Gate changed</Alert.Title>
          </Alert.Content>
        </Alert>,
      );

      const heading = screen.getByRole('heading', { level: 5, name: 'Gate changed' });
      expect(heading.tagName).toBe('H5');
    });

    it.each([1, 2, 3, 4, 5, 6] as const)('renders a semantic heading for level=%i', level => {
      render(
        <Alert>
          <Alert.Content>
            <Alert.Title level={level}>Heading</Alert.Title>
          </Alert.Content>
        </Alert>,
      );

      const heading = screen.getByRole('heading', { level, name: 'Heading' });
      expect(heading.tagName).toBe(`H${level}`);
      expect(heading).toHaveClass('tk-alert-title');
      expect(heading).not.toHaveAttribute('level');
    });

    it('lets as take precedence over the level-derived heading tag', () => {
      render(
        <Alert>
          <Alert.Content>
            <Alert.Title as="span" level={2}>
              Not a heading
            </Alert.Title>
          </Alert.Content>
        </Alert>,
      );

      const title = screen.getByText('Not a heading');
      expect(title.tagName).toBe('SPAN');
      expect(title).toHaveClass('tk-alert-title');
      expect(screen.queryByRole('heading')).toBeNull();
    });
  });

  describe('Alert.Close', () => {
    it('renders an icon-only button with the default accessible name', () => {
      render(
        <Alert>
          <Alert.Close />
        </Alert>,
      );

      const close = screen.getByRole('button', { name: 'Close' });
      expect(close.tagName).toBe('BUTTON');
      expect(close).toHaveAttribute('type', 'button');
      expect(close).toHaveAttribute('aria-label', 'Close');
      expect(close).toHaveTextContent('');

      const icon = close.querySelector('svg');
      expect(icon).not.toBeNull();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('prefers a consumer aria-label over the default name', () => {
      render(
        <Alert>
          <Alert.Close aria-label="Close alert" />
        </Alert>,
      );

      const close = screen.getByRole('button', { name: 'Close alert' });
      expect(close).toHaveAttribute('aria-label', 'Close alert');
      expect(close.querySelector('svg')).not.toBeNull();
      expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();
    });

    it('renders custom children instead of the icon and drops the default label', () => {
      render(
        <Alert>
          <Alert.Close>Dismiss</Alert.Close>
        </Alert>,
      );

      const close = screen.getByRole('button', { name: 'Dismiss' });
      expect(close).not.toHaveAttribute('aria-label');
      expect(close).toHaveTextContent('Dismiss');
      expect(close.querySelector('svg')).toBeNull();
    });

    it.each([
      ['false', false],
      ['an empty string', ''],
      ['null', null],
    ])('falls back to the icon and default label when children is %s', (_label, children) => {
      render(
        <Alert>
          <Alert.Close>{children}</Alert.Close>
        </Alert>,
      );

      const close = screen.getByRole('button', { name: 'Close' });
      expect(close).toHaveAttribute('aria-label', 'Close');
      expect(close.querySelector('svg')).not.toBeNull();
    });

    it('defaults to type="button" so it never submits a surrounding form', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn((event: FormEvent) => event.preventDefault());
      const onClose = vi.fn();

      render(
        <form onSubmit={onSubmit}>
          <Alert onClose={onClose}>
            <Alert.Close />
          </Alert>
        </form>,
      );

      await user.click(screen.getByRole('button', { name: 'Close' }));

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('keeps a consumer-provided type', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn((event: FormEvent) => event.preventDefault());

      render(
        <form onSubmit={onSubmit}>
          <Alert>
            <Alert.Close type="submit" />
          </Alert>
        </form>,
      );

      const close = screen.getByRole('button', { name: 'Close' });
      expect(close).toHaveAttribute('type', 'submit');

      await user.click(close);
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('does not force a type attribute when rendered through as, but still closes', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <Alert onClose={onClose}>
          <Alert.Close as="span" data-testid="custom-close" />
        </Alert>,
      );

      const close = screen.getByTestId('custom-close');
      expect(close.tagName).toBe('SPAN');
      expect(close).toHaveClass('tk-alert-close');
      expect(close).not.toHaveAttribute('type');
      expect(close).toHaveAttribute('aria-label', 'Close');

      await user.click(close);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('keeps a consumer aria-label alongside custom text children', () => {
      render(
        <Alert>
          <Alert.Close aria-label="Dismiss gate alert">Dismiss</Alert.Close>
        </Alert>,
      );

      const close = screen.getByRole('button', { name: 'Dismiss gate alert' });
      expect(close).toHaveAttribute('aria-label', 'Dismiss gate alert');
      expect(close).toHaveTextContent('Dismiss');
      expect(close.querySelector('svg')).toBeNull();
    });

    it('blocks pointer and keyboard dismissal while the close control is disabled', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <>
          <Alert onClose={onClose}>
            <Alert.Close disabled />
          </Alert>
          <button type="button">Next</button>
        </>,
      );

      const close = screen.getByRole('button', { name: 'Close' });
      expect(close).toBeDisabled();

      await user.click(close);
      expect(onClose).not.toHaveBeenCalled();

      await user.tab();
      expect(close).not.toHaveFocus();
      expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus();

      close.focus();
      expect(close).not.toHaveFocus();
      await user.keyboard('{Enter} ');
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('callbacks', () => {
    it('calls onClose exactly once per click, with no arguments', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <Alert onClose={onClose}>
          <Alert.Content>
            <Alert.Title>Dismissible</Alert.Title>
          </Alert.Content>
          <Alert.Close />
        </Alert>,
      );

      const close = screen.getByRole('button', { name: 'Close' });
      await user.click(close);
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onClose.mock.calls[0]).toEqual([]);

      await user.click(close);
      expect(onClose).toHaveBeenCalledTimes(2);
    });

    it('does not call onClose when other parts of the alert are clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <Alert onClose={onClose}>
          <Alert.Content>
            <Alert.Title>Dismissible</Alert.Title>
          </Alert.Content>
          <Alert.Actions>
            <Button appearance="text">Details</Button>
          </Alert.Actions>
          <Alert.Close />
        </Alert>,
      );

      await user.click(screen.getByRole('heading', { name: 'Dismissible' }));
      await user.click(screen.getByRole('button', { name: 'Details' }));

      expect(onClose).not.toHaveBeenCalled();
    });

    it('calls onClose on keyboard activation with Enter and Space', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <Alert onClose={onClose}>
          <Alert.Close />
        </Alert>,
      );

      await user.tab();
      expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(onClose).toHaveBeenCalledTimes(1);

      await user.keyboard(' ');
      expect(onClose).toHaveBeenCalledTimes(2);
    });

    it('runs the consumer onClick and slotProps.root.onClick with the click event before onClose', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onClick = vi.fn();
      const slotOnClick = vi.fn();

      render(
        <Alert onClose={onClose}>
          <Alert.Close onClick={onClick} slotProps={{ root: { onClick: slotOnClick } }} />
        </Alert>,
      );

      await user.click(screen.getByRole('button', { name: 'Close' }));

      expect(onClick).toHaveBeenCalledTimes(1);
      expect(slotOnClick).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);

      const clickEvent = onClick.mock.calls[0][0] as MouseEvent<HTMLButtonElement>;
      expect(clickEvent.type).toBe('click');
      expect(slotOnClick.mock.calls[0][0]).toBe(clickEvent);

      expect(onClick.mock.invocationCallOrder[0]).toBeLessThan(slotOnClick.mock.invocationCallOrder[0]);
      expect(slotOnClick.mock.invocationCallOrder[0]).toBeLessThan(onClose.mock.invocationCallOrder[0]);
    });

    it('still calls onClose when a decorative onClick calls preventDefault', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <Alert onClose={onClose}>
          <Alert.Close onClick={event => event.preventDefault()} slotProps={{ root: { onClick: (event: MouseEvent<HTMLElement>) => event.preventDefault() } }} />
        </Alert>,
      );

      await user.click(screen.getByRole('button', { name: 'Close' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('stays clickable without an onClose handler on the root', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      render(
        <Alert>
          <Alert.Close onClick={onClick} />
        </Alert>,
      );

      await user.click(screen.getByRole('button', { name: 'Close' }));
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('does not remove itself — visibility stays owned by the parent', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <Alert onClose={onClose}>
          <Alert.Content>
            <Alert.Title>Still here</Alert.Title>
          </Alert.Content>
          <Alert.Close />
        </Alert>,
      );

      await user.click(screen.getByRole('button', { name: 'Close' }));

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Still here' })).toBeInTheDocument();
    });

    it('supports parent-controlled dismissal and re-opening through onClose', async () => {
      const user = userEvent.setup();

      const DismissibleAlert = () => {
        const [visible, setVisible] = useState(true);

        return visible ? (
          <Alert variant="info" appearance="outlined" onClose={() => setVisible(false)}>
            <Alert.Content>
              <Alert.Title>Dismissible alert</Alert.Title>
            </Alert.Content>
            <Alert.Close aria-label="Close alert" />
          </Alert>
        ) : (
          <button type="button" onClick={() => setVisible(true)}>
            Show alert
          </button>
        );
      };

      render(<DismissibleAlert />);

      await user.click(screen.getByRole('button', { name: 'Close alert' }));
      expect(screen.queryByRole('status')).toBeNull();

      await user.click(screen.getByRole('button', { name: 'Show alert' }));
      expect(screen.getByRole('status')).toHaveAttribute('data-variant', 'info');
      expect(screen.getByRole('heading', { name: 'Dismissible alert' })).toBeInTheDocument();
    });

    it('calls the latest onClose after the root re-renders with a new handler', async () => {
      const user = userEvent.setup();
      const firstClose = vi.fn();
      const secondClose = vi.fn();

      const { rerender } = render(
        <Alert onClose={firstClose}>
          <Alert.Close />
        </Alert>,
      );

      rerender(
        <Alert onClose={secondClose}>
          <Alert.Close />
        </Alert>,
      );

      await user.click(screen.getByRole('button', { name: 'Close' }));

      expect(secondClose).toHaveBeenCalledTimes(1);
      expect(firstClose).not.toHaveBeenCalled();
    });

    it('scopes Alert.Close to the onClose of its nearest Alert when alerts are nested', async () => {
      const user = userEvent.setup();
      const outerClose = vi.fn();
      const innerClose = vi.fn();

      render(
        <Alert onClose={outerClose} aria-label="Outer">
          <Alert role="alert" onClose={innerClose}>
            <Alert.Close aria-label="Close inner" />
          </Alert>
          <Alert.Close aria-label="Close outer" />
        </Alert>,
      );

      await user.click(screen.getByRole('button', { name: 'Close inner' }));
      expect(innerClose).toHaveBeenCalledTimes(1);
      expect(outerClose).not.toHaveBeenCalled();

      await user.click(screen.getByRole('button', { name: 'Close outer' }));
      expect(outerClose).toHaveBeenCalledTimes(1);
      expect(innerClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('customization', () => {
    it('merges className, classNames and slotProps onto each part owner node', () => {
      render(
        <Alert className="root-extra" classNames={{ root: 'root-slot' }} slotProps={{ root: { title: 'root-title' } }}>
          <Alert.Content className="content-extra" classNames={{ root: 'content-slot' }} slotProps={{ root: { title: 'content-title' } }}>
            <Alert.Title className="title-extra" classNames={{ root: 'title-slot' }} slotProps={{ root: { title: 'title-title' } }}>
              Gate changed
            </Alert.Title>
            <Alert.Description className="description-extra" classNames={{ root: 'description-slot' }} slotProps={{ root: { title: 'description-title' } }}>
              New gate A8.
            </Alert.Description>
          </Alert.Content>
          <Alert.Actions className="actions-extra" classNames={{ root: 'actions-slot' }} slotProps={{ root: { title: 'actions-title' } }}>
            <Button appearance="text">Details</Button>
          </Alert.Actions>
          <Alert.Close className="close-extra" classNames={{ root: 'close-slot' }} slotProps={{ root: { title: 'close-title' } }} />
        </Alert>,
      );

      const root = screen.getByRole('status');
      expect(root).toHaveClass('tk-alert', 'root-extra', 'root-slot');
      expect(root).toHaveAttribute('title', 'root-title');

      const content = root.querySelector('.tk-alert-content');
      expect(content).toHaveClass('content-extra', 'content-slot');
      expect(content).toHaveAttribute('title', 'content-title');
      expect(root).not.toHaveClass('content-extra');

      const title = screen.getByRole('heading', { name: 'Gate changed' });
      expect(title).toHaveClass('tk-alert-title', 'title-extra', 'title-slot');
      expect(title).toHaveAttribute('title', 'title-title');
      expect(content).not.toHaveClass('title-extra');

      const description = screen.getByText('New gate A8.');
      expect(description).toHaveClass('tk-alert-description', 'description-extra', 'description-slot');
      expect(description).toHaveAttribute('title', 'description-title');

      const actions = root.querySelector('.tk-alert-actions');
      expect(actions).toHaveClass('actions-extra', 'actions-slot');
      expect(actions).toHaveAttribute('title', 'actions-title');

      const close = screen.getByRole('button', { name: 'Close' });
      expect(close).toHaveClass('tk-alert-close', 'close-extra', 'close-slot');
      expect(close).toHaveAttribute('title', 'close-title');
    });

    it('keeps the canonical data-slot and state attributes when slotProps try to override them', () => {
      const rootHijack: SlotAttrs = { 'data-slot': 'hijack', 'data-variant': 'danger', 'data-type': 'gradient' };
      const titleHijack: SlotAttrs = { 'data-slot': 'hijack' };

      render(
        <Alert variant="success" appearance="outlined" slotProps={{ root: rootHijack }}>
          <Alert.Content>
            <Alert.Title slotProps={{ root: titleHijack }}>Saved</Alert.Title>
          </Alert.Content>
        </Alert>,
      );

      const root = screen.getByRole('status');
      expect(root).toHaveAttribute('data-slot', 'root');
      expect(root).toHaveAttribute('data-variant', 'success');
      expect(root).toHaveAttribute('data-type', 'outlined');
      expect(screen.getByRole('heading', { name: 'Saved' })).toHaveAttribute('data-slot', 'root');
    });

    it('applies provider theme defaultProps below instance props', () => {
      render(
        <TakeoffSparProvider
          components={{
            Alert: { defaultProps: { variant: 'info', appearance: 'outlined' } },
            AlertTitle: { defaultProps: { level: 3 } },
          }}
        >
          <Alert appearance="gradient">
            <Alert.Content>
              <Alert.Title>Themed title</Alert.Title>
              <Alert.Title level={6}>Instance title</Alert.Title>
            </Alert.Content>
          </Alert>
        </TakeoffSparProvider>,
      );

      const root = screen.getByRole('status');
      expect(root).toHaveAttribute('data-variant', 'info');
      expect(root).toHaveAttribute('data-type', 'gradient');
      expect(screen.getByRole('heading', { level: 3, name: 'Themed title' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 6, name: 'Instance title' })).toBeInTheDocument();
    });

    it('layers provider theme classes and slotProps under the instance for every part', () => {
      render(
        <TakeoffSparProvider
          components={{
            Alert: { className: 'theme-root', slotProps: { root: { title: 'theme-root' } } },
            AlertContent: { classNames: { root: 'theme-content' } },
            AlertTitle: { classNames: { root: 'theme-title' } },
            AlertDescription: { classNames: { root: 'theme-description' } },
            AlertActions: { classNames: { root: 'theme-actions' } },
            AlertClose: { classNames: { root: 'theme-close' }, slotProps: { root: { title: 'theme-close' } } },
          }}
        >
          <Alert className="instance-root" slotProps={{ root: { title: 'instance-root' } }}>
            <Alert.Content className="instance-content">
              <Alert.Title>Gate changed</Alert.Title>
              <Alert.Description>New gate A8.</Alert.Description>
            </Alert.Content>
            <Alert.Actions>
              <Button appearance="text">Details</Button>
            </Alert.Actions>
            <Alert.Close />
          </Alert>
        </TakeoffSparProvider>,
      );

      const root = screen.getByRole('status');
      expect(root).toHaveClass('tk-alert', 'theme-root', 'instance-root');
      expect(root).toHaveAttribute('title', 'instance-root');

      expect(root.querySelector('.tk-alert-content')).toHaveClass('theme-content', 'instance-content');
      expect(screen.getByRole('heading', { name: 'Gate changed' })).toHaveClass('tk-alert-title', 'theme-title');
      expect(screen.getByText('New gate A8.')).toHaveClass('tk-alert-description', 'theme-description');
      expect(root.querySelector('.tk-alert-actions')).toHaveClass('theme-actions');

      const close = screen.getByRole('button', { name: 'Close' });
      expect(close).toHaveClass('tk-alert-close', 'theme-close');
      expect(close).toHaveAttribute('title', 'theme-close');
    });

    it('lets instance slotProps win over theme slotProps on a part while keeping the other theme keys', () => {
      render(
        <TakeoffSparProvider
          components={{
            AlertClose: { slotProps: { root: { title: 'theme-close', lang: 'tr' } } },
            AlertTitle: { className: 'theme-title-shortcut' },
          }}
        >
          <Alert>
            <Alert.Content>
              <Alert.Title classNames={{ root: 'instance-title' }}>Gate changed</Alert.Title>
            </Alert.Content>
            <Alert.Close slotProps={{ root: { title: 'instance-close' } }} />
          </Alert>
        </TakeoffSparProvider>,
      );

      const close = screen.getByRole('button', { name: 'Close' });
      expect(close).toHaveAttribute('title', 'instance-close');
      expect(close).toHaveAttribute('lang', 'tr');

      expect(screen.getByRole('heading', { name: 'Gate changed' })).toHaveClass('tk-alert-title', 'theme-title-shortcut', 'instance-title');
    });

    it('runs a provider theme slotProps.root.onClick on Alert.Close without swallowing onClose', async () => {
      const user = userEvent.setup();
      const themeOnClick = vi.fn();
      const onClose = vi.fn();

      render(
        <TakeoffSparProvider components={{ AlertClose: { slotProps: { root: { onClick: themeOnClick } } } }}>
          <Alert onClose={onClose}>
            <Alert.Close />
          </Alert>
        </TakeoffSparProvider>,
      );

      await user.click(screen.getByRole('button', { name: 'Close' }));

      expect(themeOnClick).toHaveBeenCalledTimes(1);
      expect((themeOnClick.mock.calls[0][0] as MouseEvent<HTMLElement>).type).toBe('click');
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(themeOnClick.mock.invocationCallOrder[0]).toBeLessThan(onClose.mock.invocationCallOrder[0]);
    });
  });

  describe('context boundaries', () => {
    it('throws a descriptive error when Alert.Close renders outside the root', () => {
      expect(() => render(<Alert.Close />)).toThrow(/Alert\.Close must be used within AlertProvider/);
    });
  });

  describe('accessibility', () => {
    it('has no a11y violations for the full dismissible anatomy', async () => {
      const { container } = render(
        <Alert variant="warning" appearance="outlined" onClose={() => {}}>
          <Alert.Content>
            <Alert.Title>Payment requires attention</Alert.Title>
            <Alert.Description>Update your billing method to avoid service interruption.</Alert.Description>
          </Alert.Content>
          <Alert.Actions>
            <Button size="small" variant="neutral" appearance="text">
              Later
            </Button>
            <Button size="small" variant="warning">
              Update
            </Button>
          </Alert.Actions>
          <Alert.Close />
        </Alert>,
      );

      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no a11y violations for an assertive alert with a text close control', async () => {
      const { container } = render(
        <Alert role="alert" variant="danger" appearance="gradient">
          <Alert.Content>
            <Alert.Title level={2}>Payment failed</Alert.Title>
            <Alert.Description>Please try another card.</Alert.Description>
          </Alert.Content>
          <Alert.Close>Dismiss</Alert.Close>
        </Alert>,
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
