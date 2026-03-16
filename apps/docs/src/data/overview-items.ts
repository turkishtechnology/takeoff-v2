const LOCAL_COMPONENT_BASE_PATH = '/docs/components';

export type OverviewItem = {
  title: string;
  href: string;
  image: string;
  imageDark: string;
  isNew?: boolean;
};

type OverviewSeed = Omit<OverviewItem, 'href'> & {
  slug: string;
};

function resolveComponentHref(slug: string): string {
  return `${LOCAL_COMPONENT_BASE_PATH}/${slug.toLowerCase()}`;
}

const overviewSeeds: OverviewSeed[] = [
  {
    title: 'Accordion',
    slug: 'Accordion',
    image: '/img/overview/accordion.png',
    imageDark: '/img/overview/accordion-dark.png',
  },
  {
    title: 'Alert',
    slug: 'Alert',
    image: '/img/overview/alert.png',
    imageDark: '/img/overview/alert-dark.png',
  },
  {
    title: 'Avatar',
    slug: 'Avatar',
    image: '/img/overview/avatar.png',
    imageDark: '/img/overview/avatar-dark.png',
  },
  {
    title: 'Badge',
    slug: 'Badge',
    image: '/img/overview/badge.png',
    imageDark: '/img/overview/badge-dark.png',
  },
  {
    title: 'Breadcrumb',
    slug: 'Breadcrumb',
    image: '/img/overview/breadcrumb.png',
    imageDark: '/img/overview/breadcrumb-dark.png',
  },
  {
    title: 'Button',
    slug: 'Button',
    image: '/img/overview/button.png',
    imageDark: '/img/overview/button-dark.png',
  },
  {
    title: 'Card',
    slug: 'Card',
    image: '/img/overview/card.png',
    imageDark: '/img/overview/card-dark.png',
  },
  {
    title: 'Checkbox',
    slug: 'Checkbox',
    image: '/img/overview/checkbox.png',
    imageDark: '/img/overview/checkbox-dark.png',
  },
  {
    title: 'Chips',
    slug: 'Chips',
    image: '/img/overview/chips.png',
    imageDark: '/img/overview/chips-dark.png',
  },
  {
    title: 'Color Picker',
    slug: 'Color-Picker',
    image: '/img/overview/color-picker.png',
    imageDark: '/img/overview/color-picker-dark.png',
    isNew: true,
  },
  {
    title: 'Currency Input',
    slug: 'Currency-Input',
    image: '/img/overview/input.png',
    imageDark: '/img/overview/input-dark.png',
  },
  {
    title: 'Datepicker',
    slug: 'Datepicker',
    image: '/img/overview/datepicker.png',
    imageDark: '/img/overview/datepicker-dark.png',
  },
  {
    title: 'Dialog',
    slug: 'Dialog',
    image: '/img/overview/dialog.png',
    imageDark: '/img/overview/dialog-dark.png',
  },
  {
    title: 'Divider',
    slug: 'Divider',
    image: '/img/overview/input.png',
    imageDark: '/img/overview/input-dark.png',
    isNew: true,
  },
  {
    title: 'Drawer',
    slug: 'Drawer',
    image: '/img/overview/drawer.png',
    imageDark: '/img/overview/drawer-dark.png',
  },
  {
    title: 'Dropdown',
    slug: 'Dropdown',
    image: '/img/overview/select.png',
    imageDark: '/img/overview/select-dark.png',
    isNew: true,
  },
  {
    title: 'Input',
    slug: 'Input',
    image: '/img/overview/input.png',
    imageDark: '/img/overview/input-dark.png',
  },
  {
    title: 'Pagination',
    slug: 'Pagination',
    image: '/img/overview/pagination.png',
    imageDark: '/img/overview/pagination-dark.png',
  },
  {
    title: 'Radio',
    slug: 'Radio',
    image: '/img/overview/radio.png',
    imageDark: '/img/overview/radio-dark.png',
  },
  {
    title: 'Rating',
    slug: 'Rating',
    image: '/img/overview/rating.png',
    imageDark: '/img/overview/rating-dark.png',
    isNew: true,
  },
  {
    title: 'Select',
    slug: 'Select',
    image: '/img/overview/select.png',
    imageDark: '/img/overview/select-dark.png',
  },
  {
    title: 'Spinner',
    slug: 'Spinner',
    image: '/img/overview/select.png',
    imageDark: '/img/overview/select-dark.png',
    isNew: true,
  },
  {
    title: 'Stepper',
    slug: 'Stepper',
    image: '/img/overview/stepper.png',
    imageDark: '/img/overview/stepper-dark.png',
    isNew: true,
  },
  {
    title: 'Table',
    slug: 'Table',
    image: '/img/overview/table.png',
    imageDark: '/img/overview/table-dark.png',
  },
  {
    title: 'Tabs',
    slug: 'Tabs',
    image: '/img/overview/tabs.png',
    imageDark: '/img/overview/tabs-dark.png',
  },
  {
    title: 'Textarea',
    slug: 'Textarea',
    image: '/img/overview/input.png',
    imageDark: '/img/overview/input-dark.png',
  },
  {
    title: 'Timeline',
    slug: 'Timeline',
    image: '/img/overview/input.png',
    imageDark: '/img/overview/input-dark.png',
    isNew: true,
  },
  {
    title: 'Toggle',
    slug: 'Toggle',
    image: '/img/overview/toggle.png',
    imageDark: '/img/overview/toggle-dark.png',
  },
  {
    title: 'Tooltip',
    slug: 'Tooltip',
    image: '/img/overview/tooltip.png',
    imageDark: '/img/overview/tooltip-dark.png',
  },
];

export const overviewItems: OverviewItem[] = overviewSeeds.map(({ slug, ...item }) => ({
  ...item,
  href: resolveComponentHref(slug),
}));
