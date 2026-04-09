import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import type { ComponentPropsWithoutRef, ReactNode, Ref } from 'react';
import { AccordionAdapterContext, type AccordionAdapterContextValue } from './AccordionBase';
import { AccordionItem } from './AccordionItem';

vi.mock('@turkish-technology/spar', () => {
  function MockItem({ value: _value, ref, children, ...props }: ComponentPropsWithoutRef<'div'> & { value?: string; ref?: Ref<HTMLDivElement> }) {
    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    );
  }
  const MockHeader = ({ as: _as, children, ...props }: ComponentPropsWithoutRef<'div'> & { as?: string }) => <div {...props}>{children}</div>;
  const MockTrigger = ({ as: _as, children, ...props }: ComponentPropsWithoutRef<'div'> & { as?: string }) => <div {...props}>{children}</div>;
  const MockContent = ({ forceMount: _forceMount, children, ...props }: ComponentPropsWithoutRef<'div'> & { forceMount?: boolean }) => <div {...props}>{children}</div>;

  const Accordion = Object.assign(() => null, {
    Item: MockItem,
    Header: MockHeader,
    Trigger: MockTrigger,
    Content: MockContent,
  });

  return { Accordion };
});

const defaultContext: AccordionAdapterContextValue = {
  openItemValues: new Set<string>(),
  type: 'grouped',
  mode: 'default',
  arrowPosition: 'right',
  expandIcon: 'keyboard_arrow_down',
  collapseIcon: 'keyboard_arrow_up',
  hideArrows: false,
};

const renderWithAccordionContext = (ui: ReactNode, context: Partial<AccordionAdapterContextValue> = {}) => {
  const mergedContext = { ...defaultContext, ...context };
  return render(<AccordionAdapterContext.Provider value={mergedContext}>{ui}</AccordionAdapterContext.Provider>);
};

describe('AccordionItem', () => {
  describe('rendering', () => {
    it('should render with tk-accordion-item root class', () => {
      const { container } = renderWithAccordionContext(<AccordionItem header="Test">Content</AccordionItem>);
      const root = container.querySelector('[data-slot="root"]')!;
      expect(root).toBeInTheDocument();
      expect(root.className).toContain('tk-accordion-item');
    });

    it('should set data-slot="root" on root element', () => {
      const { container } = renderWithAccordionContext(<AccordionItem header="Test">Content</AccordionItem>);
      const root = container.querySelector('[data-slot="root"]')!;
      expect(root).toHaveAttribute('data-slot', 'root');
    });

    it('should merge custom className', () => {
      const { container } = renderWithAccordionContext(
        <AccordionItem header="Test" className="custom">
          Content
        </AccordionItem>,
      );
      const root = container.querySelector('[data-slot="root"]')!;
      expect(root.className).toContain('tk-accordion-item');
      expect(root.className).toContain('custom');
    });
  });

  describe('variant data attributes', () => {
    it('should set data-type from context', () => {
      const { container } = renderWithAccordionContext(<AccordionItem header="Test">Content</AccordionItem>, { type: 'divided' });
      const root = container.querySelector('[data-slot="root"]')!;
      expect(root).toHaveAttribute('data-type', 'divided');
    });

    it('should set data-size from props', () => {
      const { container } = renderWithAccordionContext(
        <AccordionItem header="Test" size="large">
          Content
        </AccordionItem>,
      );
      const root = container.querySelector('[data-slot="root"]')!;
      expect(root).toHaveAttribute('data-size', 'large');
    });

    it('should default data-size to base', () => {
      const { container } = renderWithAccordionContext(<AccordionItem header="Test">Content</AccordionItem>);
      const root = container.querySelector('[data-slot="root"]')!;
      expect(root).toHaveAttribute('data-size', 'base');
    });

    it('should set data-mode from context', () => {
      const { container } = renderWithAccordionContext(<AccordionItem header="Test">Content</AccordionItem>, { mode: 'compact' });
      const root = container.querySelector('[data-slot="root"]')!;
      expect(root).toHaveAttribute('data-mode', 'compact');
    });
  });

  describe('open state', () => {
    it('should set data-open on root when item is open', () => {
      const { container } = renderWithAccordionContext(
        <AccordionItem header="Test" itemKey={0}>
          Content
        </AccordionItem>,
        { openItemValues: new Set(['n:0']) },
      );
      const root = container.querySelector('[data-slot="root"]')!;
      expect(root).toHaveAttribute('data-open', '');
    });

    it('should not set data-open when item is closed', () => {
      const { container } = renderWithAccordionContext(
        <AccordionItem header="Test" itemKey={0}>
          Content
        </AccordionItem>,
        { openItemValues: new Set() },
      );
      const root = container.querySelector('[data-slot="root"]')!;
      expect(root).not.toHaveAttribute('data-open');
    });

    it('should set data-open on content slot when open', () => {
      const { container } = renderWithAccordionContext(
        <AccordionItem header="Test" itemKey={0}>
          Content
        </AccordionItem>,
        { openItemValues: new Set(['n:0']) },
      );
      const content = container.querySelector('[data-slot="content"]')!;
      expect(content).toHaveAttribute('data-open', '');
    });
  });

  describe('header slot', () => {
    it('should render header content in title slot', () => {
      renderWithAccordionContext(<AccordionItem header="My Header">Content</AccordionItem>);
      const title = screen.getByText('My Header');
      expect(title).toHaveAttribute('data-slot', 'title');
      expect(title.className).toContain('tk-accordion-item-title');
    });

    it('should render header trigger with correct class', () => {
      const { container } = renderWithAccordionContext(<AccordionItem header="Test">Content</AccordionItem>);
      const header = container.querySelector('[data-slot="header"]')!;
      expect(header).toBeInTheDocument();
      expect(header.className).toContain('tk-accordion-item-header');
    });
  });

  describe('content slot', () => {
    it('should render children in content slot', () => {
      const { container } = renderWithAccordionContext(<AccordionItem header="Test">My Content</AccordionItem>);
      const contentSlot = container.querySelector('[data-slot="content"]')!;
      expect(contentSlot).toBeInTheDocument();
      expect(contentSlot.textContent).toContain('My Content');
    });

    it('should have correct content class', () => {
      const { container } = renderWithAccordionContext(<AccordionItem header="Test">Content</AccordionItem>);
      const content = container.querySelector('[data-slot="content"]')!;
      expect(content.className).toContain('tk-accordion-item-content');
    });
  });

  describe('arrow slot', () => {
    it('should render arrow with expand icon when closed', () => {
      const { container } = renderWithAccordionContext(
        <AccordionItem header="Test" itemKey={0}>
          Content
        </AccordionItem>,
        { openItemValues: new Set(), expandIcon: 'keyboard_arrow_down' },
      );
      const arrow = container.querySelector('[data-slot="arrow"]')!;
      expect(arrow).toBeInTheDocument();
      expect(arrow.className).toContain('tk-accordion-item-arrow');
      expect(arrow).toHaveAttribute('aria-hidden', 'true');
      expect(arrow.textContent).toContain('keyboard_arrow_down');
    });

    it('should render arrow with collapse icon when open', () => {
      const { container } = renderWithAccordionContext(
        <AccordionItem header="Test" itemKey={0}>
          Content
        </AccordionItem>,
        { openItemValues: new Set(['n:0']), collapseIcon: 'keyboard_arrow_up' },
      );
      const arrow = container.querySelector('[data-slot="arrow"]')!;
      expect(arrow.textContent).toContain('keyboard_arrow_up');
    });

    it('should not render arrow when hideArrows is true', () => {
      const { container } = renderWithAccordionContext(<AccordionItem header="Test">Content</AccordionItem>, { hideArrows: true });
      const arrow = container.querySelector('[data-slot="arrow"]');
      expect(arrow).toBeNull();
    });

    it('should position arrow on right by default', () => {
      const { container } = renderWithAccordionContext(<AccordionItem header="Test">Content</AccordionItem>, { arrowPosition: 'right' });
      const header = container.querySelector('[data-slot="header"]')!;
      const children = Array.from(header.children);
      const arrowIndex = children.findIndex(c => c.getAttribute('data-slot') === 'arrow');
      const titleIndex = children.findIndex(c => c.getAttribute('data-slot') === 'title');
      expect(arrowIndex).toBeGreaterThan(titleIndex);
    });

    it('should position arrow on left when configured', () => {
      const { container } = renderWithAccordionContext(<AccordionItem header="Test">Content</AccordionItem>, { arrowPosition: 'left' });
      const header = container.querySelector('[data-slot="header"]')!;
      const children = Array.from(header.children);
      const arrowIndex = children.findIndex(c => c.getAttribute('data-slot') === 'arrow');
      const titleIndex = children.findIndex(c => c.getAttribute('data-slot') === 'title');
      expect(arrowIndex).toBeLessThan(titleIndex);
    });
  });

  describe('icon slot', () => {
    it('should render icon with correct slot and class', () => {
      const { container } = renderWithAccordionContext(
        <AccordionItem header="Test" icon={<span data-testid="custom-icon">I</span>}>
          Content
        </AccordionItem>,
      );
      const iconSlot = container.querySelector('[data-slot="icon"]')!;
      expect(iconSlot).toBeInTheDocument();
      expect(iconSlot.className).toContain('tk-accordion-item-icon');
      expect(iconSlot).toHaveAttribute('aria-hidden', 'true');
    });

    it('should render string icon as Material Symbol span', () => {
      renderWithAccordionContext(
        <AccordionItem header="Test" icon="settings">
          Content
        </AccordionItem>,
      );
      const symbolSpan = screen.getByText('settings');
      expect(symbolSpan).toHaveAttribute('data-icon-kind', 'symbol');
      expect(symbolSpan.className).toContain('tk-accordion-item-icon-symbol');
    });

    it('should not render icon slot when no icon provided', () => {
      const { container } = renderWithAccordionContext(<AccordionItem header="Test">Content</AccordionItem>);
      const iconSlot = container.querySelector('[data-slot="icon"]');
      expect(iconSlot).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should throw when used outside Accordion context', () => {
      expect(() => {
        render(<AccordionItem header="Test">Content</AccordionItem>);
      }).toThrow('AccordionItem components must be used within Accordion');
    });
  });

  describe('accessibility', () => {
    it('should have no a11y violations for default item', async () => {
      const { container } = renderWithAccordionContext(<AccordionItem header="Test Header">Content</AccordionItem>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no a11y violations when open', async () => {
      const { container } = renderWithAccordionContext(
        <AccordionItem header="Test" itemKey={0}>
          Content
        </AccordionItem>,
        { openItemValues: new Set(['n:0']) },
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no a11y violations with icon', async () => {
      const { container } = renderWithAccordionContext(
        <AccordionItem header="Settings" icon="settings">
          Content
        </AccordionItem>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
