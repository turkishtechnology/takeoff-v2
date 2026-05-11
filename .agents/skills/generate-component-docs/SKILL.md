---
name: generate-component-docs
description:
  Generate or update @takeoff-ui/react-spar component documentation pages in
  apps/docs/docs/components. Use when asked to create component docs, fix a
  component page intro/description, or produce docs text for a component.
  Enforces concise, purpose-first component descriptions instead of listing
  compound subcomponent names in the page description.
argument-hint: '[ComponentName]'
---

# Generate component docs

Create or update one component page under `apps/docs/docs/components`. Keep
changes focused on the requested component.

## Description rule

The page description must explain the component's user-facing job, not its
compound anatomy.

- Write the frontmatter `description` and first paragraph as a short product
  sentence: what the component helps users do, and when it is useful.
- Do not list every compound subcomponent in the description.
- Do not use the description to teach import syntax, package names, styling
  hooks, data attributes, or generated API details.
- Put part names in the Usage anatomy snippet, examples, accessibility notes, or
  the generated API table where they belong.
- If an existing intro mixes purpose and anatomy, keep the anatomy by moving it
  to `Usage` or `Anatomy`; do not delete it.

This follows the pattern used by major component docs: Radix, MUI, Chakra,
Mantine, Ant Design, and Base UI all lead with a short purpose statement, then
move anatomy and API details into later sections.

Accordion example:

```mdx
---
title: Accordion
description:
  Organizes related content into collapsible sections so users can scan a page
  and reveal details as needed.
---

# Accordion

`Accordion` organizes related content into collapsible sections so users can
scan dense pages and open the details they need.
```

Avoid this:

```mdx
`Accordion` is a compound disclosure component. Compose `Accordion.Item`,
`Accordion.Header`, `Accordion.Trigger`, and `Accordion.Content`.
```

## Page shape

Use the existing docs structure unless the component already has a closer local
pattern:

1. Frontmatter with `title`, `description`, `sidebar_label`, `sidebar_position`,
   and `slug`.
2. Imports for `LiveCode`, docs exports from
   `@site/src/components/ReactSparDocs`, and `ApiBadge` when API tables are
   present.
3. Demo CSS and demo snippets exported near the top of the MDX file.
4. `# ComponentName` followed by the purpose-first intro paragraph.
5. `## Usage` with only two unheaded code snippets: the package import line,
   then the full compound anatomy as a tag-only skeleton. Do not include props,
   sample content, controlled state, or uncontrolled state in this snippet.
6. Short demo sections using `LiveCode`.
7. Accessibility notes only when the component has meaningful semantics or
   keyboard behavior.
8. Generated API block: `{/* api-tables:start ... */}` through
   `{/* api-tables:end */}`.

## Writing guidelines

- Keep page copy source-backed by the component implementation, types, tests,
  and existing docs patterns.
- Keep the wrapper framing thin: document Takeoff-facing usage while preserving
  Spar-owned behavior.
- Prefer concrete user scenarios in examples over abstract placeholder content.
- Keep headings task-oriented, following the local Accordion shape:
  `Playground`, `Multiple Panels`, `Controlled`, `Custom Arrows`,
  `Disabled Item`, `Hide Arrows`, `Force-Mounted Content`,
  `Accessibility & Keyboard`, `API Reference`.
- Keep prop and data-attribute descriptions factual and short.
- Pre-format every `LiveCode` source string exactly as it should appear in the
  docs UI. Display-only demos do not run runtime Prettier. If Prettier would
  rewrite visible demo source strings, wrap the demo constants block with MDX
  `<!-- prettier-ignore-start -->` / `<!-- prettier-ignore-end -->`.
- Do not add extra docs architecture files for component docs.

## API table policy

The generator (`apps/docs/scripts/generate-api-mdx.mjs`) is the source of truth
for what appears in the `### <Part>` API blocks. The rules below are baked into
the generator — author the `*.api.config.mjs` to match.

- **Do not document Spar-owned props in takeoff-spar tables.** Behavior props
  forwarded verbatim to the Spar primitive (state, controlled props, keyboard
  hooks, heading level, `forceMount`, `disabled`, etc.) live in Spar's docs. Add
  them to `sparBehaviorProps` in the part's config; the generator drops them
  from the rendered table automatically and the `sparDocsUrl` link is where
  consumers go for that surface.
- **Drop the props table when only canonical wrapper plumbing remains.** If,
  after removing Spar-owned props, the only props left are in the plumbing set
  (`children`, `className`, `classNames`, `slotProps`), the generator skips the
  `#### Props` heading and table entirely. The part still renders its heading,
  the Spar docs note, and any data-attributes table. This keeps the shared
  customization model out of every part page — consumers learn it once from the
  wrapper customization docs and the Spar link covers primitive props.
- `skipPropNames` is reserved for non-Spar items that should also be hidden
  (such as `ref`). Do not duplicate Spar prop names in both lists.
- The Spar docs link is required on every part — set `sparDocsUrl` (and an
  optional `sparDocsLabel`) so the rendered "See [Spar docs] for primitive
  behavior." note appears even when the props table is dropped.
- `dataAttributes` are takeoff-spar's own surface (Spar does not emit
  `data-slot` / `tk-*` hooks) — keep documenting them, including the
  `data-slot="root"` baseline.

## Workflow

1. Read the component MDX page if it exists.
2. Read the component source, public types, tests, and API config for only the
   requested component.
3. Draft the purpose-first frontmatter description and intro before editing
   demos or API text.
4. If API tables are generated, update the sibling `*.api.config.mjs` rather
   than hand-editing generated table rows. Classify each declared prop as
   takeoff-spar-owned (keep, document) or Spar-owned (list under
   `sparBehaviorProps`); the generator handles dropping the props table when
   nothing but plumbing is left.
5. Run the repo's docs/component validation scripts that are relevant to the
   touched files.
