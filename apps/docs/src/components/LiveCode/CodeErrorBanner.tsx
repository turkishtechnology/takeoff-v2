import { useContext, useEffect, useRef, useState } from 'react';
import Translate from '@docusaurus/Translate';
import { LiveContext } from 'react-live';
import { AlertCircleIconOutlinedRounded } from '@takeoff-icons/react/alert-circle';
import { CheckIconOutlinedRounded } from '@takeoff-icons/react/check';
import { CloseIconOutlinedRounded } from '@takeoff-icons/react/close';
import { CopyIconOutlinedRounded } from '@takeoff-icons/react/copy';
import { parseErrorString } from './utils';

interface CodeErrorBannerProps {
  onCopy: (errorName: string, errorMessage: string, stack: string) => void;
  onDismiss: () => void;
}

export const CodeErrorBanner = ({ onCopy, onDismiss }: CodeErrorBannerProps) => {
  const { error } = useContext(LiveContext);
  const previousErrorRef = useRef(error);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (error !== previousErrorRef.current) {
      previousErrorRef.current = error;
      setIsDismissed(false);
      setIsCopied(false);
    }
  }, [error]);

  if (!error || isDismissed) {
    return null;
  }

  const parsedError = parseErrorString(error);
  const errorState = { hasError: true as const, ...parsedError, timestamp: 0 };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss();
  };

  const handleCopy = () => {
    onCopy(errorState.errorName, errorState.errorMessage, errorState.stack);
    setIsCopied(true);
    window.setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="code-error-banner" role="alert">
      <AlertCircleIconOutlinedRounded className="code-error-banner-icon" />
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
          {isCopied ? <CheckIconOutlinedRounded /> : <CopyIconOutlinedRounded />}
          {isCopied ? <Translate id="liveCode.copied">Copied</Translate> : <Translate id="liveCode.copy">Copy</Translate>}
        </button>
        <button className="code-error-banner-btn code-error-banner-dismiss" type="button" onClick={handleDismiss} title="Dismiss" aria-label="Dismiss error">
          <CloseIconOutlinedRounded />
        </button>
      </div>
    </div>
  );
};

CodeErrorBanner.displayName = 'CodeErrorBanner';

export default CodeErrorBanner;
