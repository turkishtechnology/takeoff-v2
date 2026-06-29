/**
 * API table source-of-truth for the Toast docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * API block in the sibling `toast.mdx` page whenever this file or
 * `packages/react-spar/src/components/toast/types.ts` changes.
 */

const toastTypesFile = 'packages/react-spar/src/components/toast/types.ts';

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

export default {
  components: [
    {
      sourceFile: toastTypesFile,
      typeName: 'ToasterProps',
      displayName: 'Toaster',
      headingBase: 'toaster',
      prependPropNames: ['toaster', 'children'],
      appendPropNames: ['label', 'hotkey', 'className'],
      propOverrides: {
        toaster: {
          type: 'ToasterController',
          description: 'Toast controller returned by `createToaster`.',
        },
        children: childrenOverride('Optional render function for custom toast item rendering.'),
        appearance: {
          type: 'ToastAppearance',
          default: "'filled'",
          description: 'Alert appearance used by the default toast renderer.',
        },
        closeLabel: {
          type: 'string',
          default: "'Dismiss notification'",
          description: 'Accessible label for the default close control.',
        },
        overlap: {
          type: 'boolean',
          default: 'false',
          description: 'Stacks visible toasts and expands the stack on hover or focus.',
        },
        label: {
          type: 'string',
          default: "'Notifications (F8)'",
          description: 'Accessible label for the toast viewport region.',
        },
        hotkey: {
          type: 'string[]',
          default: "['F8']",
          description: 'Keyboard shortcut that focuses the toast viewport.',
        },
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-placement',
          appliedWhen: 'Always',
          purpose: 'Reflects the toaster placement for viewport positioning.',
        },
        {
          attribute: 'data-overlap',
          appliedWhen: 'When `overlap` is true',
          purpose: 'Enables the overlapped visual stack recipe.',
        },
        {
          attribute: 'data-expanded',
          appliedWhen: 'When an overlapping toaster is hovered or focused',
          purpose: 'Indicates that the overlapped stack is expanded for interaction.',
        },
      ],
    },
    {
      sourceFile: toastTypesFile,
      typeName: 'ToastProps',
      displayName: 'Toast',
      headingBase: 'toast',
      prependPropNames: ['toast', 'children'],
      appendPropNames: ['className'],
      propOverrides: {
        toast: {
          type: 'ToastData',
          description: 'Toast item supplied by the headless toaster controller.',
        },
        toaster: {
          type: 'ToasterController',
          description: 'Controller used to pause, resume, and dismiss the toast.',
        },
        children: childrenOverride('Optional custom toast content. When omitted, Toast renders the Takeoff Alert anatomy.'),
        appearance: {
          type: 'ToastAppearance',
          default: "'filled'",
          description: 'Alert appearance used by the default toast renderer.',
        },
        closeLabel: {
          type: 'string',
          default: "'Dismiss notification'",
          description: 'Accessible label for the default close control.',
        },
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-toast-id',
          appliedWhen: 'Always',
          purpose: 'Stable toast item identifier used for layout motion.',
        },
        {
          attribute: 'data-status',
          appliedWhen: 'Always',
          purpose: 'Reflects the toast lifecycle status.',
        },
        {
          attribute: 'data-type',
          appliedWhen: 'Always',
          purpose: 'Reflects the headless toast type used for styling hooks.',
        },
      ],
    },
  ],
};
