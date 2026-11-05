import { useContext, useEffect, useId, useRef, type ReactNode } from 'react';
import Translate from '@docusaurus/Translate';
import { LiveContext } from 'react-live';
import { ArrowCodeIconOutlinedRounded } from '@takeoff-icons/react/arrow-code';

interface CollapsibleCodeBlockProps {
  children?: ReactNode;
  headerActions?: ReactNode;
  isCollapsed: boolean;
  onToggle: () => void;
  /** Text of the toggle. Defaults to "Code"; e.g. a file name. */
  label?: ReactNode;
}

export const CollapsibleCodeBlock = ({ children, headerActions, isCollapsed, onToggle, label }: CollapsibleCodeBlockProps) => {
  const { error } = useContext(LiveContext);
  const contentId = useId();
  const previousErrorRef = useRef(error);

  useEffect(() => {
    const errorJustAppeared = Boolean(error && !previousErrorRef.current);
    previousErrorRef.current = error;

    if (errorJustAppeared && isCollapsed) {
      onToggle();
    }
  }, [error, isCollapsed, onToggle]);

  return (
    <div className="collapsible-code-block" data-state={isCollapsed ? 'closed' : 'open'}>
      <div className="collapsible-header">
        <button className="collapsible-toggle" onClick={onToggle} type="button" aria-controls={contentId} aria-expanded={!isCollapsed}>
          <ArrowCodeIconOutlinedRounded className="toggle-icon" />
          <span className="toggle-text">{label ?? <Translate id="liveCode.codeToggle">Code</Translate>}</span>
        </button>

        {!isCollapsed && headerActions && <div className="collapsible-header-actions">{headerActions}</div>}
      </div>

      <div className="collapsible-content" id={contentId} aria-hidden={isCollapsed} style={{ display: isCollapsed ? 'none' : 'block' }}>
        {children}
      </div>
    </div>
  );
};

CollapsibleCodeBlock.displayName = 'CollapsibleCodeBlock';

export default CollapsibleCodeBlock;
