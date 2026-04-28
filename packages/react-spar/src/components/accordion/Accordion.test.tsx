import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';

import { Accordion } from './index';

const mountWithItem = (props: Parameters<typeof Accordion>[0]) =>
  render(
    <Accordion {...props}>
      <Accordion.Item value="one" data-testid="item">
        <Accordion.Header>
          <Accordion.Trigger>One</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>Body</Accordion.Content>
      </Accordion.Item>
    </Accordion>,
  );

describe('Accordion — type / mode contract', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('emits the default mode and size on root and the canonical type/mode/size on the item', () => {
    const { container, getByTestId } = mountWithItem({});
    const root = container.querySelector('[data-slot="root"]');
    expect(root).toHaveAttribute('data-mode', 'default');
    expect(root).toHaveAttribute('data-size', 'base');

    const item = getByTestId('item');
    expect(item).toHaveAttribute('data-type', 'grouped');
    expect(item).toHaveAttribute('data-mode', 'default');
    expect(item).toHaveAttribute('data-size', 'base');
  });

  it('forwards an explicit mode="compact" without warning', () => {
    const { container, getByTestId } = mountWithItem({ mode: 'compact' });
    expect(container.querySelector('[data-slot="root"]')).toHaveAttribute('data-mode', 'compact');
    expect(getByTestId('item')).toHaveAttribute('data-mode', 'compact');
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('maps legacy type="compact" to mode="compact" and warns once per instance', () => {
    const { container, getByTestId, rerender } = mountWithItem({ type: 'compact' });

    const root = container.querySelector('[data-slot="root"]');
    expect(root).toHaveAttribute('data-mode', 'compact');
    expect(getByTestId('item')).toHaveAttribute('data-type', 'grouped');
    expect(getByTestId('item')).toHaveAttribute('data-mode', 'compact');

    rerender(
      <Accordion type="compact">
        <Accordion.Item value="one" data-testid="item">
          <Accordion.Header>
            <Accordion.Trigger>One</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>Body</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0]?.[0]).toContain('type="compact"');
    expect(warnSpy.mock.calls[0]?.[0]).toContain('mode="compact"');
  });

  it('respects an explicit mode when legacy type="compact" is also passed', () => {
    mountWithItem({ type: 'compact', mode: 'default' });
    // Even with explicit mode, the legacy type triggers the deprecation warning.
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('keeps non-compact type values unchanged and silent', () => {
    const { getByTestId } = mountWithItem({ type: 'divided' });
    expect(getByTestId('item')).toHaveAttribute('data-type', 'divided');
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
