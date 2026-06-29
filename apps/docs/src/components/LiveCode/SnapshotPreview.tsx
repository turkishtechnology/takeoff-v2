import { type ComponentType, type PropsWithChildren, useContext, useEffect, useRef } from 'react';
import { LiveContext, LivePreview, LiveProvider } from 'react-live';

interface SnapshotPreviewProps {
  previewWrapper?: ComponentType<PropsWithChildren>;
  scope: Record<string, unknown>;
  noInline?: boolean;
}

export const SnapshotPreview = ({ previewWrapper: PreviewWrapper, scope, noInline = false }: SnapshotPreviewProps) => {
  const { error, code } = useContext(LiveContext);
  const lastGoodCodeRef = useRef<string>('');

  useEffect(() => {
    if (!error && code) {
      lastGoodCodeRef.current = code;
    }
  }, [error, code]);

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
        <LiveProvider code={lastGoodCodeRef.current} scope={scope} noInline={noInline}>
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
