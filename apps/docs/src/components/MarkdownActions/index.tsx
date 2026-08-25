import { useState, type JSX } from 'react';
import { useLocation } from '@docusaurus/router';
import { Button, Dropdown } from '@takeoff-ui/react-spar';
import { CopyIconOutlinedRounded } from '@takeoff-icons/react/copy';
import { CheckIconOutlinedRounded } from '@takeoff-icons/react/check';
import { OpenIconOutlinedRounded } from '@takeoff-icons/react/open';
import { ChevronBottomIconOutlinedRounded } from '@takeoff-icons/react/chevron-bottom';
import styles from './styles.module.css';

/**
 * "Copy page" menu button — the docs' single page-actions control.
 *
 * Every page in both docs trees is mirrored to a clean Markdown file by
 * `scripts/generate-llms.mjs` (served from `static/`). The URL mapping here MUST
 * match `mdPathFor()` in that script: a trailing-slash route (a tree's landing
 * page) maps to `index.md`, everything else to `<path>.md`.
 *
 * Lives in `src/components` rather than beside the swizzled `DocItem/Content`
 * because two callers need it: that wrapper, which floats it beside the page
 * title, and the icon gallery's hero, which renders it inline as a primary
 * action. Placement is the caller's (`className`); only the actions live here.
 *
 * A single trigger owns every page action, copy included. The split-button
 * variant buys copy one fewer click, but only by butting two differently
 * rounded halves together — not worth the seam in a title row this quiet.
 * Adding a destination later is a new `Dropdown.Item`, not another button.
 *
 * Built from our own primitives — Spar `Button` and `Dropdown` (both
 * polymorphic, so link actions render as real `<a>`s) and `@takeoff-icons/react`
 * — rather than raw elements, so the docs dogfood the library they document.
 */

type CopyState = 'idle' | 'copied' | 'error';

const RESET_MS = 2000;
const ICON_SIZE = 16;

export interface MarkdownActionsProps {
  /** Wrapper class, for callers that need to place the group. */
  className?: string;
  /** Trigger size. Doc headers use the quieter `small`; heroes use `base`. */
  size?: 'small' | 'base';
}

/**
 * Prompt used by the "Open in ..." handoffs. The assistant fetches the Markdown
 * itself, so the deep link stays short enough to survive URL length limits that
 * pasting the whole page would blow past.
 */
function handoffPrompt(url: string): string {
  return `Read ${url} and help me with questions about it.`;
}

export default function MarkdownActions({ className, size = 'small' }: MarkdownActionsProps = {}): JSX.Element {
  const { pathname } = useLocation();
  const [state, setState] = useState<CopyState>('idle');

  const mdUrl = pathname.endsWith('/') ? `${pathname}index.md` : `${pathname}.md`;
  // Deep links leave the site, so they need an absolute URL. Guard for SSR,
  // where Docusaurus renders this component without a `window`.
  const absoluteMdUrl = typeof window === 'undefined' ? mdUrl : new URL(mdUrl, window.location.origin).href;

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
    <div className={className ? `${styles.actions} ${className}` : styles.actions}>
      <Dropdown size="small" contentWidth="content">
        <Dropdown.Trigger
          as={Button}
          variant={copyVariant}
          appearance="outlined"
          size={size}
          startContent={state === 'copied' ? <CheckIconOutlinedRounded width={ICON_SIZE} height={ICON_SIZE} /> : <CopyIconOutlinedRounded width={ICON_SIZE} height={ICON_SIZE} />}
          endContent={<ChevronBottomIconOutlinedRounded width={ICON_SIZE} height={ICON_SIZE} />}
          title="Copy this page as Markdown for an LLM"
        >
          {copyLabel}
        </Dropdown.Trigger>

        <Dropdown.Content align="end" className={styles.menu}>
          <Dropdown.Viewport>
            <Dropdown.Item onSelect={copyPage} textValue="Copy page as Markdown">
              <CopyIconOutlinedRounded width={ICON_SIZE} height={ICON_SIZE} />
              Copy as Markdown
            </Dropdown.Item>

            <Dropdown.Item as="a" href={mdUrl} target="_blank" rel="noopener noreferrer" textValue="View as Markdown">
              <OpenIconOutlinedRounded width={ICON_SIZE} height={ICON_SIZE} />
              View as Markdown
            </Dropdown.Item>

            <Dropdown.Separator />

            <Dropdown.Item
              as="a"
              href={`https://claude.ai/new?q=${encodeURIComponent(handoffPrompt(absoluteMdUrl))}`}
              target="_blank"
              rel="noopener noreferrer"
              textValue="Open in Claude"
            >
              <OpenIconOutlinedRounded width={ICON_SIZE} height={ICON_SIZE} />
              Open in Claude
            </Dropdown.Item>

            <Dropdown.Item
              as="a"
              href={`https://chatgpt.com/?q=${encodeURIComponent(handoffPrompt(absoluteMdUrl))}`}
              target="_blank"
              rel="noopener noreferrer"
              textValue="Open in ChatGPT"
            >
              <OpenIconOutlinedRounded width={ICON_SIZE} height={ICON_SIZE} />
              Open in ChatGPT
            </Dropdown.Item>
          </Dropdown.Viewport>
        </Dropdown.Content>
      </Dropdown>

      {/*
        The copy button's label carries the result visually, but swapping text on
        a control the user just activated is not reliably announced. Mirror it
        into a live region so screen readers hear success and failure.
      */}
      <span className={styles.srOnly} role="status" aria-live="polite">
        {state === 'copied' ? 'Page copied as Markdown' : state === 'error' ? 'Copy failed. Use “View as Markdown” instead.' : ''}
      </span>
    </div>
  );
}
