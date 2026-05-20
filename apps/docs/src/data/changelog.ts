export type ChangelogMedia = {
  kind: 'image' | 'gif';
  src: string;
  alt: string;
};

/**
 * Optional before/after code block attached to an item. Rendered below the
 * item's text in a fenced box. Intended for breaking-change migrations where
 * the consumer needs to compare two snippets.
 */
export type ChangelogItemCode = {
  before?: string;
  after?: string;
  language?: string;
};

/**
 * Structured changelog item. Prefer plain strings; use this shape only when you
 * need a code block. The `text` field supports inline backtick code (\`like
 * this\`) which renders as <code>.
 */
export type ChangelogItem = {
  text: string;
  code?: ChangelogItemCode;
};

export type ChangelogSection = {
  title: string;
  items: Array<string | ChangelogItem>;
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
    id: 'v0-1-beta-2-select-polish',
    date: '2026-05-20',
    version: '0.1.0-beta.2',
    title: 'Select polish: Spar 0.2.0-beta.1, Figma-aligned styles, contentWidth',
    summary:
      'A focused beta refining the Select compound. The wrapper migrates onto Spar 0.2.0-beta.1, which removes Select.Value and Select.ItemText in favor of native props on Trigger and Item. Panel and item styles are now driven by the Figma dropdown token family, and a new contentWidth prop replaces the shrink-wrapped panel with a trigger-aligned default that tracks responsive resizes.',
    sections: [
      {
        title: 'Highlights',
        items: [
          '`Select` panel and item styles aligned with Figma — `--dropdown-items-basic-*` tokens drive item padding/gap/radius, hover background switches to `--background-lightest`, panel radius uses `--radius-m-base`, and the shadow becomes the layered `Effect1-Default-Sm` from the design source.',
          "New `contentWidth` prop on `Select` controls panel width — defaults to `'trigger'` (panel matches the trigger's measured width via `ResizeObserver`); also accepts `'content'`, a number, or any CSS string. Consumer `style.width` still wins.",
        ],
      },
      {
        title: 'Breaking changes',
        items: [
          {
            text: '`Select.Value` removed. Placeholder now lives on `Select.Trigger`.',
            code: {
              language: 'tsx',
              before: '<Select.Trigger>\n  <Select.Value placeholder="Pick one" />\n</Select.Trigger>',
              after: '<Select.Trigger placeholder="Pick one" />',
            },
          },
          {
            text: '`Select.ItemText` removed. Item text is provided via the new `label` prop and rendered as direct children.',
            code: {
              language: 'tsx',
              before: '<Select.Item value="tr">\n  <Select.ItemText>Türkiye</Select.ItemText>\n</Select.Item>',
              after: '<Select.Item value="tr" label="Türkiye">\n  Türkiye\n</Select.Item>',
            },
          },
          {
            text: '`Select.Item.textValue` renamed to `label` — aligns with native `<option label>`. The new `label` is also the typeahead search key.',
            code: {
              language: 'tsx',
              before: '<Select.Item textValue="Türkiye">',
              after: '<Select.Item label="Türkiye">',
            },
          },
        ],
      },
    ],
  },
];
