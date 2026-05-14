import React, { type ComponentType, type PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import { Highlight, themes } from 'prism-react-renderer';
import { format } from 'prettier/standalone';
import prettierPluginBabel from 'prettier/plugins/babel';
import prettierPluginEstree from 'prettier/plugins/estree';
import prettierPluginPostcss from 'prettier/plugins/postcss';
import { LiveEditor, LiveProvider } from 'react-live';
import './LiveCode.css';
import { CodeErrorBanner } from './CodeErrorBanner';
import { CollapsibleCodeBlock } from './CollapsibleCodeBlock';
import { CheckIcon, CopyIcon } from './icons';
import { PreviewErrorFooter } from './PreviewErrorFooter';
import { PreviewErrorOverlay } from './PreviewErrorOverlay';
import { SnapshotPreview } from './SnapshotPreview';
import type { LiveCodeTab } from './types';

interface LiveCodeProps {
  code?: string;
  cssCode?: string;
  defaultTab?: LiveCodeTab;
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

export const LiveCode = ({ code, cssCode, defaultTab = 'js', previewMinHeight = 220, previewWrapper, scope = {}, noInline = false, editable = true }: LiveCodeProps) => {
  const { colorMode } = useColorMode();
  const selectedTheme = colorMode === 'dark' ? themes.vsDark : themes.github;
  const [activeTab, setActiveTab] = useState<LiveCodeTab>(defaultTab);
  const [isCopied, setIsCopied] = useState(false);
  const [formattedCode, setFormattedCode] = useState(code || '');
  const [formattedCssCode, setFormattedCssCode] = useState(cssCode || '');
  const [resetKey, setResetKey] = useState(0);
  const [hasRenderedOnce, setHasRenderedOnce] = useState(false);
  const [isCodeCollapsed, setIsCodeCollapsed] = useState(false);
  const styleTagRef = useRef<HTMLStyleElement | null>(null);
  const copyFeedbackTimeoutRef = useRef<number | null>(null);
  const codeBlockRef = useRef<HTMLDivElement>(null);

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
      setFormattedCode(code);
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
          setFormattedCode(nextCode);
        }
      } catch {
        if (!isCancelled) {
          setFormattedCode(code);
        }
      }
    };

    void formatJsx();

    return () => {
      isCancelled = true;
    };
  }, [code, editable]);

  useEffect(() => {
    if (!cssCode) {
      setFormattedCssCode('');
      if (activeTab === 'css') {
        setActiveTab('js');
      }
      return;
    }

    let isCancelled = false;

    const formatCss = async () => {
      try {
        const nextCssCode = await format(cssCode, {
          endOfLine: 'lf',
          parser: 'css',
          plugins: [prettierPluginPostcss],
          printWidth: 100,
          singleQuote: true,
          tabWidth: 2,
        });

        if (!isCancelled) {
          setFormattedCssCode(nextCssCode);
        }
      } catch {
        if (!isCancelled) {
          setFormattedCssCode(cssCode);
        }
      }
    };

    void formatCss();

    return () => {
      isCancelled = true;
    };
  }, [activeTab, cssCode]);

  useEffect(() => {
    if (!cssCode) {
      return;
    }

    if (!styleTagRef.current) {
      styleTagRef.current = document.createElement('style');
      styleTagRef.current.setAttribute('data-live-code-demo', 'true');
      document.head.appendChild(styleTagRef.current);
    }

    styleTagRef.current.textContent = cssCode;

    return () => {
      if (styleTagRef.current) {
        document.head.removeChild(styleTagRef.current);
        styleTagRef.current = null;
      }
    };
  }, [cssCode]);

  useEffect(() => {
    return () => {
      if (copyFeedbackTimeoutRef.current !== null) {
        window.clearTimeout(copyFeedbackTimeoutRef.current);
      }
    };
  }, []);

  const handleCopy = useCallback(async () => {
    const textToCopy = activeTab === 'js' ? formattedCode : formattedCssCode;
    if (!textToCopy) {
      return;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
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
  }, [activeTab, formattedCode, formattedCssCode]);

  const handleCopyError = useCallback(async (errorName: string, errorMessage: string, stack: string) => {
    const text = `${errorName}: ${errorMessage}\n${stack || ''}`;
    try {
      await navigator.clipboard.writeText(text.trim());
    } catch {
      // Clipboard may not be available in all contexts.
    }
  }, []);

  const handleShowInCode = useCallback(() => {
    setIsCodeCollapsed(false);
    requestAnimationFrame(() => {
      if (codeBlockRef.current) {
        codeBlockRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        codeBlockRef.current.setAttribute('tabindex', '-1');
        codeBlockRef.current.focus({ preventScroll: true });
      }
    });
  }, []);

  const handleToggleCode = useCallback(() => {
    setIsCodeCollapsed(previousValue => !previousValue);
  }, []);

  const handleReset = useCallback(() => {
    setHasRenderedOnce(false);
    setResetKey(currentValue => currentValue + 1);
    setIsCodeCollapsed(false);
  }, []);

  const handleDismissError = useCallback(() => {}, []);

  return (
    <div className="live-code-container">
      <React.Fragment key={resetKey}>
        <LiveProvider code={formattedCode} scope={liveScope} noInline={noInline}>
          <div className="live-preview-card">
            <div className="live-preview-wrapper" style={{ minHeight: `${previewMinHeight}px` }}>
              <SnapshotPreview onHasRendered={() => setHasRenderedOnce(true)} previewWrapper={previewWrapper} scope={liveScope} noInline={noInline} />
              {editable && <PreviewErrorOverlay hasRenderedOnce={hasRenderedOnce} onShowInCode={handleShowInCode} onReset={handleReset} />}
            </div>
            {editable && <PreviewErrorFooter hasRenderedOnce={hasRenderedOnce} isCodePanelOpen={!isCodeCollapsed} onShowInCode={handleShowInCode} onReset={handleReset} />}
          </div>

          <CollapsibleCodeBlock
            codeBlockRef={codeBlockRef}
            isCollapsed={isCodeCollapsed}
            onToggle={handleToggleCode}
            headerActions={
              <>
                <div className="tabs" role="tablist" aria-label="Demo source tabs">
                  <div className="tabs-list">
                    <button
                      className="tab"
                      type="button"
                      role="tab"
                      aria-selected={activeTab === 'js'}
                      aria-label="JavaScript"
                      data-state={activeTab === 'js' ? 'active' : 'inactive'}
                      onClick={() => setActiveTab('js')}
                    >
                      <span className="tab-label">JS</span>
                    </button>
                    {cssCode && (
                      <button
                        className="tab"
                        type="button"
                        role="tab"
                        aria-selected={activeTab === 'css'}
                        aria-label="CSS"
                        data-state={activeTab === 'css' ? 'active' : 'inactive'}
                        onClick={() => setActiveTab('css')}
                      >
                        <span className="tab-label">CSS</span>
                      </button>
                    )}
                  </div>
                </div>
                <button
                  className="live-code-action-button"
                  type="button"
                  onClick={handleCopy}
                  aria-label={isCopied ? 'Copied to clipboard' : 'Copy code'}
                  data-copied={isCopied ? '' : undefined}
                >
                  {isCopied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                </button>
              </>
            }
          >
            <div className="live-code-wrapper">
              {editable && <CodeErrorBanner onCopy={handleCopyError} onDismiss={handleDismissError} />}

              {activeTab === 'js' ? (
                editable ? (
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
                )
              ) : (
                <Highlight theme={selectedTheme} code={formattedCssCode} language="css">
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
          </CollapsibleCodeBlock>
        </LiveProvider>
      </React.Fragment>
    </div>
  );
};

LiveCode.displayName = 'LiveCode';

export default LiveCode;
