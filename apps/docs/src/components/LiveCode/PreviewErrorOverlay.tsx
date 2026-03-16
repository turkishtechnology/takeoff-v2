import { useContext } from 'react';
import Translate from '@docusaurus/Translate';
import { LiveContext } from 'react-live';
import { CodeIcon, ErrorIcon, ResetIcon } from './icons';

interface PreviewErrorOverlayProps {
  hasRenderedOnce: boolean;
  onShowInCode: () => void;
  onReset: () => void;
}

export const PreviewErrorOverlay = ({ hasRenderedOnce, onShowInCode, onReset }: PreviewErrorOverlayProps) => {
  const { error } = useContext(LiveContext);

  if (!error) return null;
  if (hasRenderedOnce) return null;

  return (
    <div className="preview-error-overlay" role="alert">
      <div className="preview-error-overlay-content">
        <div className="preview-error-overlay-icon">
          <ErrorIcon size={20} />
        </div>
        <span className="preview-error-overlay-title">
          <Translate id="liveCode.previewFailed">Preview failed</Translate>
        </span>
        <div className="preview-error-overlay-actions">
          <button className="preview-error-action" type="button" onClick={onShowInCode}>
            <CodeIcon size={14} />
            <Translate id="liveCode.showInCode">Show in code</Translate>
          </button>
          <button className="preview-error-action" type="button" onClick={onReset}>
            <ResetIcon size={14} />
            <Translate id="liveCode.reset">Reset</Translate>
          </button>
        </div>
      </div>
    </div>
  );
};

PreviewErrorOverlay.displayName = 'PreviewErrorOverlay';

export default PreviewErrorOverlay;
