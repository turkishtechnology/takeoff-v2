import type { JSX } from 'react';
import Content from '@theme-original/DocItem/Content';
import type ContentType from '@theme/DocItem/Content';
import type { WrapperProps } from '@docusaurus/types';
import MarkdownActions from './MarkdownActions';
import styles from './styles.module.css';

/**
 * Wraps the theme's DocItem/Content to drop a "Copy page / Markdown" action
 * group into the top-right of the article, aligned with the page title.
 *
 * Wrapping (rather than ejecting) keeps us off `@docusaurus/plugin-content-docs`
 * internals — the current page URL comes from `useLocation()` instead — so no
 * extra dependency and no lockfile churn.
 */

type Props = WrapperProps<typeof ContentType>;

export default function ContentWrapper(props: Props): JSX.Element {
  return (
    <div className={styles.wrap}>
      <MarkdownActions />
      <Content {...props} />
    </div>
  );
}
