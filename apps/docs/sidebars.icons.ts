import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  iconsSidebar: [
    'gallery',
    {
      type: 'category',
      label: 'Getting started',
      collapsed: false,
      items: ['intro', 'installation'],
    },
    {
      type: 'category',
      label: 'Usage',
      collapsed: false,
      items: ['usage/react', 'usage/font', 'usage/svg'],
    },
    'metadata',
  ],
};

export default sidebars;
