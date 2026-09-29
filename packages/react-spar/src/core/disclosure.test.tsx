import { isValidElement } from 'react';
import { ChevronBottomIconOutlinedRounded } from '@takeoff-icons/react/chevron-bottom';
import { ChevronTopIconOutlinedRounded } from '@takeoff-icons/react/chevron-top';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../test-utils';

import { DEFAULT_DISCLOSURE_COLLAPSE_ICON, DEFAULT_DISCLOSURE_EXPAND_ICON, resolveDisclosureIndicator, type DisclosureIndicatorRenderState } from './disclosure';

describe('disclosure indicator', () => {
  describe('default glyphs', () => {
    it('uses the outlined/rounded Takeoff chevrons — down to expand, up to collapse', () => {
      expect(isValidElement(DEFAULT_DISCLOSURE_EXPAND_ICON)).toBe(true);
      expect(isValidElement(DEFAULT_DISCLOSURE_COLLAPSE_ICON)).toBe(true);
      expect(DEFAULT_DISCLOSURE_EXPAND_ICON.type).toBe(ChevronBottomIconOutlinedRounded);
      expect(DEFAULT_DISCLOSURE_COLLAPSE_ICON.type).toBe(ChevronTopIconOutlinedRounded);
    });

    it('renders decorative glyphs sized to 1em that paint with currentColor', () => {
      render(
        <>
          <span data-testid="expand">{DEFAULT_DISCLOSURE_EXPAND_ICON}</span>
          <span data-testid="collapse">{DEFAULT_DISCLOSURE_COLLAPSE_ICON}</span>
        </>,
      );

      for (const testId of ['expand', 'collapse']) {
        const glyph = screen.getByTestId(testId).querySelector('svg');

        expect(glyph).not.toBeNull();
        expect(glyph).toHaveAttribute('aria-hidden', 'true');
        expect(glyph).not.toHaveAttribute('role');
        expect(glyph).toHaveAttribute('width', '1em');
        expect(glyph).toHaveAttribute('height', '1em');
        expect(glyph?.querySelector('path')).toHaveAttribute('fill', 'currentColor');
      }
    });

    it('draws different artwork for the expand and collapse chevrons', () => {
      render(
        <>
          <span data-testid="expand">{DEFAULT_DISCLOSURE_EXPAND_ICON}</span>
          <span data-testid="collapse">{DEFAULT_DISCLOSURE_COLLAPSE_ICON}</span>
        </>,
      );

      const artwork = (testId: string) => screen.getByTestId(testId).querySelector('path')?.getAttribute('d');

      expect(artwork('expand')).toEqual(expect.any(String));
      expect(artwork('collapse')).toEqual(expect.any(String));
      expect(artwork('expand')).not.toBe(artwork('collapse'));
    });
  });

  describe('resolveDisclosureIndicator', () => {
    it('shows the expand chevron while closed and the collapse chevron while open when no children are given', () => {
      expect(resolveDisclosureIndicator(undefined, false)).toBe(DEFAULT_DISCLOSURE_EXPAND_ICON);
      expect(resolveDisclosureIndicator(undefined, true)).toBe(DEFAULT_DISCLOSURE_COLLAPSE_ICON);
    });

    it('calls a render-function children once per resolution with the live { isOpen } state', () => {
      const renderIndicator = vi.fn(({ isOpen }: DisclosureIndicatorRenderState) => (isOpen ? 'Hide' : 'Show'));

      expect(resolveDisclosureIndicator(renderIndicator, false)).toBe('Show');
      expect(renderIndicator).toHaveBeenCalledTimes(1);
      expect(renderIndicator).toHaveBeenLastCalledWith({ isOpen: false });

      expect(resolveDisclosureIndicator(renderIndicator, true)).toBe('Hide');
      expect(renderIndicator).toHaveBeenCalledTimes(2);
      expect(renderIndicator).toHaveBeenLastCalledWith({ isOpen: true });
    });

    it('uses the render-function result verbatim, even when it renders nothing', () => {
      expect(resolveDisclosureIndicator(() => null, false)).toBeNull();
      expect(resolveDisclosureIndicator(() => null, true)).toBeNull();
    });

    it('uses an explicit node verbatim in both states', () => {
      const icon = <svg aria-hidden="true" data-testid="custom-indicator" />;

      expect(resolveDisclosureIndicator(icon, false)).toBe(icon);
      expect(resolveDisclosureIndicator(icon, true)).toBe(icon);
      expect(resolveDisclosureIndicator('Toggle', true)).toBe('Toggle');
    });

    it('falls back to the chevron for every empty node, not only undefined', () => {
      // `null`, the `cond && <Icon />` idiom collapsing to `false`, and `''`
      // all mean "no override"; the part never renders empty.
      expect(resolveDisclosureIndicator(null, false)).toBe(DEFAULT_DISCLOSURE_EXPAND_ICON);
      expect(resolveDisclosureIndicator(null, true)).toBe(DEFAULT_DISCLOSURE_COLLAPSE_ICON);
      expect(resolveDisclosureIndicator(false, false)).toBe(DEFAULT_DISCLOSURE_EXPAND_ICON);
      expect(resolveDisclosureIndicator(true, true)).toBe(DEFAULT_DISCLOSURE_COLLAPSE_ICON);
      expect(resolveDisclosureIndicator('', false)).toBe(DEFAULT_DISCLOSURE_EXPAND_ICON);
    });

    it('keeps a falsy but renderable node such as 0 instead of swapping in the chevron', () => {
      expect(resolveDisclosureIndicator(0, false)).toBe(0);
      expect(resolveDisclosureIndicator(0, true)).toBe(0);
    });
  });

  describe('accessibility', () => {
    it('has no axe violations inside disclosure triggers in both states', async () => {
      const { container } = render(
        <>
          <button type="button" aria-expanded={false}>
            Fare rules
            {resolveDisclosureIndicator(undefined, false)}
          </button>
          <button type="button" aria-expanded>
            Baggage
            {resolveDisclosureIndicator(undefined, true)}
          </button>
        </>,
      );

      expect(screen.getByRole('button', { name: 'Fare rules' })).toHaveAttribute('aria-expanded', 'false');
      expect(screen.getByRole('button', { name: 'Baggage' })).toHaveAttribute('aria-expanded', 'true');
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
