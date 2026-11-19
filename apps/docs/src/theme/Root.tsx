import React, { useEffect } from 'react';
import { useLocation } from '@docusaurus/router';
import { HtmlClassNameProvider } from '@docusaurus/theme-common';
import useBaseUrl from '@docusaurus/useBaseUrl';

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

// Every /headless route gets `headless-scope` on <html>; the Takeoff Headless styles
// only match below it (see plugins/headless-scope.ts). Set during SSR too, so no flash.
function HeadlessScope({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const headlessBase = useBaseUrl('/headless');
  const inHeadless = pathname === headlessBase || pathname.startsWith(`${headlessBase}/`);

  return inHeadless ? <HtmlClassNameProvider className="headless-scope">{children}</HtmlClassNameProvider> : <>{children}</>;
}

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SchemeSyncer />
      <HeadlessScope>{children}</HeadlessScope>
    </>
  );
}
