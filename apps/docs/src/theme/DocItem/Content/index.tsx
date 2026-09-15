import type { JSX } from 'react';
import { useLocation } from '@docusaurus/router';
import Content from '@theme-original/DocItem/Content';
import type ContentType from '@theme/DocItem/Content';
import type { WrapperProps } from '@docusaurus/types';
import MarkdownActions from '@site/src/components/MarkdownActions';
import styles from './styles.module.css';

/**
 * Wraps the theme's DocItem/Content to drop a "Copy page / Markdown" action
 * group into the top-right of the article, aligned with the page title.
 *
 * Wrapping (rather than ejecting) keeps us off `@docusaurus/plugin-content-docs`
 * internals — the current page URL comes from `useLocation()` instead — so no
 * extra dependency and no lockfile churn.
 *
 * The icon gallery is the one exception: it hides its doc title and renders the
 * same action group inside its own hero, so a floating copy here would be a
 * duplicate landing on top of that hero.
 */

type Props = WrapperProps<typeof ContentType>;

const OWN_ACTIONS_ROUTES = new Set(['/icons/gallery']);

export default function ContentWrapper(props: Props): JSX.Element {
  const { pathname } = useLocation();
  const route = pathname.length > 1 ? pathname.replace(/\/$/u, '') : pathname;

  return (
    <div className={styles.wrap}>
      {OWN_ACTIONS_ROUTES.has(route) ? null : <MarkdownActions className={styles.actions} />}
      <Content {...props} />
    </div>
  );
}
