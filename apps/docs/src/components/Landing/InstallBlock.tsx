import { useState, type JSX } from 'react';
import { Tabs } from '@takeoff-ui/react-spar';
import styles from './InstallBlock.module.css';

type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun';

const INSTALL_COMMANDS: Record<PackageManager, string> = {
  pnpm: 'pnpm add @takeoff-ui/react-spar',
  npm: 'npm install @takeoff-ui/react-spar',
  yarn: 'yarn add @takeoff-ui/react-spar',
  bun: 'bun add @takeoff-ui/react-spar',
};

const CSS_IMPORT = `import '@takeoff-design/tokens/css/default/theme.css';`;

const PROVIDER_SNIPPET = `import { TakeoffSparProvider } from '@takeoff-ui/react-spar';
import '@takeoff-design/tokens/css/default/theme.css';

export function App({ children }) {
  return (
    <TakeoffSparProvider colorMode="light">
      {children}
    </TakeoffSparProvider>
  );
}`;

const PACKAGE_MANAGERS: PackageManager[] = ['pnpm', 'npm', 'yarn', 'bun'];

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
        <span className={styles.fn}>TakeoffSparProvider</span>
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
        <span className={styles.tag}>TakeoffSparProvider</span>
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
        <span className={styles.tag}>TakeoffSparProvider</span>
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
          <Tabs defaultValue="pnpm" className={styles.step}>
            <div className={styles.stepHead}>
              <span className={styles.stepLabel}>
                <span className={styles.stepIndex}>01</span>
                Install
              </span>
              <Tabs.List aria-label="Package manager" className={styles.tabs}>
                {PACKAGE_MANAGERS.map(candidate => (
                  <Tabs.Trigger key={candidate} value={candidate} className={styles.tab}>
                    {candidate}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>
            </div>
            {PACKAGE_MANAGERS.map(candidate => (
              <Tabs.Content key={candidate} value={candidate} className={styles.codeWrap}>
                <pre>
                  <InstallCommandCode command={INSTALL_COMMANDS[candidate]} />
                </pre>
                <CopyButton value={INSTALL_COMMANDS[candidate]} />
              </Tabs.Content>
            ))}
          </Tabs>

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
