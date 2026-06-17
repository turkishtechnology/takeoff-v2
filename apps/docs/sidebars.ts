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
      items: [
        'components/accordion',
        'components/badge',
        'components/breadcrumb',
        'components/button',
        'components/checkbox',
        'components/drawer',
        'components/input',
        'components/popover',
        'components/select',
        'components/switch',
        'components/radio',
        'components/tooltip',
      ],
    },
    {
      type: 'category',
      label: 'Forms',
      collapsed: false,
      items: ['forms/react-hook-form', 'forms/tanstack-form'],
    },
  ],
};

export default sidebars;
