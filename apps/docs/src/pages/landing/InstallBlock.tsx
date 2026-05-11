import { useState, type JSX } from 'react';
import styles from './InstallBlock.module.css';

type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun';

const INSTALL_COMMANDS: Record<PackageManager, string> = {
  pnpm: 'pnpm add @takeoff-ui/react-spar @takeoff-design/tokens',
  npm: 'npm install @takeoff-ui/react-spar @takeoff-design/tokens',
  yarn: 'yarn add @takeoff-ui/react-spar @takeoff-design/tokens',
  bun: 'bun add @takeoff-ui/react-spar @takeoff-design/tokens',
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

function InstallCommandCode({ command }: { command: string }): JSX.Element {
  const [tool, verb, ...packages] = command.split(' ');

  return (
    <code className={styles.code}>
      <span className={styles.codeLine}>
        <span className={styles.prompt}>$</span>
        <span className={styles.cliTool}>{tool}</span>
        <span className={styles.punct}> </span>
        <span className={styles.cliVerb}>{verb}</span>
        {packages.map(pkg => (
          <span key={pkg}>
            <span className={styles.punct}> </span>
            <span className={styles.cliPackage}>{pkg}</span>
          </span>
        ))}
      </span>
    </code>
  );
}

function ImportTokensCode(): JSX.Element {
  return (
    <code className={styles.code}>
      <span className={styles.codeLine}>
        <span className={styles.kw}>import</span>
        <span className={styles.punct}> </span>
        <span className={styles.str}>'@takeoff-design/tokens/css/default/theme.css'</span>
        <span className={styles.punct}>;</span>
      </span>
    </code>
  );
}

function ProviderCode(): JSX.Element {
  return (
    <code className={styles.code}>
      <span className={styles.codeLine}>
        <span className={styles.kw}>import</span>
        <span className={styles.punct}> {'{ '}</span>
        <span className={styles.fn}>SparReactProvider</span>
        <span className={styles.punct}>{' }'}</span>
        <span className={styles.punct}> </span>
        <span className={styles.kw}>from</span>
        <span className={styles.punct}> </span>
        <span className={styles.str}>'@takeoff-ui/react-spar'</span>
        <span className={styles.punct}>;</span>
      </span>
      <span className={styles.codeLine}>
        <span className={styles.kw}>import</span>
        <span className={styles.punct}> </span>
        <span className={styles.str}>'@takeoff-design/tokens/css/default/theme.css'</span>
        <span className={styles.punct}>;</span>
      </span>
      <span className={styles.codeLine}> </span>
      <span className={styles.codeLine}>
        <span className={styles.kw}>export</span>
        <span className={styles.punct}> </span>
        <span className={styles.kw}>function</span>
        <span className={styles.punct}> </span>
        <span className={styles.fn}>App</span>
        <span className={styles.punct}>({'{ '}</span>
        <span className={styles.attr}>children</span>
        <span className={styles.punct}>
          {' }'}) {'{'}
        </span>
      </span>
      <span className={styles.codeLine}>
        {'  '}
        <span className={styles.kw}>return</span>
        <span className={styles.punct}> (</span>
      </span>
      <span className={styles.codeLine}>
        {'    '}
        <span className={styles.punct}>&lt;</span>
        <span className={styles.tag}>SparReactProvider</span>
        <span className={styles.punct}> </span>
        <span className={styles.attr}>colorMode</span>
        <span className={styles.punct}>=</span>
        <span className={styles.str}>"light"</span>
        <span className={styles.punct}>&gt;</span>
      </span>
      <span className={styles.codeLine}>
        {'      '}
        <span className={styles.punct}>{'{'}</span>
        <span className={styles.attr}>children</span>
        <span className={styles.punct}>{'}'}</span>
      </span>
      <span className={styles.codeLine}>
        {'    '}
        <span className={styles.punct}>&lt;/</span>
        <span className={styles.tag}>SparReactProvider</span>
        <span className={styles.punct}>&gt;</span>
      </span>
      <span className={styles.codeLine}>
        {'  '}
        <span className={styles.punct}>);</span>
      </span>
      <span className={styles.codeLine}>
        <span className={styles.punct}>{'}'}</span>
      </span>
    </code>
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
            Install the React package with the token package, import one theme file, and wrap your app once. Spar primitives are pulled in by the React package unless you import
            them directly.
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
                <InstallCommandCode command={activeCommand} />
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
                <ImportTokensCode />
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
                <ProviderCode />
              </pre>
              <CopyButton value={PROVIDER_SNIPPET} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
