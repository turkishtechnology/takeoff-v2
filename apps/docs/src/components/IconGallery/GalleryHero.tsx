import type { JSX } from 'react';

import { Badge, Button } from '@takeoff-ui/react-spar';
import MarkdownActions from '../MarkdownActions';
import { OpenIconOutlinedRounded } from '@takeoff-icons/react/open';
import styles from './styles.module.css';

/**
 * Marketing header for the gallery page, mirroring the Showroom design: an
 * uppercase eyebrow, the display-size title, two actions, and a row of trait
 * pills. The pills are `Badge`s and the actions are `Button`s so the page keeps
 * dogfooding the library it documents.
 *
 * The primary action is the site-wide `MarkdownActions` group, not a bespoke
 * copy button — the gallery gets the same Copy / View / Open-in-assistant menu
 * every other docs page has, off the same mirror. That mirror is not thin
 * despite the page rendering from React: `gen:icons` writes the full icon
 * inventory and `gen:llms` folds it into `/icons/gallery.md`.
 */

const ICON_SIZE = 16;

const REPO_URL = 'https://github.com/turkishtechnology/takeoff-v2';

/* Claims the packages actually back: `@takeoff-icons/svg` + `/font` (there is no
   PNG distribution), Figma as the source of truth via `figma:export`, and the
   `@takeoff-icons/react` bindings. `/vue` and `/wc` ship too, but this site does
   not document them, so they are not advertised here. */
const TRAITS = ['Vector Based', 'Pixel Perfect', 'SVG & Icon Font', 'Figma Ready', 'React Support'];

interface GalleryHeroProps {
  /** Total icons in the set, used for the eyebrow's headline number. */
  totalCount: number;
  /** Total style x type renditions across the set, the second headline number. */
  variantCount: number;
}

export default function GalleryHero({ totalCount, variantCount }: GalleryHeroProps): JSX.Element {
  return (
    <header className={styles.hero}>
      <div className={styles.heroText}>
        <p className={styles.heroEyebrow}>
          Over {totalCount.toLocaleString('en-US')} high-quality icons in {variantCount.toLocaleString('en-US')} variants, meticulously crafted for developers and designers.
        </p>

        <h1 className={styles.heroTitle}>Icon Gallery</h1>
      </div>

      <div className={styles.heroActions}>
        <MarkdownActions size="base" />

        <Button
          as="a"
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          variant="black"
          appearance="filled"
          endContent={<OpenIconOutlinedRounded width={ICON_SIZE} height={ICON_SIZE} />}
        >
          Github
        </Button>
      </div>

      <div className={styles.heroTraits}>
        {TRAITS.map(trait => (
          <Badge key={trait} variant="neutral" appearance="filledLight" size="small" rounded>
            {trait}
          </Badge>
        ))}
      </div>
    </header>
  );
}
