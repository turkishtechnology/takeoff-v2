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
}

export const LiveCode = ({ code, cssCode, defaultTab = 'js', previewMinHeight = 220, previewWrapper, scope = {} }: LiveCodeProps) => {
  const { colorMode } = useColorMode();
  const selectedTheme = colorMode === 'dark' ? themes.vsDark : themes.github;
  const [activeTab, setActiveTab] = useState<LiveCodeTab>(defaultTab);
  const [isCopied, setIsCopied] = useState(false);
  const [isCopyTooltipOpen, setIsCopyTooltipOpen] = useState(false);
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
  }, [code]);

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
      setIsCopyTooltipOpen(true);

      if (copyFeedbackTimeoutRef.current !== null) {
        window.clearTimeout(copyFeedbackTimeoutRef.current);
      }

      copyFeedbackTimeoutRef.current = window.setTimeout(() => {
        setIsCopied(false);
        setIsCopyTooltipOpen(false);
        copyFeedbackTimeoutRef.current = null;
      }, 2000);
    } catch {
      setIsCopied(false);
      setIsCopyTooltipOpen(false);
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
        <LiveProvider code={formattedCode} scope={liveScope} noInline={false}>
          <div className="live-preview-card">
            <div className="live-preview-wrapper" style={{ minHeight: `${previewMinHeight}px` }}>
              <SnapshotPreview onHasRendered={() => setHasRenderedOnce(true)} previewWrapper={previewWrapper} scope={liveScope} />
              <PreviewErrorOverlay hasRenderedOnce={hasRenderedOnce} onShowInCode={handleShowInCode} onReset={handleReset} />
            </div>
            <PreviewErrorFooter hasRenderedOnce={hasRenderedOnce} isCodePanelOpen={!isCodeCollapsed} onShowInCode={handleShowInCode} onReset={handleReset} />
          </div>

          <CollapsibleCodeBlock codeBlockRef={codeBlockRef} isCollapsed={isCodeCollapsed} onToggle={handleToggleCode}>
            <div className="live-code-wrapper">
              <CodeErrorBanner onCopy={handleCopyError} onDismiss={handleDismissError} />
              <div className="live-code-header">
                <span className="live-code-icon">
                  {activeTab === 'js' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <path
                        d="M0 0H15V15H0V0ZM3.94167 12.5333C4.275 13.2417 4.93333 13.825 6.05833 13.825C7.30833 13.825 8.16667 13.1583 8.16667 11.7V6.88333H6.75V11.6667C6.75 12.3833 6.45833 12.5667 6 12.5667C5.51667 12.5667 5.31667 12.2333 5.09167 11.8417L3.94167 12.5333ZM8.925 12.3833C9.34167 13.2 10.1833 13.825 11.5 13.825C12.8333 13.825 13.8333 13.1333 13.8333 11.8583C13.8333 10.6833 13.1583 10.1583 11.9583 9.64167L11.6083 9.49167C11 9.23333 10.7417 9.05833 10.7417 8.64167C10.7417 8.3 11 8.03333 11.4167 8.03333C11.8167 8.03333 12.0833 8.20833 12.325 8.64167L13.4167 7.91667C12.9583 7.11667 12.3083 6.80833 11.4167 6.80833C10.1583 6.80833 9.35 7.60833 9.35 8.66667C9.35 9.81667 10.025 10.3583 11.0417 10.7917L11.3917 10.9417C12.0417 11.225 12.425 11.4 12.425 11.8833C12.425 12.2833 12.05 12.575 11.4667 12.575C10.775 12.575 10.375 12.2167 10.075 11.7167L8.925 12.3833Z"
                        fill="#525866"
                      />
                    </svg>
                  ) : (
                    <svg className="tab-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" style={{ transform: 'scale(0.75)' }}>
                      <path d="M4.73125 2.5H17.5L15.2437 13.955L8.4225 16.25L2.5 13.955L3.1025 10.8962H5.625L5.375 12.16L8.955 13.5437L13.08 12.16L13.6562 9.25H3.40625L3.9 6.69375H14.1575L14.48 5.0525H4.23L4.73125 2.5Z" />
                    </svg>
                  )}
                </span>
                <span className="live-code-title">{activeTab === 'js' ? 'JavaScript' : 'CSS'}</span>
                <div className="live-code-header-actions">
                  <div className="tabs" role="tablist" aria-label="Demo source tabs">
                    <div className="tabs-list">
                      <button
                        className="tab"
                        type="button"
                        role="tab"
                        aria-selected={activeTab === 'js'}
                        data-state={activeTab === 'js' ? 'active' : 'inactive'}
                        onClick={() => setActiveTab('js')}
                      >
                        <span className="tab-icon-container">
                          <svg className="tab-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                            <path d="M2.5 2.5H17.5V17.5H2.5V2.5ZM6.44167 15.0333C6.775 15.7417 7.43333 16.325 8.55833 16.325C9.80833 16.6667 10.6667 15.6583 10.6667 14.2V9.38333H9.25V14.1667C9.25 14.8833 8.95833 15.0667 8.5 15.0667C8.01667 15.0667 7.81667 14.7333 7.59167 14.3417L6.44167 15.0333ZM11.425 14.8833C11.8417 15.7 12.6833 16.325 14 16.325C15.3333 16.325 16.3333 15.6333 16.3333 14.3583C16.3333 13.1833 15.6583 12.6583 14.4583 12.1417L14.1083 11.9917C13.5 11.7333 13.2417 11.5583 13.2417 11.1417C13.2417 10.8 13.5 10.5333 13.9167 10.5333C14.3167 10.5333 14.5833 10.7083 14.825 11.1417L15.9167 10.4167C15.4583 9.61667 14.8083 9.30833 13.9167 9.30833C12.6583 9.30833 11.85 10.1083 11.85 11.1667C11.85 12.3167 12.525 12.8583 13.5417 13.2917L13.8917 13.4417C14.5417 13.725 14.925 13.9 14.925 14.3833C14.925 14.7833 14.55 15.075 13.9667 15.075C13.275 15.075 12.875 14.7167 12.575 14.2167L11.425 14.8833Z" />
                          </svg>
                        </span>
                      </button>
                      {cssCode && (
                        <button
                          className="tab"
                          type="button"
                          role="tab"
                          aria-selected={activeTab === 'css'}
                          data-state={activeTab === 'css' ? 'active' : 'inactive'}
                          onClick={() => setActiveTab('css')}
                        >
                          <span className="tab-icon-container">
                            <svg className="tab-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                              <path d="M4.73125 2.5H17.5L15.2437 13.955L8.4225 16.25L2.5 13.955L3.1025 10.8962H5.625L5.375 12.16L8.955 13.5437L13.08 12.16L13.6562 9.25H3.40625L3.9 6.69375H14.1575L14.48 5.0525H4.23L4.73125 2.5Z" />
                            </svg>
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="live-code-action-tooltip-host" onMouseEnter={() => setIsCopyTooltipOpen(true)} onMouseLeave={() => setIsCopyTooltipOpen(false)}>
                    <button
                      className="live-code-action-button"
                      type="button"
                      onClick={handleCopy}
                      onFocus={() => setIsCopyTooltipOpen(true)}
                      onBlur={() => setIsCopyTooltipOpen(false)}
                      aria-label="Copy code"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="19" viewBox="0 0 15 19" fill="none">
                        <path
                          d="M13.3333 1.66667H9.85C9.5 0.7 8.58333 0 7.5 0C6.41667 0 5.5 0.7 5.15 1.66667H1.66667C0.75 1.66667 0 2.41667 0 3.33333V16.6667C0 17.5833 0.75 18.3333 1.66667 18.3333H13.3333C14.25 18.3333 15 17.5833 15 16.6667V3.33333C15 2.41667 14.25 1.66667 13.3333 1.66667ZM7.5 1.66667C7.95833 1.66667 8.33333 2.04167 8.33333 2.5C8.33333 2.95833 7.95833 3.33333 7.5 3.33333C7.04167 3.33333 6.66667 2.95833 6.66667 2.5C6.66667 2.04167 7.04167 1.66667 7.5 1.66667ZM12.5 16.6667H2.5C2.04167 16.6667 1.66667 16.2917 1.66667 15.8333V4.16667C1.66667 3.70833 2.04167 3.33333 2.5 3.33333H3.33333V4.16667C3.33333 5.08333 4.08333 5.83333 5 5.83333H10C10.9167 5.83333 11.6667 5.08333 11.6667 4.16667V3.33333H12.5C12.9583 3.33333 13.3333 3.70833 13.3333 4.16667V15.8333C13.3333 16.2917 12.9583 16.6667 12.5 16.6667Z"
                          fill="#222530"
                        />
                      </svg>
                    </button>
                    {isCopyTooltipOpen && (
                      <div
                        className="live-code-copy-tooltip"
                        role="tooltip"
                        style={{
                          borderColor: isCopied ? 'var(--states-success-sub-base, #A0E6BA)' : 'var(--border-dark, #525866)',
                          background: isCopied ? 'var(--states-success-light, #CAF1D8)' : 'var(--background-darkest, #222530)',
                          color: isCopied ? 'var(--text-darkest, #222530)' : '#fff',
                        }}
                      >
                        {isCopied && (
                          <div className="live-code-copy-tooltip-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path
                                d="M6.66667 0C2.98667 0 0 2.98667 0 6.66667C0 10.3467 2.98667 13.3333 6.66667 13.3333C10.3467 13.3333 13.3333 10.3467 13.3333 6.66667C13.3333 2.98667 10.3467 0 6.66667 0ZM4.86 9.52667L2.46667 7.13333C2.20667 6.87333 2.20667 6.45333 2.46667 6.19333C2.72667 5.93333 3.14667 5.93333 3.40667 6.19333L5.33333 8.11333L9.92 3.52667C10.18 3.26667 10.6 3.26667 10.86 3.52667C11.12 3.78667 11.12 4.20667 10.86 4.46667L5.8 9.52667C5.54667 9.78667 5.12 9.78667 4.86 9.52667Z"
                                fill="#188A42"
                              />
                            </svg>
                          </div>
                        )}
                        {isCopied ? 'Copied successfully' : 'Copy'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {activeTab === 'js' ? (
                <LiveEditor theme={selectedTheme} className="live-editor" code={formattedCode} />
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
