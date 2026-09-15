import { createRef, type HTMLAttributes } from 'react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';

import { TakeoffSparProvider } from '../../provider';
import { render, screen, within } from '../../test-utils';

import { Card, type CardFooterType, type CardHeaderType } from './index';

const renderAnatomy = () =>
  render(
    <Card>
      <Card.Header>
        <Card.Title>Flight Summary</Card.Title>
      </Card.Header>
      <Card.Body>
        <Card.Description>IST to LHR · 18 Jun 2026</Card.Description>
      </Card.Body>
      <Card.Footer>
        <button type="button">Details</button>
        <button type="button">Check in</button>
      </Card.Footer>
    </Card>,
  );

const part = (container: HTMLElement, className: string) => container.querySelector(`.${className}`) as HTMLElement;

describe('Card (compound)', () => {
  describe('rendering', () => {
    it('renders every part on its canonical owner node with the tk-* class and data-slot="root"', () => {
      const { container } = renderAnatomy();

      const root = container.firstElementChild as HTMLElement;
      expect(root.tagName).toBe('DIV');
      expect(root).toHaveClass('tk-card');
      expect(root).toHaveAttribute('data-slot', 'root');

      const header = part(container, 'tk-card-header');
      expect(header.tagName).toBe('DIV');
      expect(header).toHaveAttribute('data-slot', 'root');
      expect(header.parentElement).toBe(root);

      const title = screen.getByRole('heading', { level: 5, name: 'Flight Summary' });
      expect(title.tagName).toBe('H5');
      expect(title).toHaveClass('tk-card-title');
      expect(title).toHaveAttribute('data-slot', 'root');
      expect(title.parentElement).toBe(header);

      const body = part(container, 'tk-card-body');
      expect(body.tagName).toBe('DIV');
      expect(body).toHaveAttribute('data-slot', 'root');
      expect(body.parentElement).toBe(root);

      const description = screen.getByText('IST to LHR · 18 Jun 2026');
      expect(description.tagName).toBe('P');
      expect(description).toHaveClass('tk-card-description');
      expect(description).toHaveAttribute('data-slot', 'root');
      expect(description.parentElement).toBe(body);

      const footer = part(container, 'tk-card-footer');
      expect(footer.tagName).toBe('DIV');
      expect(footer).toHaveAttribute('data-slot', 'root');
      expect(footer.parentElement).toBe(root);
      expect(
        within(footer)
          .getAllByRole('button')
          .map(button => button.textContent),
      ).toEqual(['Details', 'Check in']);
    });

    it('renders a neutral root without implicit landmark, article or interactive semantics', () => {
      const { container } = renderAnatomy();

      const root = part(container, 'tk-card');
      expect(root).not.toHaveAttribute('role');
      expect(root).not.toHaveAttribute('tabindex');
      expect(screen.queryByRole('article')).not.toBeInTheDocument();
      expect(screen.queryByRole('region')).not.toBeInTheDocument();
      expect(screen.queryByRole('group')).not.toBeInTheDocument();
    });

    it('emits the default headerType, footerType and level data attributes on their owners only', () => {
      const { container } = renderAnatomy();

      expect(part(container, 'tk-card-header')).toHaveAttribute('data-header-type', 'basic');
      expect(part(container, 'tk-card-footer')).toHaveAttribute('data-footer-type', 'basic');
      expect(part(container, 'tk-card-title')).toHaveAttribute('data-level', '5');

      const root = part(container, 'tk-card');
      expect(root).not.toHaveAttribute('data-header-type');
      expect(root).not.toHaveAttribute('data-footer-type');
      expect(root).not.toHaveAttribute('data-level');
      expect(part(container, 'tk-card-body')).not.toHaveAttribute('data-level');
      expect(part(container, 'tk-card-description')).not.toHaveAttribute('data-level');
    });

    it('renders children of a childless-by-default part without adding wrappers', () => {
      const { container } = render(
        <Card>
          <Card.Body>
            <span>Plain content</span>
          </Card.Body>
        </Card>,
      );

      const body = part(container, 'tk-card-body');
      expect(body.children).toHaveLength(1);
      expect(body.firstElementChild).toBe(screen.getByText('Plain content'));
    });

    it('renders consumer children as the direct children of every part, in order', () => {
      const { container } = render(
        <Card>
          <Card.Header>
            <Card.Title>
              <em>Title text</em>
            </Card.Title>
          </Card.Header>
          <Card.Body>
            <Card.Description>
              <em>Description text</em>
            </Card.Description>
            <em>Body extra</em>
          </Card.Body>
          <Card.Footer>
            <em>Footer text</em>
          </Card.Footer>
        </Card>,
      );

      const root = part(container, 'tk-card');
      const header = part(container, 'tk-card-header');
      const title = part(container, 'tk-card-title');
      const body = part(container, 'tk-card-body');
      const description = part(container, 'tk-card-description');
      const footer = part(container, 'tk-card-footer');

      expect(Array.from(root.children)).toEqual([header, body, footer]);
      expect(Array.from(header.children)).toEqual([title]);
      expect(Array.from(title.children)).toEqual([screen.getByText('Title text')]);
      expect(Array.from(body.children)).toEqual([description, screen.getByText('Body extra')]);
      expect(Array.from(description.children)).toEqual([screen.getByText('Description text')]);
      expect(Array.from(footer.children)).toEqual([screen.getByText('Footer text')]);
    });
  });

  describe('Card.Header', () => {
    it.each<CardHeaderType>(['basic', 'divided', 'light', 'dark', 'primary'])('reflects headerType="%s" into data-header-type', headerType => {
      const { container } = render(
        <Card>
          <Card.Header headerType={headerType}>
            <Card.Title>Payment</Card.Title>
          </Card.Header>
        </Card>,
      );

      const header = part(container, 'tk-card-header');
      expect(header).toHaveAttribute('data-header-type', headerType);
      expect(header).not.toHaveAttribute('headerType');
    });
  });

  describe('Card.Footer', () => {
    it.each<CardFooterType>(['basic', 'divided', 'light'])('reflects footerType="%s" into data-footer-type', footerType => {
      const { container } = render(
        <Card>
          <Card.Footer footerType={footerType}>
            <button type="button">Confirm</button>
          </Card.Footer>
        </Card>,
      );

      const footer = part(container, 'tk-card-footer');
      expect(footer).toHaveAttribute('data-footer-type', footerType);
      expect(footer).not.toHaveAttribute('footerType');
    });
  });

  describe('Card.Title', () => {
    it.each([1, 2, 3, 4, 5, 6] as const)('renders an h%i heading with a matching data-level', level => {
      render(
        <Card>
          <Card.Header>
            <Card.Title level={level}>Account overview</Card.Title>
          </Card.Header>
        </Card>,
      );

      const heading = screen.getByRole('heading', { level, name: 'Account overview' });
      expect(heading.tagName).toBe(`H${level}`);
      expect(heading).toHaveAttribute('data-level', String(level));
      expect(heading).not.toHaveAttribute('level');
    });

    it('renders the as element instead of a heading and omits data-level', () => {
      render(
        <Card>
          <Card.Header>
            <Card.Title as="div" level={2}>
              Account overview
            </Card.Title>
          </Card.Header>
        </Card>,
      );

      expect(screen.queryByRole('heading')).not.toBeInTheDocument();

      const title = screen.getByText('Account overview');
      expect(title.tagName).toBe('DIV');
      expect(title).toHaveClass('tk-card-title');
      expect(title).toHaveAttribute('data-slot', 'root');
      expect(title).not.toHaveAttribute('data-level');
      expect(title).not.toHaveAttribute('level');
    });

    it('lets an explicit heading element passed through as win over level', () => {
      render(
        <Card>
          <Card.Header>
            <Card.Title as="h2" level={4}>
              Overview
            </Card.Title>
          </Card.Header>
        </Card>,
      );

      const heading = screen.getByRole('heading', { level: 2, name: 'Overview' });
      expect(heading.tagName).toBe('H2');
      expect(screen.queryByRole('heading', { level: 4 })).not.toBeInTheDocument();
      expect(heading).not.toHaveAttribute('data-level');
    });
  });

  describe('polymorphism, refs and native props', () => {
    it('renders every part as a custom element through as while keeping the canonical hooks', () => {
      const { container } = render(
        <Card aria-labelledby="flight-title" as="article">
          <Card.Header as="header" headerType="primary">
            <Card.Title id="flight-title" level={2}>
              Flight Summary
            </Card.Title>
          </Card.Header>
          <Card.Body as="section">
            <Card.Description as="span">IST to LHR</Card.Description>
          </Card.Body>
          <Card.Footer as="footer" footerType="divided">
            <button type="button">Check in</button>
          </Card.Footer>
        </Card>,
      );

      const article = screen.getByRole('article', { name: 'Flight Summary' });
      expect(article).toHaveClass('tk-card');
      expect(article).toHaveAttribute('data-slot', 'root');

      const header = part(container, 'tk-card-header');
      expect(header.tagName).toBe('HEADER');
      expect(header).toHaveAttribute('data-slot', 'root');
      expect(header).toHaveAttribute('data-header-type', 'primary');

      const body = part(container, 'tk-card-body');
      expect(body.tagName).toBe('SECTION');
      expect(body).toHaveAttribute('data-slot', 'root');

      const description = screen.getByText('IST to LHR');
      expect(description.tagName).toBe('SPAN');
      expect(description).toHaveClass('tk-card-description');
      expect(description).toHaveAttribute('data-slot', 'root');

      const footer = part(container, 'tk-card-footer');
      expect(footer.tagName).toBe('FOOTER');
      expect(footer).toHaveAttribute('data-slot', 'root');
      expect(footer).toHaveAttribute('data-footer-type', 'divided');
    });

    it('forwards refs to the DOM node of every part', () => {
      const cardRef = createRef<HTMLDivElement>();
      const headerRef = createRef<HTMLDivElement>();
      const titleRef = createRef<HTMLHeadingElement>();
      const bodyRef = createRef<HTMLDivElement>();
      const descriptionRef = createRef<HTMLParagraphElement>();
      const footerRef = createRef<HTMLDivElement>();

      render(
        <Card ref={cardRef}>
          <Card.Header ref={headerRef}>
            <Card.Title ref={titleRef}>Title</Card.Title>
          </Card.Header>
          <Card.Body ref={bodyRef}>
            <Card.Description ref={descriptionRef}>Description</Card.Description>
          </Card.Body>
          <Card.Footer ref={footerRef}>Footer</Card.Footer>
        </Card>,
      );

      expect(cardRef.current).toBeInstanceOf(HTMLDivElement);
      expect(cardRef.current).toHaveClass('tk-card');
      expect(headerRef.current).toBeInstanceOf(HTMLDivElement);
      expect(headerRef.current).toHaveClass('tk-card-header');
      expect(titleRef.current).toBeInstanceOf(HTMLHeadingElement);
      expect(titleRef.current).toHaveClass('tk-card-title');
      expect(bodyRef.current).toBeInstanceOf(HTMLDivElement);
      expect(bodyRef.current).toHaveClass('tk-card-body');
      expect(descriptionRef.current).toBeInstanceOf(HTMLParagraphElement);
      expect(descriptionRef.current).toHaveClass('tk-card-description');
      expect(footerRef.current).toBeInstanceOf(HTMLDivElement);
      expect(footerRef.current).toHaveClass('tk-card-footer');
    });

    it('forwards native attributes to the owner node of every part', () => {
      render(
        <Card aria-describedby="card-description" aria-labelledby="card-title" as="section" id="card">
          <Card.Header id="card-header">
            <Card.Title id="card-title">Payment</Card.Title>
          </Card.Header>
          <Card.Body id="card-body">
            <Card.Description id="card-description">Card ending in 4242</Card.Description>
          </Card.Body>
          <Card.Footer id="card-footer">Footer</Card.Footer>
        </Card>,
      );

      const region = screen.getByRole('region', { name: 'Payment' });
      expect(region).toHaveAttribute('id', 'card');
      expect(region).toHaveAccessibleDescription('Card ending in 4242');
      expect(region.querySelector('#card-header')).toHaveClass('tk-card-header');
      expect(screen.getByRole('heading', { name: 'Payment' })).toHaveAttribute('id', 'card-title');
      expect(region.querySelector('#card-body')).toHaveClass('tk-card-body');
      expect(region.querySelector('#card-description')).toHaveClass('tk-card-description');
      expect(region.querySelector('#card-footer')).toHaveClass('tk-card-footer');
    });
  });

  describe('customization', () => {
    it('merges className and classNames.root with the canonical class on every part', () => {
      const { container } = render(
        <Card className="card-instance" classNames={{ root: 'card-classnames' }}>
          <Card.Header className="header-instance" classNames={{ root: 'header-classnames' }}>
            <Card.Title className="title-instance" classNames={{ root: 'title-classnames' }}>
              Title
            </Card.Title>
          </Card.Header>
          <Card.Body className="body-instance" classNames={{ root: 'body-classnames' }}>
            <Card.Description className="description-instance" classNames={{ root: 'description-classnames' }}>
              Description
            </Card.Description>
          </Card.Body>
          <Card.Footer className="footer-instance" classNames={{ root: 'footer-classnames' }}>
            Footer
          </Card.Footer>
        </Card>,
      );

      expect(part(container, 'tk-card')).toHaveClass('tk-card', 'card-instance', 'card-classnames');
      expect(part(container, 'tk-card-header')).toHaveClass('tk-card-header', 'header-instance', 'header-classnames');
      expect(part(container, 'tk-card-title')).toHaveClass('tk-card-title', 'title-instance', 'title-classnames');
      expect(part(container, 'tk-card-body')).toHaveClass('tk-card-body', 'body-instance', 'body-classnames');
      expect(part(container, 'tk-card-description')).toHaveClass('tk-card-description', 'description-instance', 'description-classnames');
      expect(part(container, 'tk-card-footer')).toHaveClass('tk-card-footer', 'footer-instance', 'footer-classnames');

      // Instance classes stay on their own owner node.
      expect(part(container, 'tk-card')).not.toHaveClass('header-instance');
      expect(part(container, 'tk-card-header')).not.toHaveClass('card-instance');
    });

    it('applies slotProps.root to the owner node of every part', () => {
      const { container } = render(
        <Card slotProps={{ root: { title: 'card-slot' } }}>
          <Card.Header slotProps={{ root: { title: 'header-slot' } }}>
            <Card.Title slotProps={{ root: { title: 'title-slot' } }}>Title</Card.Title>
          </Card.Header>
          <Card.Body slotProps={{ root: { title: 'body-slot' } }}>
            <Card.Description slotProps={{ root: { title: 'description-slot' } }}>Description</Card.Description>
          </Card.Body>
          <Card.Footer slotProps={{ root: { title: 'footer-slot' } }}>Footer</Card.Footer>
        </Card>,
      );

      expect(part(container, 'tk-card')).toHaveAttribute('title', 'card-slot');
      expect(part(container, 'tk-card-header')).toHaveAttribute('title', 'header-slot');
      expect(part(container, 'tk-card-title')).toHaveAttribute('title', 'title-slot');
      expect(part(container, 'tk-card-body')).toHaveAttribute('title', 'body-slot');
      expect(part(container, 'tk-card-description')).toHaveAttribute('title', 'description-slot');
      expect(part(container, 'tk-card-footer')).toHaveAttribute('title', 'footer-slot');
    });

    it('keeps data-slot and the state data attributes on top of slotProps.root', () => {
      const hijack = (attrs: Record<string, string>) => ({ root: attrs as HTMLAttributes<HTMLElement> });

      const { container } = render(
        <Card slotProps={hijack({ 'data-slot': 'card' })}>
          <Card.Header slotProps={hijack({ 'data-slot': 'header', 'data-header-type': 'dark' })}>
            <Card.Title slotProps={hijack({ 'data-slot': 'title', 'data-level': '1' })}>Title</Card.Title>
          </Card.Header>
          <Card.Body slotProps={hijack({ 'data-slot': 'body' })}>
            <Card.Description slotProps={hijack({ 'data-slot': 'description' })}>Description</Card.Description>
          </Card.Body>
          <Card.Footer footerType="light" slotProps={hijack({ 'data-slot': 'footer', 'data-footer-type': 'divided' })}>
            Footer
          </Card.Footer>
        </Card>,
      );

      for (const className of ['tk-card', 'tk-card-header', 'tk-card-title', 'tk-card-body', 'tk-card-description', 'tk-card-footer']) {
        expect(part(container, className)).toHaveAttribute('data-slot', 'root');
      }
      expect(part(container, 'tk-card-header')).toHaveAttribute('data-header-type', 'basic');
      expect(part(container, 'tk-card-title')).toHaveAttribute('data-level', '5');
      expect(part(container, 'tk-card-footer')).toHaveAttribute('data-footer-type', 'light');
    });

    it('applies provider defaultProps below instance props', () => {
      const components = {
        CardHeader: { defaultProps: { headerType: 'dark' as const } },
        CardFooter: { defaultProps: { footerType: 'light' as const } },
        CardTitle: { defaultProps: { level: 3 as const } },
      };

      const inherited = render(
        <TakeoffSparProvider components={components}>
          <Card>
            <Card.Header>
              <Card.Title>Inherited</Card.Title>
            </Card.Header>
            <Card.Footer>Footer</Card.Footer>
          </Card>
        </TakeoffSparProvider>,
      );

      const inheritedHeading = screen.getByRole('heading', { name: 'Inherited' });
      expect(inheritedHeading.tagName).toBe('H3');
      expect(inheritedHeading).toHaveAttribute('data-level', '3');
      expect(part(inherited.container, 'tk-card-header')).toHaveAttribute('data-header-type', 'dark');
      expect(part(inherited.container, 'tk-card-footer')).toHaveAttribute('data-footer-type', 'light');

      const overridden = render(
        <TakeoffSparProvider components={components}>
          <Card>
            <Card.Header headerType="primary">
              <Card.Title level={2}>Overridden</Card.Title>
            </Card.Header>
            <Card.Footer footerType="divided">Footer</Card.Footer>
          </Card>
        </TakeoffSparProvider>,
      );

      const overriddenHeading = screen.getByRole('heading', { name: 'Overridden' });
      expect(overriddenHeading.tagName).toBe('H2');
      expect(overriddenHeading).toHaveAttribute('data-level', '2');
      expect(part(overridden.container, 'tk-card-header')).toHaveAttribute('data-header-type', 'primary');
      expect(part(overridden.container, 'tk-card-footer')).toHaveAttribute('data-footer-type', 'divided');
    });

    it('layers provider className, classNames and slotProps under the instance on every part', () => {
      const { container } = render(
        <TakeoffSparProvider
          components={{
            Card: { className: 'theme-card', slotProps: { root: { title: 'Theme card' } } },
            CardHeader: { classNames: { root: 'theme-header' }, slotProps: { root: { title: 'Theme header' } } },
            CardTitle: { classNames: { root: 'theme-title' } },
            CardDescription: { classNames: { root: 'theme-description' } },
            CardBody: { classNames: { root: 'theme-body' } },
            CardFooter: { classNames: { root: 'theme-footer' } },
          }}
        >
          <Card className="instance-card" slotProps={{ root: { title: 'Instance card' } }}>
            <Card.Header classNames={{ root: 'instance-header' }}>
              <Card.Title className="instance-title">Title</Card.Title>
            </Card.Header>
            <Card.Body>
              <Card.Description>Description</Card.Description>
            </Card.Body>
            <Card.Footer>Footer</Card.Footer>
          </Card>
        </TakeoffSparProvider>,
      );

      const root = part(container, 'tk-card');
      expect(root).toHaveClass('tk-card', 'theme-card', 'instance-card');
      expect(root).toHaveAttribute('title', 'Instance card');

      const header = part(container, 'tk-card-header');
      expect(header).toHaveClass('tk-card-header', 'theme-header', 'instance-header');
      expect(header).toHaveAttribute('title', 'Theme header');

      expect(part(container, 'tk-card-title')).toHaveClass('tk-card-title', 'theme-title', 'instance-title');
      expect(part(container, 'tk-card-body')).toHaveClass('tk-card-body', 'theme-body');
      expect(part(container, 'tk-card-description')).toHaveClass('tk-card-description', 'theme-description');
      expect(part(container, 'tk-card-footer')).toHaveClass('tk-card-footer', 'theme-footer');
    });

    it('keeps each part instance class on its own owner node only', () => {
      const classes = {
        'tk-card': 'own-card',
        'tk-card-header': 'own-header',
        'tk-card-title': 'own-title',
        'tk-card-body': 'own-body',
        'tk-card-description': 'own-description',
        'tk-card-footer': 'own-footer',
      } as const;

      const { container } = render(
        <Card className={classes['tk-card']}>
          <Card.Header className={classes['tk-card-header']}>
            <Card.Title className={classes['tk-card-title']}>Title</Card.Title>
          </Card.Header>
          <Card.Body classNames={{ root: classes['tk-card-body'] }}>
            <Card.Description classNames={{ root: classes['tk-card-description'] }}>Description</Card.Description>
          </Card.Body>
          <Card.Footer className={classes['tk-card-footer']}>Footer</Card.Footer>
        </Card>,
      );

      for (const [owner, ownClass] of Object.entries(classes)) {
        for (const [other, otherClass] of Object.entries(classes)) {
          const node = part(container, owner);
          if (owner === other) {
            expect(node).toHaveClass(ownClass);
          } else {
            expect(node).not.toHaveClass(otherClass);
          }
        }
      }
    });

    it('applies the provider className shorthand per part and lets instance slotProps win over the theme on sub-parts', () => {
      const { container } = render(
        <TakeoffSparProvider
          components={{
            CardHeader: { className: 'theme-header-shorthand', slotProps: { root: { title: 'Theme header' } } },
            CardTitle: { className: 'theme-title-shorthand', slotProps: { root: { title: 'Theme title' } } },
            CardFooter: { className: 'theme-footer-shorthand', slotProps: { root: { title: 'Theme footer' } } },
          }}
        >
          <Card>
            <Card.Header slotProps={{ root: { title: 'Instance header' } }}>
              <Card.Title slotProps={{ root: { title: 'Instance title' } }}>Title</Card.Title>
            </Card.Header>
            <Card.Footer slotProps={{ root: { title: 'Instance footer' } }}>Footer</Card.Footer>
          </Card>
        </TakeoffSparProvider>,
      );

      const root = part(container, 'tk-card');
      expect(root).not.toHaveClass('theme-header-shorthand');
      expect(root).not.toHaveAttribute('title');

      const header = part(container, 'tk-card-header');
      expect(header).toHaveClass('tk-card-header', 'theme-header-shorthand');
      expect(header).not.toHaveClass('theme-title-shorthand');
      expect(header).toHaveAttribute('title', 'Instance header');

      const title = part(container, 'tk-card-title');
      expect(title).toHaveClass('tk-card-title', 'theme-title-shorthand');
      expect(title).not.toHaveClass('theme-header-shorthand');
      expect(title).toHaveAttribute('title', 'Instance title');

      const footer = part(container, 'tk-card-footer');
      expect(footer).toHaveClass('tk-card-footer', 'theme-footer-shorthand');
      expect(footer).toHaveAttribute('title', 'Instance footer');
    });

    it('drops data-level when an instance as overrides a provider default level', () => {
      render(
        <TakeoffSparProvider components={{ CardTitle: { defaultProps: { level: 2 as const } } }}>
          <Card>
            <Card.Header>
              <Card.Title as="span">Inherited level, custom element</Card.Title>
            </Card.Header>
          </Card>
        </TakeoffSparProvider>,
      );

      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
      const title = screen.getByText('Inherited level, custom element');
      expect(title.tagName).toBe('SPAN');
      expect(title).toHaveClass('tk-card-title');
      expect(title).not.toHaveAttribute('data-level');
    });
  });

  describe('accessibility', () => {
    it('has no axe violations for the canonical anatomy', async () => {
      const { container } = renderAnatomy();
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no axe violations when rendered as a labelled article with styled header and footer', async () => {
      const { container } = render(
        <Card aria-labelledby="delete-title" as="article">
          <Card.Header headerType="divided">
            <Card.Title id="delete-title" level={2}>
              Delete project?
            </Card.Title>
          </Card.Header>
          <Card.Body>
            <Card.Description>This action cannot be undone.</Card.Description>
          </Card.Body>
          <Card.Footer footerType="divided">
            <button type="button">Cancel</button>
            <button type="button">Confirm</button>
          </Card.Footer>
        </Card>,
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
