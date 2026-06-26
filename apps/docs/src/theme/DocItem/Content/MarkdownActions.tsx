import { useState, type JSX } from 'react';
import { useLocation } from '@docusaurus/router';
import { Button } from '@takeoff-ui/react-spar';
import { CopyIconOutlinedRounded } from '@takeoff-icons/react/copy';
import { CheckIconOutlinedRounded } from '@takeoff-icons/react/check';
import { OpenIconOutlinedRounded } from '@takeoff-icons/react/open';
import styles from './styles.module.css';

/**
 * "Copy page" / "Markdown" actions shown next to a docs page title.
 *
 * Each page is mirrored to a clean Markdown file by `scripts/generate-llms.mjs`
 * (served from `static/`). The URL mapping here MUST match `mdPathFor()` in that
 * script: a trailing-slash route (the docs landing page) maps to `index.md`,
 * everything else to `<path>.md`.
 *
 * Built from our own primitives — Spar `Button` (polymorphic, so the "Markdown"
 * link renders as a real `<a>`) and `@takeoff-icons/react` — rather than raw
 * elements, so the docs dogfood the library they document.
 */

type CopyState = 'idle' | 'copied' | 'error';

const RESET_MS = 2000;
const ICON_SIZE = 16;

export default function MarkdownActions(): JSX.Element {
  const { pathname } = useLocation();
  const [state, setState] = useState<CopyState>('idle');

  const mdUrl = pathname.endsWith('/') ? `${pathname}index.md` : `${pathname}.md`;

  async function copyPage(): Promise<void> {
    try {
      const res = await fetch(mdUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await navigator.clipboard.writeText(await res.text());
      setState('copied');
    } catch {
      setState('error');
    }
    window.setTimeout(() => setState('idle'), RESET_MS);
  }

  const copyLabel = state === 'copied' ? 'Copied!' : state === 'error' ? 'Copy failed' : 'Copy page';
  const copyVariant = state === 'copied' ? 'success' : state === 'error' ? 'danger' : 'neutral';

  return (
    <div className={styles.actions}>
      <Button
        variant={copyVariant}
        appearance="outlined"
        size="small"
        startContent={state === 'copied' ? <CheckIconOutlinedRounded width={ICON_SIZE} height={ICON_SIZE} /> : <CopyIconOutlinedRounded width={ICON_SIZE} height={ICON_SIZE} />}
        onClick={copyPage}
        title="Copy this page as Markdown for an LLM"
      >
        {copyLabel}
      </Button>
      <Button
        as="a"
        href={mdUrl}
        target="_blank"
        rel="noopener noreferrer"
        variant="neutral"
        appearance="outlined"
        size="small"
        startContent={<OpenIconOutlinedRounded width={ICON_SIZE} height={ICON_SIZE} />}
        title="View this page as raw Markdown"
      >
        Markdown
      </Button>
    </div>
  );
}
