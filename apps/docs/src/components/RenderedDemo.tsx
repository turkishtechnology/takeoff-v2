import type { ComponentType, PropsWithChildren, ReactNode } from 'react';
import CodeBlock from '@theme/CodeBlock';
import clsx from 'clsx';
import styles from './RenderedDemo.module.css';

interface RenderedDemoProps {
  children: ReactNode;
  code?: string;
  cssCode?: string;
  previewClassName?: string;
  previewMinHeight?: number;
  previewWrapper?: ComponentType<PropsWithChildren>;
  summaryLabel?: string;
}

export default function RenderedDemo({
  children,
  code,
  cssCode,
  previewClassName,
  previewMinHeight,
  previewWrapper: PreviewWrapper,
  summaryLabel = 'View Code',
}: RenderedDemoProps) {
  const hasCode = Boolean(code || cssCode);

  return (
    <div className={styles.root}>
      <div className={clsx(styles.preview, previewClassName)} style={previewMinHeight ? { minHeight: `${previewMinHeight}px` } : undefined}>
        {PreviewWrapper ? <PreviewWrapper>{children}</PreviewWrapper> : children}
      </div>

      {hasCode ? (
        <details className={styles.details}>
          <summary className={styles.summary}>{summaryLabel}</summary>
          <div className={styles.codeStack}>
            {code ? (
              <CodeBlock className={styles.codeBlock} language="tsx" showLineNumbers>
                {code}
              </CodeBlock>
            ) : null}
            {cssCode ? (
              <CodeBlock className={styles.codeBlock} language="css" showLineNumbers>
                {cssCode}
              </CodeBlock>
            ) : null}
          </div>
        </details>
      ) : null}
    </div>
  );
}
