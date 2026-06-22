import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  iconsSidebar: [
    {
      type: 'category',
      label: 'Getting started',
      collapsed: false,
      items: ['intro', 'installation'],
    },
    'gallery',
    {
      type: 'category',
      label: 'Usage',
      collapsed: false,
      items: ['usage/react', 'usage/web-component', 'usage/font', 'usage/svg', 'usage/sprite'],
    },
    'metadata',
  ],
};

export default sidebars;
