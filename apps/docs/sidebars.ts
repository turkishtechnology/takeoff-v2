import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Getting started',
      collapsed: false,
      items: ['intro', 'installation'],
    },
    {
      type: 'category',
      label: 'Components',
      collapsed: false,
      items: ['components/accordion', 'components/drawer'],
    },
    {
      type: 'category',
      label: 'Discover',
      collapsed: false,
      items: ['roadmap', 'contributing'],
    },
  ],
};

export default sidebars;
