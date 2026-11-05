import { type PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import { Highlight, themes } from 'prism-react-renderer';
import { CheckIconOutlinedRounded } from '@takeoff-icons/react/check';
import { ChevronBottomIconOutlinedRounded } from '@takeoff-icons/react/chevron-bottom';
import { CopyIconOutlinedRounded } from '@takeoff-icons/react/copy';
import { ReactSparDemoRoot } from '@site/src/components/ReactSparDocs';
import { CollapsibleCodeBlock } from '@site/src/components/LiveCode/CollapsibleCodeBlock';
import '@site/src/components/LiveCode/LiveCode.css';

interface BlockPreviewProps {
  /** Minimum preview height in px. */
  minHeight?: number;
  /** Source of the example, shown in the code panel under the preview. */
  code?: string;
  /** File name of `code`. Used by the Markdown mirror (`gen:llms`), which labels the source with it. */
  title?: string;
}

/**
 * Live preview of a block example with its source underneath, in the same
 * frame as the component page demos (`LiveCode`). Blocks are real modules
 * rather than react-live strings, so the preview renders the imported
 * component and the code panel shows its file (imported with `?raw`).
 */
export default function BlockPreview({ children, minHeight = 320, code }: PropsWithChildren<BlockPreviewProps>) {
  const { colorMode } = useColorMode();
  const source = code?.trim() ?? '';
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const expandableRef = useRef<HTMLDivElement>(null);
  const copyTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const el = expandableRef.current;
    if (!el) return;
    el.style.setProperty('--natural-height', `${el.scrollHeight}px`);
    setCanExpand(el.scrollHeight > 144);
  }, [source, isCollapsed]);

  useEffect(
    () => () => {
      if (copyTimeoutRef.current !== null) window.clearTimeout(copyTimeoutRef.current);
    },
    [],
  );

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(source);
      setIsCopied(true);
      if (copyTimeoutRef.current !== null) window.clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = window.setTimeout(() => setIsCopied(false), 2000);
    } catch {
      setIsCopied(false);
    }
  }, [source]);

  const toggle = useCallback(() => setIsCollapsed(value => !value), []);

  return (
    <div className="live-code-container not-prose">
      <div className="live-preview-card">
        <div className="live-preview-wrapper" style={{ minHeight }}>
          <div className="live-preview">
            <ReactSparDemoRoot>{children}</ReactSparDemoRoot>
          </div>
        </div>
      </div>

      {source && (
        <CollapsibleCodeBlock
          isCollapsed={isCollapsed}
          onToggle={toggle}
          headerActions={
            <button
              className="live-code-action-button"
              type="button"
              onClick={handleCopy}
              aria-label={isCopied ? 'Copied to clipboard' : 'Copy code'}
              data-copied={isCopied ? '' : undefined}
            >
              {isCopied ? <CheckIconOutlinedRounded /> : <CopyIconOutlinedRounded />}
            </button>
          }
        >
          <div className={`live-code-expandable${isExpanded ? ' expanded' : ''}${canExpand ? ' has-overflow' : ''}`} ref={expandableRef}>
            <div className="live-code-wrapper">
              <Highlight theme={colorMode === 'dark' ? themes.vsDark : themes.github} code={source} language="tsx">
                {({ className, style, tokens, getLineProps, getTokenProps }) => (
                  <pre className={`live-editor ${className}`} style={{ ...style, overflowX: 'auto', overflowY: 'auto', whiteSpace: 'pre', wordWrap: 'normal' }}>
                    {tokens.map((line, lineIndex) => (
                      <div key={lineIndex} {...getLineProps({ line })}>
                        {line.map((token, tokenIndex) => (
                          <span key={tokenIndex} {...getTokenProps({ token })} />
                        ))}
                      </div>
                    ))}
                  </pre>
                )}
              </Highlight>
            </div>
          </div>
          {canExpand && (
            <button className="show-more-toggle" type="button" onClick={() => setIsExpanded(value => !value)}>
              {isExpanded ? 'Show less' : 'Show more'}
              <ChevronBottomIconOutlinedRounded className={`show-more-chevron${isExpanded ? ' rotated' : ''}`} aria-hidden="true" />
            </button>
          )}
        </CollapsibleCodeBlock>
      )}
    </div>
  );
}
