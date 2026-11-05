import type { Plugin } from '@docusaurus/types';

const RAW_QUERY = /^\?raw$/;

/**
 * Lets docs import a file's text with a `?raw` suffix, e.g.
 * `import source from './Chatbot.tsx?raw'`. Blocks use it to show the exact
 * file the preview renders, so the copyable source can never drift from it.
 *
 * The existing rules (babel for .tsx, css, …) are told to skip `?raw`
 * requests; otherwise they would transpile the file before it is read as text.
 * Only rules already registered when this plugin runs are patched.
 */
export default function rawSourcePlugin(): Plugin {
  return {
    name: 'raw-source-plugin',
    configureWebpack(config) {
      for (const rule of config.module?.rules ?? []) {
        if (rule && typeof rule === 'object' && !rule.resourceQuery) {
          rule.resourceQuery = { not: [RAW_QUERY] };
        }
      }

      return {
        module: {
          rules: [
            {
              resourceQuery: RAW_QUERY,
              type: 'asset/source',
            },
          ],
        },
      };
    },
  };
}
