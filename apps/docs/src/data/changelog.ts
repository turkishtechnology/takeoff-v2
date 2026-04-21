export type ChangelogMedia = {
  kind: 'image' | 'gif';
  src: string;
  alt: string;
};

export type ChangelogSection = {
  title: string;
  items: string[];
  /**
   * When true, the section renders as a closed-by-default disclosure at the
   * bottom of the entry. Intended for long auxiliary lists (Fixes,
   * Infrastructure). Never set on Highlights. The generate-changelog skill
   * flips this on automatically when a section has more than 5 items.
   */
  collapsible?: boolean;
};

export type ChangelogLink = {
  label: string;
  href: string;
};

export type ChangelogEntry = {
  id: string;
  date: string;
  version?: string;
  title: string;
  summary: string;
  media?: ChangelogMedia;
  sections: ChangelogSection[];
  links?: ChangelogLink[];
};

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    id: 'phase-b-forms',
    date: '2026-04-18',
    version: 'Phase B',
    title: 'Form primitives: Button, Checkbox, and Input',
    summary:
      'The first wave of form components lands as compound-only primitives. Button moves to a wrapper-first refactor with a full Playground, Checkbox ships with Indicator / Content / Label / Description, and Input arrives with Label, Field, LeadingIcon, TrailingIcon, and ErrorMessage parts.',
    sections: [
      {
        title: 'Highlights',
        items: [
          'Button — wrapper-first refactor with eight example variations and a full Playground.',
          'Checkbox — compound with Indicator, Content, Label, and Description parts.',
          'Input — compound with Label, Field, LeadingIcon, TrailingIcon, and ErrorMessage.',
        ],
      },
      {
        title: 'Docs',
        items: [
          'Each form primitive ships with a template, state matrix, and validation example.',
          'Playground surfaces are wired through the same live-code infrastructure as the rest of docs.',
        ],
      },
    ],
  },
  {
    id: 'phase-a-foundations',
    date: '2026-03-28',
    version: 'Phase A',
    title: 'Foundations: Accordion, Dialog, and monorepo groundwork',
    summary:
      'The first compound components ship alongside the monorepo professionalization effort. Accordion and Dialog land with full part coverage; M0–M7 milestones close and the component port readiness gate becomes CI-enforced.',
    sections: [
      {
        title: 'Highlights',
        items: ['Accordion — compound with Item, Header, Title, Arrow, and Content.', 'Dialog — compound with Mask, Panel, Header, Body, and Footer.'],
      },
      {
        title: 'Infrastructure',
        collapsible: true,
        items: [
          'Monorepo professionalization milestones M0–M7 landed.',
          'Component port readiness gate enforced in CI.',
          'Playwright smoke-verifier e2e added to the release path.',
        ],
      },
    ],
  },
];
