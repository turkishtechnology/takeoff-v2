import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Getting started',
      collapsed: false,
      items: ['intro', 'installation', 'ai-assistants'],
    },
    {
      type: 'category',
      label: 'Foundations',
      collapsed: false,
      items: ['foundations/theming', 'foundations/composition-styling'],
    },
    {
      type: 'category',
      label: 'Components',
      collapsed: false,
      items: [
        'components/index',
        'components/accordion',
        'components/alert',
        'components/badge',
        'components/breadcrumb',
        'components/button',
        'components/calendar',
        'components/card',
        'components/checkbox',
        'components/chip',
        'components/drawer',
        'components/dialog',
        'components/divider',
        'components/dropdown',
        'components/field',
        'components/input',
        'components/label',
        'components/popover',
        'components/progress',
        'components/select',
        'components/skeleton',
        'components/slider',
        'components/spinner',
        'components/stepper',
        'components/switch',
        'components/radio',
        'components/table',
        'components/tabs',
        'components/toast',
        'components/tooltip',
        'components/upload',
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
