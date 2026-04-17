import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    'theming',
    {
      type: 'category',
      label: 'Components',
      items: ['Components/Overview', 'Components/Accordion', 'Components/Button', 'Components/Checkbox', 'Components/Dialog', 'Components/Input'],
    },
  ],
};

export default sidebars;
