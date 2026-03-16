import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    'theming',
    {
      type: 'category',
      label: 'Components',
      items: ['components/overview', 'components/button'],
    },
  ],
};

export default sidebars;
