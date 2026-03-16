import { useContext } from 'react';
import Translate from '@docusaurus/Translate';
import { LiveContext } from 'react-live';
import { ErrorIcon } from './icons';
import { getPreviewErrorMessage } from './utils';

interface PreviewErrorFooterProps {
  hasRenderedOnce: boolean;
  isCodePanelOpen: boolean;
  onReset: () => void;
  onShowInCode: () => void;
}

export const PreviewErrorFooter = ({ hasRenderedOnce, isCodePanelOpen, onShowInCode, onReset }: PreviewErrorFooterProps) => {
  const { error } = useContext(LiveContext);

  if (!error || !hasRenderedOnce) return null;
  if (isCodePanelOpen) return null;

  return (
    <div className="preview-error-footer" role="status">
      <span className="preview-error-footer-icon">
        <ErrorIcon size={14} />
      </span>
      <span className="preview-error-footer-text">{getPreviewErrorMessage(error)}</span>
      <div className="preview-error-footer-actions">
        <button className="preview-error-footer-btn" type="button" onClick={onShowInCode}>
          <Translate id="liveCode.showInCode">Show in code</Translate>
        </button>
        <button className="preview-error-footer-btn" type="button" onClick={onReset}>
          <Translate id="liveCode.reset">Reset</Translate>
        </button>
      </div>
    </div>
  );
};

PreviewErrorFooter.displayName = 'PreviewErrorFooter';

export default PreviewErrorFooter;
