import type { PropsWithChildren } from 'react';
import { ReactSparDemoRoot } from '@site/src/components/ReactSparDocs';

interface BlockPreviewProps {
  /** Minimum preview height in px. */
  minHeight?: number;
}

/** Bordered live preview for a block, themed with the docs colour mode. */
export default function BlockPreview({ children, minHeight = 320 }: PropsWithChildren<BlockPreviewProps>) {
  return (
    <div className="not-prose mb-6 overflow-hidden rounded-xl border border-border-light bg-background-lightest p-6" style={{ minHeight }}>
      <ReactSparDemoRoot>{children}</ReactSparDemoRoot>
    </div>
  );
}
