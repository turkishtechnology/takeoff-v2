import { useState, type JSX } from 'react';
import styles from './InstallBlock.module.css';

type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun';

const INSTALL_COMMANDS: Record<PackageManager, string> = {
  pnpm: 'pnpm add @takeoff-ui/react-spar @takeoff-design/tokens @turkish-technology/spar',
  npm: 'npm install @takeoff-ui/react-spar @takeoff-design/tokens @turkish-technology/spar',
  yarn: 'yarn add @takeoff-ui/react-spar @takeoff-design/tokens @turkish-technology/spar',
  bun: 'bun add @takeoff-ui/react-spar @takeoff-design/tokens @turkish-technology/spar',
};

const CSS_IMPORT = `import '@takeoff-design/tokens/css/default/theme.css';`;

const PROVIDER_SNIPPET = `import { SparReactProvider } from '@takeoff-ui/react-spar';
import '@takeoff-design/tokens/css/default/theme.css';

export function App({ children }) {
  return (
    <SparReactProvider colorMode="light">
      {children}
    </SparReactProvider>
  );
}`;

function CopyButton({ value }: { value: string }): JSX.Element {
  const [copied, setCopied] = useState(false);
  const onCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // noop — clipboard denied
    }
  };
  return (
    <button type="button" className={`${styles.copyBtn} ${copied ? styles.copied : ''}`} onClick={onCopy} aria-label={copied ? 'Copied to clipboard' : 'Copy to clipboard'}>
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export default function InstallBlock(): JSX.Element {
  const [pm, setPm] = useState<PackageManager>('pnpm');
  const activeCommand = INSTALL_COMMANDS[pm];

  return (
    <section className={styles.section} aria-labelledby="runway-install-title">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <span className={styles.eyebrow}>Installation</span>
          <h2 id="runway-install-title" className={styles.title}>
            Install once. Theme from the root.
          </h2>
          <p className={styles.lede}>
            Install the React package with its token and primitive peers, import one theme file, and wrap your app once. From there, color mode, tokens, and component defaults flow
            from the root.
          </p>
        </div>

        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepHead}>
              <span className={styles.stepLabel}>
                <span className={styles.stepIndex}>01</span>
                Install
              </span>
              <div className={styles.tabs} role="tablist" aria-label="Package manager">
                {(['pnpm', 'npm', 'yarn', 'bun'] as PackageManager[]).map(candidate => (
                  <button
                    key={candidate}
                    type="button"
                    role="tab"
                    aria-selected={pm === candidate}
                    className={`${styles.tab} ${pm === candidate ? styles.tabActive : ''}`}
                    onClick={() => setPm(candidate)}
                  >
                    {candidate}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.codeWrap}>
              <pre>
                <code>
                  <span className={styles.prompt}>$</span>
                  {activeCommand}
                </code>
              </pre>
              <CopyButton value={activeCommand} />
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepHead}>
              <span className={styles.stepLabel}>
                <span className={styles.stepIndex}>02</span>
                Import tokens
              </span>
              <span className={styles.tab}>app entry</span>
            </div>
            <div className={styles.codeWrap}>
              <pre>
                <code>{CSS_IMPORT}</code>
              </pre>
              <CopyButton value={CSS_IMPORT} />
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepHead}>
              <span className={styles.stepLabel}>
                <span className={styles.stepIndex}>03</span>
                Wrap the app
              </span>
              <span className={styles.tab}>root.tsx</span>
            </div>
            <div className={styles.codeWrap}>
              <pre>
                <code>{PROVIDER_SNIPPET}</code>
              </pre>
              <CopyButton value={PROVIDER_SNIPPET} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
