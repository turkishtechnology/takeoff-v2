import { useContext, useEffect, useId, useRef, type ReactNode, type RefObject } from 'react';
import Translate from '@docusaurus/Translate';
import { LiveContext } from 'react-live';
import { ChevronDownIcon, CodeToggleIcon } from './icons';

interface CollapsibleCodeBlockProps {
  children?: ReactNode;
  codeBlockRef?: RefObject<HTMLDivElement | null>;
  isCollapsed: boolean;
  onToggle: () => void;
}

export const CollapsibleCodeBlock = ({ children, codeBlockRef, isCollapsed, onToggle }: CollapsibleCodeBlockProps) => {
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
    <div className="collapsible-code-block">
      <button className="collapsible-toggle" onClick={onToggle} type="button" aria-controls={contentId} aria-expanded={!isCollapsed}>
        <span className="toggle-icon">
          <CodeToggleIcon />
        </span>
        <span className="toggle-text">
          <Translate id="liveCode.codeToggle">Code</Translate>
        </span>
        <span className="expand-icon">
          <ChevronDownIcon />
        </span>
      </button>

      <div className="collapsible-content" id={contentId} ref={codeBlockRef} aria-hidden={isCollapsed} style={{ display: isCollapsed ? 'none' : 'block' }}>
        {children}
      </div>
    </div>
  );
};

CollapsibleCodeBlock.displayName = 'CollapsibleCodeBlock';

export default CollapsibleCodeBlock;
