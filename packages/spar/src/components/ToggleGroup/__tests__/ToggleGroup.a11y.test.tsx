import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ToggleGroup, ToggleGroupItem } from '../index';

expect.extend(toHaveNoViolations);

describe('ToggleGroup accessibility', () => {
  it('has no violations in single mode with a pressed and a disabled item', async () => {
    const { container } = render(
      <ToggleGroup aria-label="View" defaultValue="list">
        <ToggleGroupItem value="list">List</ToggleGroupItem>
        <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
        <ToggleGroupItem value="map" disabled>
          Map
        </ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations in multiple vertical mode with icon-only items', async () => {
    const { container } = render(
      <>
        <span id="format-label">Format</span>
        <ToggleGroup aria-labelledby="format-label" multiple orientation="vertical" defaultValue={['bold']}>
          <ToggleGroupItem value="bold" aria-label="Bold">
            <svg aria-hidden="true" />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Italic">
            <svg aria-hidden="true" />
          </ToggleGroupItem>
        </ToggleGroup>
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
    expect(screen.getByRole('group', { name: 'Format' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('keeps exactly one item in the tab order while navigating', async () => {
    const user = userEvent.setup();
    render(
      <ToggleGroup aria-label="Size">
        <ToggleGroupItem value="s">S</ToggleGroupItem>
        <ToggleGroupItem value="m">M</ToggleGroupItem>
        <ToggleGroupItem value="l">L</ToggleGroupItem>
      </ToggleGroup>,
    );
    const tabStops = () => screen.getAllByRole('button').filter(b => b.getAttribute('tabindex') === '0');
    expect(tabStops()).toHaveLength(1);
    await user.tab();
    await user.keyboard('{ArrowRight}{ArrowRight}');
    expect(tabStops()).toEqual([screen.getByRole('button', { name: 'L' })]);
  });
});
