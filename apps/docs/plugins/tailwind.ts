import type { Plugin } from '@docusaurus/types';
import tailwindcss from '@tailwindcss/postcss';

export default function tailwindPlugin(): Plugin {
  return {
    name: 'tailwind-plugin',
    configurePostCss(postcssOptions) {
      postcssOptions.plugins = [tailwindcss()];
      return postcssOptions;
    },
  };
}
