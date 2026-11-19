import path from 'node:path';
import type { Plugin } from '@docusaurus/types';

/**
 * Keeps the Takeoff Headless (Spar) docs styles on the Headless pages.
 *
 * Those styles came from the standalone Spar site, where they were global:
 * Infima variables on `:root`, a font on `*`, tab overrides and so on. Every
 * stylesheet under `src/css/headless/` is rewritten so each selector only
 * matches below `html.headless-scope`, the class `src/theme/Root.tsx` puts on
 * `<html>` for every `/headless` route.
 */

export const HEADLESS_SCOPE_CLASS = 'headless-scope';
const SCOPE = `html.${HEADLESS_SCOPE_CLASS}`;
const HEADLESS_CSS_DIR = `${path.sep}src${path.sep}css${path.sep}headless${path.sep}`;

/** `:root`, `html…` and `[data-theme…]` all target `<html>`, so they take the scope on the same element. */
export function scopeSelector(selector: string): string {
  const s = selector.trim();
  if (s.startsWith(':root')) {
    return SCOPE + s.slice(':root'.length);
  }
  if (/^html(?![\w-])/.test(s)) {
    return SCOPE + s.slice('html'.length);
  }
  if (s.startsWith('[data-theme')) {
    return SCOPE + s;
  }
  return `${SCOPE} ${s}`;
}

// Minimal shapes of the PostCSS nodes used here; apps/docs does not depend on postcss directly.
interface CssRule {
  selectors: string[];
  parent?: { type: string; name?: string };
}
interface CssRoot {
  walkRules(callback: (rule: CssRule) => void): void;
}

const headlessScopePostcss = {
  postcssPlugin: 'takeoff-headless-scope',
  Once(root: CssRoot, { result }: { result: { opts: { from?: string } } }) {
    if (!result.opts.from?.includes(HEADLESS_CSS_DIR)) {
      return;
    }
    root.walkRules(rule => {
      // `from`, `to` and percentages inside @keyframes are not selectors.
      if (rule.parent?.type === 'atrule' && /keyframes$/i.test(rule.parent.name ?? '')) {
        return;
      }
      rule.selectors = rule.selectors.map(scopeSelector);
    });
  },
};

export default function headlessScopePlugin(): Plugin {
  return {
    name: 'headless-scope-plugin',
    configurePostCss(postcssOptions) {
      postcssOptions.plugins.push(headlessScopePostcss);
      return postcssOptions;
    },
  };
}
