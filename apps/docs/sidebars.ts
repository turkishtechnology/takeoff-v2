import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Getting started',
      collapsed: false,
      items: ['intro', 'installation', 'roadmap'],
    },
    {
      type: 'category',
      label: 'Components',
      collapsed: false,
      items: ['components/accordion', 'components/badge', 'components/button', 'components/drawer', 'components/tooltip', 'components/input', 'components/select'],
    },
  ],
};

export default sidebars;
