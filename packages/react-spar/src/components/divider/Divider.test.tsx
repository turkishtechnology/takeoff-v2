import type { HTMLAttributes } from 'react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';

import { render, screen } from '../../test-utils';
import { TakeoffSparProvider } from '../../provider';

import { Divider } from './Divider';

describe('Divider', () => {
  describe('rendering', () => {
    it('renders a horizontal separator with default data attributes', () => {
      render(<Divider />);

      const divider = screen.getByRole('separator');
      expect(divider.tagName).toBe('DIV');
      expect(divider).toHaveClass('tk-divider');
      expect(divider).toHaveAttribute('data-slot', 'root');
      expect(divider).toHaveAttribute('data-orientation', 'horizontal');
      expect(divider).toHaveAttribute('data-type', 'solid');
      expect(divider).toHaveAttribute('data-align', 'center');
      expect(divider).toHaveAttribute('aria-orientation', 'horizontal');
    });

    it('renders a vertical separator with matching aria-orientation', () => {
      render(<Divider orientation="vertical" />);

      const divider = screen.getByRole('separator');
      expect(divider).toHaveAttribute('data-orientation', 'vertical');
      expect(divider).toHaveAttribute('aria-orientation', 'vertical');
    });

    it('emits the appearance and align variant attributes', () => {
      render(<Divider appearance="dashed" align="start" />);

      const divider = screen.getByRole('separator');
      expect(divider).toHaveAttribute('data-type', 'dashed');
      expect(divider).toHaveAttribute('data-align', 'start');
    });

    it('removes separator semantics when decorative', () => {
      const { container } = render(<Divider decorative />);

      expect(screen.queryByRole('separator')).not.toBeInTheDocument();

      const divider = container.querySelector('.tk-divider');
      expect(divider).toHaveAttribute('role', 'none');
      expect(divider).not.toHaveAttribute('aria-orientation');
    });
  });

  describe('label', () => {
    it('renders children inside the label slot', () => {
      render(<Divider>OR</Divider>);

      const label = screen.getByText('OR');
      expect(label.tagName).toBe('SPAN');
      expect(label).toHaveClass('tk-divider-label');
      expect(label).toHaveAttribute('data-slot', 'label');
      expect(screen.getByRole('separator')).toContainElement(label);
    });

    it('skips the label slot when there are no renderable children', () => {
      const { container } = render(<Divider>{false}</Divider>);

      expect(container.querySelector('.tk-divider-label')).not.toBeInTheDocument();
    });

    it('renders a label inside a vertical divider', () => {
      render(<Divider orientation="vertical">Devamı</Divider>);

      const divider = screen.getByRole('separator');
      expect(divider).toHaveAttribute('aria-orientation', 'vertical');
      expect(divider).toContainElement(screen.getByText('Devamı'));
    });
  });

  describe('customization', () => {
    it('merges className, classNames and slotProps on the root', () => {
      render(<Divider className="via-class" classNames={{ root: 'via-classnames' }} slotProps={{ root: { 'aria-label': 'Bölüm sonu' } }} />);

      const divider = screen.getByRole('separator', { name: 'Bölüm sonu' });
      expect(divider).toHaveClass('tk-divider', 'via-class', 'via-classnames');
    });

    it('keeps canonical data attributes on top of consumer slotProps', () => {
      render(<Divider slotProps={{ root: { 'data-orientation': 'vertical' } as HTMLAttributes<HTMLElement> }} />);

      expect(screen.getByRole('separator')).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('keeps separator semantics on top of consumer slotProps', () => {
      render(<Divider slotProps={{ root: { role: 'button' } }} />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      expect(screen.getByRole('separator')).toBeInTheDocument();
    });

    it('merges classNames and slotProps on the label slot', () => {
      render(
        <Divider classNames={{ label: 'label-extra' }} slotProps={{ label: { id: 'divider-label' } }}>
          OR
        </Divider>,
      );

      const label = screen.getByText('OR');
      expect(label).toHaveClass('tk-divider-label', 'label-extra');
      expect(label).toHaveAttribute('id', 'divider-label');
    });

    it('applies provider theme defaults under instance props', () => {
      render(
        <TakeoffSparProvider components={{ Divider: { defaultProps: { orientation: 'vertical', align: 'end' } } }}>
          <Divider align="start" />
        </TakeoffSparProvider>,
      );

      const divider = screen.getByRole('separator');
      expect(divider).toHaveAttribute('data-orientation', 'vertical');
      expect(divider).toHaveAttribute('data-align', 'start');
    });
  });

  describe('accessibility', () => {
    it('has no a11y violations with and without a label', async () => {
      const { container } = render(
        <div>
          <Divider />
          <Divider>OR</Divider>
          <Divider decorative />
        </div>,
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
