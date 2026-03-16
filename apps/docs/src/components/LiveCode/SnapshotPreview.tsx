import { type ComponentType, type PropsWithChildren, useContext, useEffect, useRef } from 'react';
import { LiveContext, LivePreview, LiveProvider } from 'react-live';

interface SnapshotPreviewProps {
  onHasRendered: () => void;
  previewWrapper?: ComponentType<PropsWithChildren>;
  scope: Record<string, unknown>;
}

export const SnapshotPreview = ({ onHasRendered, previewWrapper: PreviewWrapper, scope }: SnapshotPreviewProps) => {
  const { error, code } = useContext(LiveContext);
  const lastGoodCodeRef = useRef<string>('');
  const hasCalledRenderedRef = useRef(false);

  useEffect(() => {
    if (!error && code) {
      lastGoodCodeRef.current = code;
      if (!hasCalledRenderedRef.current) {
        hasCalledRenderedRef.current = true;
        onHasRendered();
      }
    }
  }, [error, code, onHasRendered]);

  const showSnapshot = !!error && !!lastGoodCodeRef.current;

  return (
    <>
      {!error &&
        (PreviewWrapper ? (
          <PreviewWrapper>
            <LivePreview className="live-preview" />
          </PreviewWrapper>
        ) : (
          <LivePreview className="live-preview" />
        ))}
      {showSnapshot && (
        <LiveProvider code={lastGoodCodeRef.current} scope={scope} noInline={false}>
          {PreviewWrapper ? (
            <PreviewWrapper>
              <LivePreview className="live-preview live-preview-snapshot" />
            </PreviewWrapper>
          ) : (
            <LivePreview className="live-preview live-preview-snapshot" />
          )}
        </LiveProvider>
      )}
    </>
  );
};

SnapshotPreview.displayName = 'SnapshotPreview';

export default SnapshotPreview;
