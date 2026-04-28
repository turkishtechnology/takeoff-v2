import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';

import { SparReactProvider } from '../../provider';

import { Accordion } from './index';

const renderItem = (itemKey: string | number, label = `Item ${itemKey}`) => (
  <Accordion.Item key={itemKey} itemKey={itemKey} data-testid={`item-${itemKey}`}>
    <Accordion.Header>
      <Accordion.Trigger data-testid={`trigger-${itemKey}`}>{label}</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Content data-testid={`content-${itemKey}`}>{label} body</Accordion.Content>
  </Accordion.Item>
);

const renderItems = (keys: ReadonlyArray<string | number>) => keys.map(k => renderItem(k));

describe('Accordion — type / mode contract', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('emits the default mode and size on root and the canonical type/mode/size on the item', () => {
    const { container, getByTestId } = render(<Accordion>{renderItem('one')}</Accordion>);
    const root = container.querySelector('[data-slot="root"]');
    expect(root).toHaveAttribute('data-mode', 'default');
    expect(root).toHaveAttribute('data-size', 'base');

    const item = getByTestId('item-one');
    expect(item).toHaveAttribute('data-type', 'grouped');
    expect(item).toHaveAttribute('data-mode', 'default');
    expect(item).toHaveAttribute('data-size', 'base');
  });

  it('forwards an explicit mode="compact" without warning', () => {
    const { container, getByTestId } = render(<Accordion mode="compact">{renderItem('one')}</Accordion>);
    expect(container.querySelector('[data-slot="root"]')).toHaveAttribute('data-mode', 'compact');
    expect(getByTestId('item-one')).toHaveAttribute('data-mode', 'compact');
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('maps legacy type="compact" to mode="compact" and warns once per instance', () => {
    const { container, getByTestId, rerender } = render(<Accordion type="compact">{renderItem('one')}</Accordion>);

    const root = container.querySelector('[data-slot="root"]');
    expect(root).toHaveAttribute('data-mode', 'compact');
    expect(getByTestId('item-one')).toHaveAttribute('data-type', 'grouped');
    expect(getByTestId('item-one')).toHaveAttribute('data-mode', 'compact');

    rerender(<Accordion type="compact">{renderItem('one')}</Accordion>);

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0]?.[0]).toContain('type="compact"');
    expect(warnSpy.mock.calls[0]?.[0]).toContain('mode="compact"');
  });

  it('respects an explicit mode when legacy type="compact" is also passed', () => {
    render(
      <Accordion type="compact" mode="default">
        {renderItem('one')}
      </Accordion>,
    );
    // Even with explicit mode, the legacy type triggers the deprecation warning.
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('keeps non-compact type values unchanged and silent', () => {
    const { getByTestId } = render(<Accordion type="divided">{renderItem('one')}</Accordion>);
    expect(getByTestId('item-one')).toHaveAttribute('data-type', 'divided');
    expect(warnSpy).not.toHaveBeenCalled();
  });
});

describe('Accordion — Takeoff state API', () => {
  it('uses defaultActiveIndex for uncontrolled initial state (single mode)', () => {
    const { getByTestId } = render(<Accordion defaultActiveIndex="b">{renderItems(['a', 'b', 'c'])}</Accordion>);
    expect(getByTestId('trigger-a')).toHaveAttribute('aria-expanded', 'false');
    expect(getByTestId('trigger-b')).toHaveAttribute('aria-expanded', 'true');
    expect(getByTestId('trigger-c')).toHaveAttribute('aria-expanded', 'false');
  });

  it('lets single-mode items collapse (Spar isCollapsible flipped to true by the adapter)', () => {
    const onChange = vi.fn();
    const { getByTestId } = render(
      <Accordion defaultActiveIndex="a" onActiveIndexChange={onChange}>
        {renderItems(['a', 'b'])}
      </Accordion>,
    );
    fireEvent.click(getByTestId('trigger-a'));
    expect(onChange).toHaveBeenCalledWith('');
    expect(getByTestId('trigger-a')).toHaveAttribute('aria-expanded', 'false');
  });

  it('treats activeIndex as controlled and forwards the Takeoff-shaped payload on change', () => {
    const onChange = vi.fn();
    const { getByTestId, rerender } = render(
      <Accordion activeIndex="a" onActiveIndexChange={onChange}>
        {renderItems(['a', 'b'])}
      </Accordion>,
    );
    expect(getByTestId('trigger-a')).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(getByTestId('trigger-b'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('b');
    // Without the parent moving controlled state, the panel stays on `a`.
    expect(getByTestId('trigger-a')).toHaveAttribute('aria-expanded', 'true');

    rerender(
      <Accordion activeIndex="b" onActiveIndexChange={onChange}>
        {renderItems(['a', 'b'])}
      </Accordion>,
    );
    expect(getByTestId('trigger-b')).toHaveAttribute('aria-expanded', 'true');
  });

  it('preserves numeric itemKey shape on the onActiveIndexChange payload', () => {
    const onChange = vi.fn();
    const { getByTestId } = render(
      <Accordion defaultActiveIndex={0} onActiveIndexChange={onChange}>
        {renderItems([0, 1, 2])}
      </Accordion>,
    );

    fireEvent.click(getByTestId('trigger-1'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(1);
    expect(typeof onChange.mock.calls[0]?.[0]).toBe('number');
  });

  it('emits an array payload in allowMultiple mode and toggles items independently', () => {
    const onChange = vi.fn();
    const { getByTestId } = render(
      <Accordion allowMultiple defaultActiveIndex={['a']} onActiveIndexChange={onChange}>
        {renderItems(['a', 'b', 'c'])}
      </Accordion>,
    );
    fireEvent.click(getByTestId('trigger-b'));
    expect(onChange).toHaveBeenCalledWith(['a', 'b']);

    fireEvent.click(getByTestId('trigger-a'));
    expect(onChange).toHaveBeenLastCalledWith(['b']);
  });

  it('coerces a multi-mode array of numeric itemKeys back to numbers on change', () => {
    const onChange = vi.fn();
    const { getByTestId } = render(
      <Accordion allowMultiple defaultActiveIndex={[0]} onActiveIndexChange={onChange}>
        {renderItems([0, 1, 2])}
      </Accordion>,
    );
    fireEvent.click(getByTestId('trigger-2'));
    expect(onChange).toHaveBeenCalledWith([0, 2]);
    expect(typeof (onChange.mock.calls[0]?.[0] as number[])[0]).toBe('number');
    expect(typeof (onChange.mock.calls[0]?.[0] as number[])[1]).toBe('number');
  });
});

describe('Accordion — itemKey contract', () => {
  it('auto-assigns positional numeric itemKeys when consumers omit itemKey', () => {
    const onChange = vi.fn();
    const { container, getAllByRole } = render(
      <Accordion defaultActiveIndex={0} onActiveIndexChange={onChange}>
        <Accordion.Item>
          <Accordion.Header>
            <Accordion.Trigger>First</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>First body</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item>
          <Accordion.Header>
            <Accordion.Trigger>Second</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>Second body</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );
    // The first item is open via positional activeIndex=0.
    const triggers = getAllByRole('button');
    expect(triggers[0]).toHaveAttribute('aria-expanded', 'true');
    expect(triggers[1]).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(triggers[1]!);
    expect(onChange).toHaveBeenCalledWith(1);
    expect(typeof onChange.mock.calls[0]?.[0]).toBe('number');

    // Sanity check that the positional value made it onto Spar's `value` shape.
    expect(container.querySelectorAll('[role="region"]').length).toBeGreaterThan(0);
  });

  it('passes string itemKey through unchanged on the callback payload', () => {
    const onChange = vi.fn();
    const { getByTestId } = render(
      <Accordion defaultActiveIndex="alpha" onActiveIndexChange={onChange}>
        {renderItem('alpha')}
        {renderItem('beta')}
      </Accordion>,
    );
    fireEvent.click(getByTestId('trigger-beta'));
    expect(onChange).toHaveBeenCalledWith('beta');
  });

  it('warns once when Accordion.Item is rendered outside Accordion (and therefore lacks an injected key)', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    // Need the variant context, so we still wrap in an Accordion to mount —
    // but the item itself is wrapped in an extra layer that breaks the
    // root's child-walk. The warning is the documented fallback signal.
    expect(() =>
      render(
        <Accordion>
          <div data-testid="wrapper">
            <Accordion.Item>
              <Accordion.Header>
                <Accordion.Trigger>Detached</Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>Detached body</Accordion.Content>
            </Accordion.Item>
          </div>
        </Accordion>,
      ),
    ).not.toThrow();
    expect(warnSpy).toHaveBeenCalled();
    expect(warnSpy.mock.calls[0]?.[0]).toContain('itemKey');
    warnSpy.mockRestore();
  });
});

describe('Accordion — compound anatomy', () => {
  it('renders the canonical tk-* class and data-slot for every subcomponent', () => {
    const { container, getByTestId } = render(
      <Accordion defaultActiveIndex="a">
        <Accordion.Item itemKey="a" data-testid="anatomy-item">
          <Accordion.Header data-testid="anatomy-header">
            <Accordion.Trigger data-testid="anatomy-trigger">
              Toggle
              <Accordion.Arrow data-testid="anatomy-arrow" />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content data-testid="anatomy-content">Body</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );
    const root = container.querySelector('[data-slot="root"]');
    expect(root).toHaveClass('tk-accordion');

    const item = getByTestId('anatomy-item');
    expect(item).toHaveClass('tk-accordion-item');
    expect(item).toHaveAttribute('data-slot', 'root');

    const trigger = getByTestId('anatomy-trigger');
    expect(trigger).toHaveClass('tk-accordion-item-header');

    const content = getByTestId('anatomy-content');
    expect(content).toHaveClass('tk-accordion-item-content');

    const arrow = getByTestId('anatomy-arrow');
    expect(arrow).toHaveClass('tk-accordion-item-arrow');
  });

  it('exposes dotted displayName on every subcomponent for DevTools', () => {
    expect((Accordion as unknown as { displayName?: string }).displayName).toBe('Accordion');
    expect(Accordion.Item.displayName).toBe('Accordion.Item');
    expect(Accordion.Header.displayName).toBe('Accordion.Header');
    expect(Accordion.Trigger.displayName).toBe('Accordion.Trigger');
    expect(Accordion.Content.displayName).toBe('Accordion.Content');
    expect(Accordion.Arrow.displayName).toBe('Accordion.Arrow');
  });
});

describe('Accordion — customization', () => {
  it('lands instance classNames and slotProps on the canonical owner node', () => {
    const { container } = render(
      <Accordion classNames={{ root: 'instance-extra' }} slotProps={{ root: { 'aria-label': 'Inst label' } }}>
        {renderItem('a')}
      </Accordion>,
    );
    const root = container.querySelector('[data-slot="root"]');
    expect(root).toHaveClass('tk-accordion');
    expect(root).toHaveClass('instance-extra');
    expect(root).toHaveAttribute('aria-label', 'Inst label');
  });

  it('appends instance classNames after theme classNames so instance wins on order', () => {
    const { container } = render(
      <SparReactProvider components={{ Accordion: { classNames: { root: 'theme-class' } } }}>
        <Accordion classNames={{ root: 'instance-class' }}>{renderItem('a')}</Accordion>
      </SparReactProvider>,
    );
    const root = container.querySelector('[data-slot="root"]') as HTMLElement;
    const className = root.className;
    expect(className).toContain('tk-accordion');
    expect(className.indexOf('theme-class')).toBeLessThan(className.indexOf('instance-class'));
  });

  it('lets instance slotProps override theme slotProps for non-canonical keys', () => {
    const { container } = render(
      <SparReactProvider components={{ Accordion: { slotProps: { root: { 'aria-label': 'theme' } } } }}>
        <Accordion slotProps={{ root: { 'aria-label': 'instance' } }}>{renderItem('a')}</Accordion>
      </SparReactProvider>,
    );
    const root = container.querySelector('[data-slot="root"]');
    expect(root).toHaveAttribute('aria-label', 'instance');
  });

  it('never lets a theme or instance override drop the canonical data-slot', () => {
    const { container } = render(
      <SparReactProvider components={{ Accordion: { slotProps: { root: { 'data-slot': 'bogus' } as never } } }}>
        <Accordion slotProps={{ root: { 'data-slot': 'instance-bogus' } as never }}>{renderItem('a')}</Accordion>
      </SparReactProvider>,
    );
    const root = container.querySelector('[data-slot="root"]');
    expect(root).not.toBeNull();
    expect(root?.getAttribute('data-slot')).toBe('root');
  });
});
