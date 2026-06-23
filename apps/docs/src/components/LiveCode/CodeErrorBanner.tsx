import { useContext, useEffect, useRef, useState } from 'react';
import Translate from '@docusaurus/Translate';
import { LiveContext } from 'react-live';
import { parseErrorString } from './utils';
import { CheckIcon, CloseIcon, CopyIcon, ErrorIcon } from './icons';

interface CodeErrorBannerProps {
  onCopy: (errorName: string, errorMessage: string, stack: string) => void;
}

export const CodeErrorBanner = ({ onCopy }: CodeErrorBannerProps) => {
  const { error } = useContext(LiveContext);
  const previousErrorRef = useRef(error);
  const copyFeedbackTimeoutRef = useRef<number | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (error !== previousErrorRef.current) {
      previousErrorRef.current = error;
      setIsDismissed(false);
      setIsCopied(false);
    }
  }, [error]);

  useEffect(() => {
    return () => {
      if (copyFeedbackTimeoutRef.current !== null) {
        window.clearTimeout(copyFeedbackTimeoutRef.current);
      }
    };
  }, []);

  if (!error || isDismissed) {
    return null;
  }

  const parsedError = parseErrorString(error);
  const errorState = { hasError: true as const, ...parsedError, timestamp: 0 };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  const handleCopy = () => {
    onCopy(errorState.errorName, errorState.errorMessage, errorState.stack);
    setIsCopied(true);

    if (copyFeedbackTimeoutRef.current !== null) {
      window.clearTimeout(copyFeedbackTimeoutRef.current);
    }

    copyFeedbackTimeoutRef.current = window.setTimeout(() => {
      setIsCopied(false);
      copyFeedbackTimeoutRef.current = null;
    }, 2000);
  };

  return (
    <div className="code-error-banner" role="alert">
      <span className="code-error-banner-icon">
        <ErrorIcon size={14} />
      </span>
      <span className="code-error-banner-text">
        <strong>{errorState.errorName}:</strong> {errorState.errorMessage}
      </span>
      <div className="code-error-banner-actions">
        <button
          className={`code-error-banner-btn${isCopied ? ' copied' : ''}`}
          type="button"
          onClick={handleCopy}
          title={isCopied ? 'Copied' : 'Copy error'}
          aria-label={isCopied ? 'Copied' : 'Copy error'}
        >
          {isCopied ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
          {isCopied ? <Translate id="liveCode.copied">Copied</Translate> : <Translate id="liveCode.copy">Copy</Translate>}
        </button>
        <button className="code-error-banner-btn code-error-banner-dismiss" type="button" onClick={handleDismiss} title="Dismiss" aria-label="Dismiss error">
          <CloseIcon size={12} />
        </button>
      </div>
    </div>
  );
};

CodeErrorBanner.displayName = 'CodeErrorBanner';

export default CodeErrorBanner;
