import type { PropsWithChildren } from 'react';
import CodeBlock from '@theme/CodeBlock';
import { ReactSparDemoRoot } from '@site/src/components/ReactSparDocs';

interface BlockPreviewProps {
  /** Minimum preview height in px. */
  minHeight?: number;
  /** Source of the example, shown under the preview. */
  code?: string;
  /** File name shown above the code. */
  title?: string;
}

/** Bordered live preview for a block, themed with the docs colour mode, with its code underneath. */
export default function BlockPreview({ children, minHeight = 320, code, title }: PropsWithChildren<BlockPreviewProps>) {
  return (
    <div className="mb-8">
      <div className={`not-prose overflow-hidden border border-border-light bg-background-lightest p-6 ${code ? 'rounded-t-xl border-b-0' : 'rounded-xl'}`} style={{ minHeight }}>
        <ReactSparDemoRoot>{children}</ReactSparDemoRoot>
      </div>
      {code && (
        <div className="[&_.theme-code-block]:!mb-0 [&_.theme-code-block]:!rounded-t-none">
          <CodeBlock language="tsx" title={title}>
            {code}
          </CodeBlock>
        </div>
      )}
    </div>
  );
}
