import React, { useEffect } from 'react';

// Sync Docusaurus dark mode (data-theme='dark') → our token system (data-scheme='dark')
function SchemeSyncer() {
  useEffect(() => {
    const html = document.documentElement;

    const sync = () => {
      const docTheme = html.getAttribute('data-theme');
      if (docTheme === 'dark') {
        html.setAttribute('data-scheme', 'dark');
      } else {
        html.removeAttribute('data-scheme');
      }
    };

    // Initial sync
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
