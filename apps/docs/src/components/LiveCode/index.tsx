import React, { type ComponentType, type PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import { Highlight, themes } from 'prism-react-renderer';
import { format } from 'prettier/standalone';
import prettierPluginBabel from 'prettier/plugins/babel';
import prettierPluginEstree from 'prettier/plugins/estree';
import { LiveEditor, LiveProvider } from 'react-live';
import './LiveCode.css';
import { CodeErrorBanner } from './CodeErrorBanner';
import { CollapsibleCodeBlock } from './CollapsibleCodeBlock';
import { CheckIcon, CopyIcon } from './icons';
import { SnapshotPreview } from './SnapshotPreview';

interface LiveCodeProps {
  code?: string;
  previewMinHeight?: number;
  previewWrapper?: ComponentType<PropsWithChildren>;
  scope?: Record<string, unknown>;
  /**
   * Switch the demo into react-live's "no-inline" evaluation mode. The demo
   * source must declare a component and call `render(<Demo />)` at the end.
   * This is the only way to use React hooks (`useState`, `useEffect`, …) in
   * a demo: react-live evaluates the IIFE form at module load time, which
   * lands hook calls outside any component render and breaks them. Default
   * is `false` (single JSX expression).
   */
  noInline?: boolean;
  /**
   * When `false`, the code panel becomes display-only: react-live still
   * renders the preview, but the editable textarea, prettier formatting,
   * and reset/error tooling are skipped. Use it for the supporting demos
   * on a component page so only the single Playground stays interactive.
   * Default is `true`.
   */
  editable?: boolean;
}

export const LiveCode = ({ code, previewMinHeight = 220, previewWrapper, scope = {}, noInline = false, editable = true }: LiveCodeProps) => {
  const { colorMode } = useColorMode();
  const selectedTheme = colorMode === 'dark' ? themes.vsDark : themes.github;
  const [isCopied, setIsCopied] = useState(false);
  const [formattedCode, setFormattedCode] = useState(code || '');
  const [isCodeCollapsed, setIsCodeCollapsed] = useState(false);
  const [isCodeExpanded, setIsCodeExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const copyFeedbackTimeoutRef = useRef<number | null>(null);
  const codeBlockRef = useRef<HTMLDivElement>(null);
  const expandableRef = useRef<HTMLDivElement>(null);

  const liveScope = useMemo(
    () => ({
      React,
      useEffect: React.useEffect,
      useMemo: React.useMemo,
      useRef: React.useRef,
      useState: React.useState,
      ...scope,
    }),
    [scope],
  );

  useEffect(() => {
    if (!code) {
      setFormattedCode('');
      return;
    }

    if (!editable) {
      setFormattedCode(code.trim());
      return;
    }

    let isCancelled = false;

    const formatJsx = async () => {
      try {
        const nextCode = await format(code, {
          arrowParens: 'always',
          bracketSameLine: false,
          bracketSpacing: true,
          embeddedLanguageFormatting: 'auto',
          endOfLine: 'lf',
          htmlWhitespaceSensitivity: 'css',
          parser: 'babel',
          plugins: [prettierPluginBabel, prettierPluginEstree],
          printWidth: 100,
          quoteProps: 'as-needed',
          semi: true,
          singleQuote: true,
          tabWidth: 2,
          trailingComma: 'all',
        });

        if (!isCancelled) {
          setFormattedCode(nextCode.trim());
        }
      } catch {
        if (!isCancelled) {
          setFormattedCode(code.trim());
        }
      }
    };

    void formatJsx();

    return () => {
      isCancelled = true;
    };
  }, [code, editable]);

  useEffect(() => {
    return () => {
      if (copyFeedbackTimeoutRef.current !== null) {
        window.clearTimeout(copyFeedbackTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const el = expandableRef.current;
    if (!el) return;
    const scrollHeight = el.scrollHeight;
    el.style.setProperty('--natural-height', `${scrollHeight}px`);
    setCanExpand(scrollHeight > 144);
  }, [formattedCode, isCodeCollapsed]);

  const handleCopy = useCallback(async () => {
    if (!formattedCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(formattedCode);
      setIsCopied(true);

      if (copyFeedbackTimeoutRef.current !== null) {
        window.clearTimeout(copyFeedbackTimeoutRef.current);
      }

      copyFeedbackTimeoutRef.current = window.setTimeout(() => {
        setIsCopied(false);
        copyFeedbackTimeoutRef.current = null;
      }, 2000);
    } catch {
      setIsCopied(false);
    }
  }, [formattedCode]);

  const handleCopyError = useCallback(async (errorName: string, errorMessage: string, stack: string) => {
    const text = `${errorName}: ${errorMessage}\n${stack || ''}`;
    try {
      await navigator.clipboard.writeText(text.trim());
    } catch {
      // Clipboard may not be available in all contexts.
    }
  }, []);

  const handleToggleCode = useCallback(() => {
    setIsCodeCollapsed(previousValue => !previousValue);
  }, []);

  const handleDismissError = useCallback(() => {}, []);

  return (
    <div className="live-code-container">
      <LiveProvider code={formattedCode} scope={liveScope} noInline={noInline}>
        <div className="live-preview-card">
          <div className="live-preview-wrapper" style={{ minHeight: `${previewMinHeight}px` }}>
            <SnapshotPreview previewWrapper={previewWrapper} scope={liveScope} noInline={noInline} />
          </div>
        </div>

        <CollapsibleCodeBlock
          codeBlockRef={codeBlockRef}
          isCollapsed={isCodeCollapsed}
          onToggle={handleToggleCode}
          headerActions={
            <button
              className="live-code-action-button"
              type="button"
              onClick={handleCopy}
              aria-label={isCopied ? 'Copied to clipboard' : 'Copy code'}
              data-copied={isCopied ? '' : undefined}
            >
              {isCopied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
            </button>
          }
        >
          <div className={`live-code-expandable${isCodeExpanded ? ' expanded' : ''}${canExpand ? ' has-overflow' : ''}`} ref={expandableRef}>
            <div className="live-code-wrapper">
              {editable && <CodeErrorBanner onCopy={handleCopyError} onDismiss={handleDismissError} />}

              {editable ? (
                <LiveEditor theme={selectedTheme} className="live-editor" code={formattedCode} />
              ) : (
                <Highlight theme={selectedTheme} code={formattedCode} language="tsx">
                  {({ className, style, tokens, getLineProps, getTokenProps }) => (
                    <pre
                      className={`live-editor ${className}`}
                      style={{
                        ...style,
                        overflowX: 'auto',
                        overflowY: 'auto',
                        whiteSpace: 'pre',
                        wordWrap: 'normal',
                      }}
                    >
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
              )}
            </div>
          </div>
          {canExpand && (
            <button className="show-more-toggle" type="button" onClick={() => setIsCodeExpanded(prev => !prev)}>
              {isCodeExpanded ? 'Show less' : 'Show more'}
              <svg className={`show-more-chevron${isCodeExpanded ? ' rotated' : ''}`} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </CollapsibleCodeBlock>
      </LiveProvider>
    </div>
  );
};

LiveCode.displayName = 'LiveCode';

export default LiveCode;
