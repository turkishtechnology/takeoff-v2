/**
 * API table source-of-truth for the Avatar docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * sibling `avatar.mdx` page whenever this file or
 * `packages/react-spar/src/components/avatar/types.ts` changes.
 */

const avatarTypesFile = 'packages/react-spar/src/components/avatar/types.ts';
const sparAvatarDocsUrl = 'https://v2.takeoffui.com/headless/docs/Components/Avatar';

const classNameOverride = {
  type: 'string',
  description: 'Appends custom classes to the root slot of this part.',
};

const dataSlot = slot => ({
  attribute: `data-slot="${slot}"`,
  appliedWhen: 'Always',
  purpose: `Stable selector for the ${slot} slot.`,
});

export default {
  components: [
    {
      sourceFile: avatarTypesFile,
      typeName: 'AvatarProps',
      displayName: 'Avatar',
      headingBase: 'avatar',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      sparDocsUrl: sparAvatarDocsUrl,
      sparDocsLabel: 'Spar Avatar docs',
      propOverrides: {
        children: {
          type: 'React.ReactNode',
          description: '`Avatar.Image`, `Avatar.Fallback` and `Avatar.Badge`.',
        },
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlot('root'),
        {
          attribute: 'data-size',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `size` (own, group, or theme default).',
        },
        {
          attribute: 'data-variant',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `variant` prop for fallback coloring.',
        },
        {
          attribute: 'data-type',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `appearance` prop.',
        },
        {
          attribute: 'data-rounded',
          appliedWhen: 'When `rounded` is true (own or from the group)',
          purpose: 'Styling hook for the circle shape.',
        },
        {
          attribute: 'data-hide-shadow',
          appliedWhen: 'When `hideShadow` is true',
          purpose: 'Styling hook that removes the drop shadow.',
        },
        {
          attribute: 'data-status',
          appliedWhen: 'Always (emitted by Spar)',
          purpose: 'Image loading status: `idle`, `loading`, `loaded` or `error`.',
        },
        {
          attribute: 'data-overflow',
          appliedWhen: 'On the `+N` avatar rendered by `Avatar.Group`',
          purpose: 'Marks the overflow avatar.',
        },
      ],
    },
    {
      sourceFile: avatarTypesFile,
      typeName: 'AvatarImageProps',
      displayName: 'Avatar.Image',
      headingBase: 'avatar-image',
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      sparDocsUrl: sparAvatarDocsUrl,
      sparDocsLabel: 'Spar Avatar docs',
      propOverrides: {
        onLoadingStatusChange: {
          type: "(status: 'loading' | 'loaded' | 'error') => void",
          description: 'Called whenever the image loading status changes (never with `idle`).',
        },
        className: classNameOverride,
      },
      dataAttributes: [dataSlot('root')],
    },
    {
      sourceFile: avatarTypesFile,
      typeName: 'AvatarFallbackProps',
      displayName: 'Avatar.Fallback',
      headingBase: 'avatar-fallback',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      sparDocsUrl: sparAvatarDocsUrl,
      sparDocsLabel: 'Spar Avatar docs',
      propOverrides: {
        children: {
          type: 'React.ReactNode',
          description: 'Initials or any content. Without children the default person glyph renders.',
        },
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlot('root'),
        {
          attribute: 'data-icon',
          appliedWhen: 'When there are no children',
          purpose: 'Styling hook for the default glyph layout.',
        },
      ],
    },
    {
      sourceFile: avatarTypesFile,
      typeName: 'AvatarBadgeProps',
      displayName: 'Avatar.Badge',
      headingBase: 'avatar-badge',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        children: {
          type: 'React.ReactNode',
          description: 'Content such as a count. Without children the badge is a dot.',
        },
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlot('root'),
        {
          attribute: 'data-avatar-badge',
          appliedWhen: 'Always',
          purpose: 'Marks a Badge placed on an avatar; the Badge recipe’s own `data-*` apply too.',
        },
      ],
    },
    {
      sourceFile: avatarTypesFile,
      typeName: 'AvatarGroupProps',
      displayName: 'Avatar.Group',
      headingBase: 'avatar-group',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        children: {
          type: 'React.ReactNode',
          description: '`Avatar` elements.',
        },
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlot('root'),
        {
          attribute: 'data-size',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved group `size`.',
        },
        {
          attribute: 'data-compact',
          appliedWhen: 'When `compact` is true',
          purpose: 'Styling hook for the bordered pill layout.',
        },
      ],
    },
  ],
};
