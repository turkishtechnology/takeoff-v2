import React, { useEffect } from 'react';

function syncSchemeFromTheme(html: HTMLElement) {
  if (html.getAttribute('data-theme') === 'dark') {
    html.setAttribute('data-scheme', 'dark');
  } else {
    html.removeAttribute('data-scheme');
  }
}

if (typeof document !== 'undefined') {
  const html = document.documentElement;
  if (!html.hasAttribute('data-theme')) {
    html.setAttribute('data-theme', 'dark');
  }
  syncSchemeFromTheme(html);
}

// Sync Docusaurus dark mode (data-theme='dark') → our token system (data-scheme='dark')
function SchemeSyncer() {
  useEffect(() => {
    const html = document.documentElement;

    const sync = () => syncSchemeFromTheme(html);

    sync();

    // Observe Docusaurus theme changes
    const observer = new MutationObserver(mutations => {
      for (const m of mutations) {
        if (m.attributeName === 'data-theme') {
          sync();
        }
      }
    });
    observer.observe(html, { attributes: true, attributeFilter: ['data-theme'] });

    return () => observer.disconnect();
  }, []);

  return null;
}

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SchemeSyncer />
      {children}
    </>
  );
}
