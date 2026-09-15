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

/**
 * Per-package versions shipped together in this release. Keys must match the
 * `key` field emitted by the `package-changelogs` Docusaurus plugin
 * (`react-spar`, `tokens`, `tailwind`). The page resolves each key+version
 * pair against the parsed CHANGELOG.md and renders the matching body inside a
 * collapsible "Package details" disclosure. Versions that don't resolve are
 * silently skipped — useful when a package (e.g. tailwind) ships without a
 * Changesets-managed CHANGELOG.
 */
export type ChangelogPackageVersions = Partial<Record<'react-spar' | 'tokens' | 'tailwind', string>>;

export type ChangelogEntry = {
  id: string;
  date: string;
  version?: string;
  title: string;
  summary: string;
  media?: ChangelogMedia;
  sections: ChangelogSection[];
  links?: ChangelogLink[];
  packageVersions?: ChangelogPackageVersions;
};

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    id: 'v0-5-1-test-coverage-and-fixes',
    date: '2026-09-15',
    version: '0.5.1',
    title: 'The package gets a test suite, a coverage gate, and the six fixes it surfaced',
    packageVersions: {
      'react-spar': '0.5.1',
    },
    summary:
      'Every component, core helper and hook is now covered by tests — 517 to 2414 of them — and CI runs them behind coverage thresholds, so a component can no longer land untested. Writing those tests surfaced six bugs, each fixed here: provider `slotProps` overriding instance props, `Select` never marking itself invalid, `Dialog` and `Drawer` ignoring `dismissible={false}` for Escape, `Table` utility columns unreachable by assistive technology, and `useDatePicker` keeping a stale `Date`.',
    sections: [
      {
        title: 'Fixes',
        items: [
          '**Provider layering** — a theme `slotProps.root` value replaced an attribute or handler the instance set itself; a `title` or `onClick` passed to a component lost to the theme’s. Fixed once in `buildSlotAttrs`, which also restores the documented class order (canonical, provider, instance) and stops dropping a `className` passed through `slotProps`.',
          '**`Select`** — `invalid` never reached Spar, so `<Select invalid>` rendered no `data-invalid` on the root and no `aria-invalid` on the trigger. The standalone `Select.Indicator` read the open state under a name Spar’s context does not use, so its chevron never flipped.',
          '**`Dialog` / `Drawer`** — `dismissible={false}` did not block Escape, and a consumer’s own `onEscapeKeyDown` veto was ignored. Closing also returns focus to the trigger again. Both were Spar bugs, fixed upstream in `@turkish-technology/spar@0.2.3`, which this release pins.',
          '**`Table` accessibility** — the single-mode selection column and the expansion column had empty headers, so every such table failed axe’s empty-table-header rule. Single-mode row radios had no accessible name, and the “Go to page” submit was an `Input.TrailingIcon`, which hides itself from assistive technology.',
          '**`useDatePicker`** — a filled date edited back to half-typed left the value at `undefined` without calling `onValueChange`, so a bound form kept submitting the stale `Date`.',
        ],
      },
      {
        title: 'Testing and CI',
        collapsible: true,
        items: [
          'The 16 components that had no tests now have colocated suites, and the thin ones (`input`, `dialog`, `dropdown`, `switch`, `checkbox`, `label`, `table`) were deepened. `core`, the hooks, the provider and the slot registry are tested directly.',
          'Coverage went from 76.3% to 99.55% of statements and 75.6% to 97.59% of branches. The old numbers flattered the package: components with no tests of their own showed high coverage only because other components rendered them.',
          'CI runs react-spar through `test:coverage` and the tokens suite before the build. The unit-test step had been dropped when the package had no tests and never came back.',
          '`vitest.config.ts` gains v8 coverage with thresholds just under the measured totals, so a component that lands without tests fails the job.',
          'Every suite was mutation-checked against its source: 68 mutants, 66 killed.',
        ],
      },
    ],
  },
  {
    id: 'v0-5-0-calendar-and-date-picker',
    date: '2026-09-14',
    version: '0.5.0',
    title: 'Calendar and the date picker composition, plus Input masking',
    packageVersions: {
      'react-spar': '0.5.0',
      'tokens': '0.5.0',
      'tailwind': '0.1.4',
    },
    summary:
      '`Calendar` lands as the catalog’s first date component: a month grid over `react-day-picker@10` where the wrapper owns everything visual, and the grid now follows a value set from outside it. Alongside it, `useDatePicker` bridges a masked text field and a `Date` for the Popover + Calendar composition — it owns no anatomy, so every element stays yours to place. `Input.Field` gains masking, and `Drawer` opens up `modal`, `forceMount`, and the panel `role`.',
    sections: [
      {
        title: 'Highlights',
        items: [
          '**Calendar** — a month grid over `react-day-picker@10`, speaking Takeoff vocabulary: `mode` (`single` | `range` | `multiple`), `minDate` / `maxDate`, `disabledDates`, `allowedDates`, `disabledWeekDays`, and `size`. `headerType` adds month and year boards to the caption, and `renderDay` customizes day contents while the engine keeps the day-button behavior. No `rdp-*` class reaches the DOM and no library stylesheet is imported.',
          '**The grid follows a value set from outside it.** Previously the engine owned the displayed month after first render, so a preset button or a value restored from a form could select a day that was off-screen. Setting the value is now enough — a passed `month` still wins outright, and navigation the user performs is never undone.',
          '**useDatePicker** — the text/`Date` bridge for the Popover + Calendar composition. It renders nothing and owns no anatomy: `inputProps`, `calendarProps`, and `popoverProps` are ordinary objects you spread, override one key of, or ignore.',
          '**Input.Field masking** — `mask` takes a shape (`blocks`, delimiters, `numericOnly`), a `regex`, one of the `date` / `time` / `number` presets, or a custom resolver. `onValueChange(value, meta)` reports every edit with `raw`, `completed`, and `iso` — including delimiter-aware deletes and undo, which never surface as a change event.',
          '**Drawer** — `modal={false}` leaves the page live behind the panel, `forceMount` matches what `Dialog` already offered, and `Drawer.Panel` accepts `role` for an interrupting drawer.',
        ],
      },
      {
        title: 'Fixes',
        collapsible: true,
        items: [
          '`Calendar` header and grid no longer shift: the caption label, the day grid, and the card each sit in a pinned box, so a long month name cannot resize the card and paging months cannot resize the grid.',
          'The `Calendar` card is wider than the grid, so the year in the caption stops ellipsizing, and the nav is sized on its own rather than on the day cell.',
          'Arrow keys on the month and year boards are mirrored for RTL, with `minDate` / `maxDate` and disabled dates covered.',
          'The range-end corner is guarded the way range-start already was.',
          'The auto margin between an `Input` action and a picker trigger is cancelled, so the action group sits flush.',
          'Icon gallery: tiles are centred, labels cut to one line, and the drawer height is pinned.',
        ],
      },
      {
        title: 'Docs',
        collapsible: true,
        items: [
          'A datepicker page documenting the Popover + Calendar composition, and the contract behind it.',
          'Binding a date picker to a form, with a live field in both form demos.',
          'Localization for `Calendar` and the date picker composition.',
          'Input masking: the contract, the data attributes Spar emits, and what a resolver’s omitted meta fields default to.',
          'Agent skills for the datepicker composition and for masking.',
        ],
      },
      {
        title: 'Infrastructure',
        collapsible: true,
        items: ['The `@turkish-technology/spar` dependency was updated.', 'Mask tests are named after the component under test.', 'The Claude PR review workflow was removed.'],
      },
    ],
  },
  {
    id: 'v0-2-0-component-catalog-expansion',
    date: '2026-06-29',
    version: '0.2.0',
    title: 'react-spar 0.2.0: ten new components, Table flagship, and API polish',
    packageVersions: {
      'react-spar': '0.2.0',
      'tokens': '0.2.0',
      'tailwind': '0.1.1',
    },
    summary:
      'The catalog roughly doubles. `@takeoff-ui/react-spar` 0.2.0 adds ten components — including the TanStack-backed `Table`, the compound `Alert`, and `Toast`/`Toaster` — alongside `Card`, `Chip`, `Dialog`, `Tabs`, `Breadcrumb`, `Spinner`, and `Label`. Existing components get prop and styling polish, and a few public APIs were renamed/removed; each change below ships with a one-line migration. The library deliberately stays on 0.x (no major bump) while it has a single consumer, so these are released under a minor.',
    sections: [
      {
        title: 'New components',
        items: [
          '**Table** — the catalog’s first TanStack-backed component (`@tanstack/react-table`). A props-first `<Table data columns getRowId />` with sorting, column filters in a Spar `Popover`, row selection, pagination, sticky header/columns, density, and a data-only `getExportRows()` projection.',
          '**Alert** — compound `Alert` with `variant`/`appearance`, actions, and close handling.',
          '**Toast** — `Toast`, `Toaster`, and `createToaster` powered by the Spar headless toast controller: types, positions, promise toasts, updates, persistent toasts, and overlap stacks.',
          'Also new: **Card**, **Chip**, **Dialog**, **Tabs**, **Breadcrumb**, **Spinner**, and **Label**.',
        ],
      },
      {
        title: 'Breaking changes',
        collapsible: true,
        items: [
          {
            text: '**Button** — `isLoading`/`isPressed` renamed to `loading`/`pressed`.',
            code: {
              language: 'tsx',
              before: '<Button isLoading isPressed />',
              after: '<Button loading pressed />',
            },
          },
          {
            text: '**Radio / Checkbox** — the `type` prop (and the `card` variant) were removed. Wrap in your own bordered container if you need a card-style row.',
            code: {
              language: 'tsx',
              before: '<Radio type="card" />',
              after: '<Radio />',
            },
          },
          {
            text: '**Input** — `Input.Container` is removed; the bordered row is now the `Input` root, with `Input.LeadingIcon` / `Input.TrailingIcon` for icons.',
            code: {
              language: 'tsx',
              before: '<Input>\n  <Input.Container startContent={<Icon />}>\n    <Input.Field />\n  </Input.Container>\n</Input>',
              after: '<Input>\n  <Input.LeadingIcon>\n    <Icon />\n  </Input.LeadingIcon>\n  <Input.Field />\n</Input>',
            },
          },
          {
            text: '**Drawer** — `dismissable` → `dismissible`, and `Drawer.CloseButton` → `Drawer.Close` (CSS class `.tk-drawer-close-button` → `.tk-drawer-close`).',
            code: {
              language: 'tsx',
              before: '<Drawer dismissable={false}>\n  <Drawer.CloseButton />\n</Drawer>',
              after: '<Drawer dismissible={false}>\n  <Drawer.Close />\n</Drawer>',
            },
          },
          '**Tooltip / Popover** — the default `Content` `variant` changed from `dark` to `white`. Pass `variant="dark"` to keep the previous look.',
          '**Select** — `Select.Trigger` now renders a disclosure chevron by default; pass `indicator={false}` to opt out.',
        ],
      },
    ],
  },
  {
    id: 'v0-1-0-tailwind-initial-release',
    date: '2026-05-21',
    version: 'tailwind 0.1.0',
    title: '@takeoff-design/tailwind ships its first public version',
    packageVersions: {
      tailwind: '0.1.0',
    },
    summary:
      '`@takeoff-design/tailwind` is now on npm. It ships the Tailwind theme that mirrors the @takeoff-design/tokens design system — a Tailwind v4 stylesheet at the package root and a Tailwind v3 plugin module under `./v3` — so teams on either Tailwind major can adopt Takeoff styling without re-deriving tokens by hand. From this release on, tailwind follows the same Changesets and trusted-publishing flow as tokens and react-spar.',
    sections: [
      {
        title: 'Highlights',
        items: [
          {
            text: '**Tailwind v4 theme.** Import the package directly to load the generated `@theme` block driven by `@takeoff-design/tokens`. Works with `@import` in any v4 setup.',
            code: {
              language: 'css',
              after: "@import 'tailwindcss';\n@import '@takeoff-design/tailwind';",
            },
          },
          {
            text: '**Tailwind v3 plugin.** A drop-in plugin under `./v3` exposes the same token surface as a v3-compatible theme extension. Use it via `tailwind.config.js`.',
            code: {
              language: 'js',
              after: "// tailwind.config.js\nmodule.exports = {\n  presets: [require('@takeoff-design/tailwind/v3')],\n};",
            },
          },
          'Single source of truth — both entry points are generated from `@takeoff-design/tokens`, so consumers stay in sync with the design system without copying values into a local config.',
        ],
      },
      {
        title: 'How to install',
        items: [
          {
            text: 'Install alongside Tailwind. The package only declares a peer on `tailwindcss >= 3`, so it composes with whatever Tailwind version your app already uses.',
            code: {
              language: 'bash',
              after: 'pnpm add @takeoff-design/tailwind\n# or\nnpm install @takeoff-design/tailwind',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'v0-1-beta-2-select-polish',
    date: '2026-05-20',
    version: '0.1.0-beta.2',
    title: 'Select polish: Spar 0.2.0-beta.1, Figma-aligned styles, contentWidth',
    packageVersions: {
      'react-spar': '0.1.2',
      'tokens': '0.1.2',
    },
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
