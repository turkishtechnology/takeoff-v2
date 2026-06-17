/**
 * API table source-of-truth for the Breadcrumb docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * api-tables block in `breadcrumb.mdx` whenever this file or
 * `packages/react-spar/src/components/breadcrumb/types.ts` changes.
 */

const breadcrumbTypesFile = 'packages/react-spar/src/components/breadcrumb/types.ts';
const sparBreadcrumbDocsUrl = 'https://spar.app.turkishtechlab.com/docs/Components/Breadcrumb';

const childrenOverride = description => ({
  type: 'React.ReactNode',
  description,
});

const classNameOverride = {
  type: 'string',
  description: 'Appends custom classes to the root slot of this part.',
};

const dataSlotRoot = {
  attribute: 'data-slot="root"',
  appliedWhen: 'Always',
  purpose: 'Stable selector for wrapper styling on the root slot.',
};

const dataSize = {
  attribute: 'data-size',
  appliedWhen: 'Always',
  purpose: 'Reflects the resolved `size` prop so theme recipes can scope size variants. Emitted by the wrapper.',
};

const dataType = {
  attribute: 'data-type',
  appliedWhen: 'Always',
  purpose: 'Reflects the resolved `type` prop (`basic` | `outlined`) so theme recipes can scope the visual variant. Emitted by the wrapper.',
};

export default {
  components: [
    {
      sourceFile: breadcrumbTypesFile,
      typeName: 'BreadcrumbProps',
      displayName: 'Breadcrumb',
      headingBase: 'breadcrumb',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      sparBehaviorProps: ['aria-label', 'onNavigate', 'disabled'],
      sparDocsUrl: sparBreadcrumbDocsUrl,
      sparDocsLabel: 'Spar Breadcrumb docs',
      propOverrides: {
        children: childrenOverride('`Breadcrumb.List` rendered inside the `<nav>` landmark.'),
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        dataSize,
        dataType,
        {
          attribute: 'data-disabled',
          appliedWhen: 'When `disabled` is true.',
          purpose: 'Theme hook for the disabled trail. Emitted by Spar, alongside `aria-disabled`.',
        },
      ],
    },
    {
      sourceFile: breadcrumbTypesFile,
      typeName: 'BreadcrumbListProps',
      displayName: 'Breadcrumb.List',
      headingBase: 'breadcrumb-list',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      sparDocsUrl: sparBreadcrumbDocsUrl,
      sparDocsLabel: 'Spar Breadcrumb docs',
      propOverrides: {
        children: childrenOverride('`Breadcrumb.Item` and `Breadcrumb.Separator` elements that compose the trail.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: breadcrumbTypesFile,
      typeName: 'BreadcrumbItemProps',
      displayName: 'Breadcrumb.Item',
      headingBase: 'breadcrumb-item',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      sparDocsUrl: sparBreadcrumbDocsUrl,
      sparDocsLabel: 'Spar Breadcrumb docs',
      propOverrides: {
        children: childrenOverride(
          '`Breadcrumb.Link` or `Breadcrumb.Page`, or a render function receiving `{ position, isCurrent, isDisabled }`. With the pinned Spar 0.2.0-beta.1, `position`/`isCurrent` stay at `"middle"`/`false` through this wrapper until the Spar context-registration release lands; `isDisabled` works today.',
        ),
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-position',
          appliedWhen: 'Always',
          purpose:
            '`"first"`, `"middle"`, or `"last"`. Emitted by Spar — with the pinned 0.2.0-beta.1 it always resolves to `"middle"` through this wrapper (position derivation is type-matched on Spar’s own item); the real values arrive with the Spar context-registration release.',
        },
        {
          attribute: 'data-current',
          appliedWhen: 'Reserved — not emitted at item level with the pinned Spar.',
          purpose:
            'Will mark the current crumb once the Spar context-registration release lands. Until then, style the current crumb via `Breadcrumb.Page`’s always-emitted `data-current`.',
        },
      ],
    },
    {
      sourceFile: breadcrumbTypesFile,
      typeName: 'BreadcrumbLinkProps',
      displayName: 'Breadcrumb.Link',
      headingBase: 'breadcrumb-link',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      sparBehaviorProps: ['href', 'disabled', 'isExternal', 'target', 'rel', 'onPress'],
      sparDocsUrl: sparBreadcrumbDocsUrl,
      sparDocsLabel: 'Spar Breadcrumb docs',
      propOverrides: {
        children: childrenOverride('Link label, typically a localized page name.'),
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-external',
          appliedWhen: 'When `isExternal` is true.',
          purpose: 'Theme hook for the external link variant. Emitted by Spar.',
        },
        {
          attribute: 'data-disabled',
          appliedWhen: 'When the link `disabled` is true, or the root is disabled.',
          purpose: 'Theme hook for the disabled link state. Emitted by Spar.',
        },
      ],
    },
    {
      sourceFile: breadcrumbTypesFile,
      typeName: 'BreadcrumbPageProps',
      displayName: 'Breadcrumb.Page',
      headingBase: 'breadcrumb-page',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      sparDocsUrl: sparBreadcrumbDocsUrl,
      sparDocsLabel: 'Spar Breadcrumb docs',
      propOverrides: {
        children: childrenOverride('Current page label. Rendered non-interactively with `aria-current="page"`.'),
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-current',
          appliedWhen: 'Always',
          purpose: 'Marks the current page; emitted by Spar on every `Breadcrumb.Page`, alongside `aria-current="page"`.',
        },
      ],
    },
    {
      sourceFile: breadcrumbTypesFile,
      typeName: 'BreadcrumbSeparatorProps',
      displayName: 'Breadcrumb.Separator',
      headingBase: 'breadcrumb-separator',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      sparDocsUrl: sparBreadcrumbDocsUrl,
      sparDocsLabel: 'Spar Breadcrumb docs',
      propOverrides: {
        children: childrenOverride('Override the separator glyph entirely; takes priority over `variant`. The owner `<li aria-hidden>` element stays invariant.'),
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-variant',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `variant` preset (`chevron` | `dot` | `slash` | `vertical`) so the recipe can paint glyph separators. Emitted by the wrapper.',
        },
      ],
    },
  ],
};
