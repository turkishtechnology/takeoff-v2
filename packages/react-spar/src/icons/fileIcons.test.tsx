import { axe } from 'vitest-axe';
import { describe, expect, expectTypeOf, it } from 'vitest';

import { render, screen } from '../test-utils';

import { FILE_ICONS, type FileIconName } from './index';

const KINDS: FileIconName[] = ['excel', 'jpg', 'mp4', 'pdf', 'png', 'powerpoint', 'text', 'word', 'zip'];

describe('FILE_ICONS', () => {
  describe('registry', () => {
    it('ships an icon for exactly the supported file kinds', () => {
      expect(Object.keys(FILE_ICONS).sort()).toEqual([...KINDS].sort());
      expectTypeOf<keyof typeof FILE_ICONS>().toEqualTypeOf<FileIconName>();
    });

    it('maps every kind to its own labelled artwork', () => {
      render(
        <>
          {KINDS.map(kind => {
            const Icon = FILE_ICONS[kind];
            return <Icon key={kind} data-testid={`icon-${kind}`} />;
          })}
        </>,
      );

      const labelGlyphs = KINDS.map(kind => screen.getByTestId(`icon-${kind}`).querySelector('path:last-of-type')?.getAttribute('d'));

      expect(labelGlyphs.every(Boolean)).toBe(true);
      expect(new Set(labelGlyphs).size).toBe(KINDS.length);
    });
  });

  describe('rendering', () => {
    it.each(KINDS)('renders the %s icon as a decorative 40x40 svg', kind => {
      const Icon = FILE_ICONS[kind];
      render(<Icon data-testid="file-icon" />);

      const svg = screen.getByTestId('file-icon');

      expect(svg.tagName.toLowerCase()).toBe('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 40 40');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
      expect(svg).toHaveAttribute('focusable', 'false');
    });

    it('forwards SVG props such as className, size and style to the root svg', () => {
      const PdfIcon = FILE_ICONS.pdf;
      render(<PdfIcon data-testid="pdf-icon" className="upload-file-icon" width={24} height={24} style={{ opacity: 0.5 }} />);

      const svg = screen.getByTestId('pdf-icon');

      expect(svg).toHaveClass('upload-file-icon');
      expect(svg).toHaveAttribute('width', '24');
      expect(svg).toHaveAttribute('height', '24');
      expect(svg.style.opacity).toBe('0.5');
    });

    it('lets consumer props override the decorative defaults while keeping the artwork viewBox', () => {
      const WordIcon = FILE_ICONS.word;
      render(<WordIcon role="img" aria-hidden={false} aria-label="Word document" focusable="true" />);

      const svg = screen.getByRole('img', { name: 'Word document' });

      expect(svg).toHaveAttribute('aria-hidden', 'false');
      expect(svg).toHaveAttribute('focusable', 'true');
      expect(svg).toHaveAttribute('viewBox', '0 0 40 40');
    });
  });

  describe('accessibility', () => {
    it('has no axe violations when every icon decorates a visible file name', async () => {
      const { container } = render(
        <ul>
          {KINDS.map(kind => {
            const Icon = FILE_ICONS[kind];
            return (
              <li key={kind}>
                <Icon width={20} height={20} />
                <span>{`report.${kind}`}</span>
              </li>
            );
          })}
        </ul>,
      );

      expect(screen.getAllByRole('listitem')).toHaveLength(KINDS.length);
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no axe violations when a consumer turns an icon into a labelled image', async () => {
      const ZipIcon = FILE_ICONS.zip;
      const { container } = render(<ZipIcon role="img" aria-hidden={false} aria-label="Compressed archive" />);

      expect(screen.getByRole('img', { name: 'Compressed archive' })).toBeInTheDocument();
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
