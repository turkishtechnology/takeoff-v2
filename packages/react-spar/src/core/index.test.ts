import { describe, expect, it } from 'vitest';

import { blockDismiss } from './blockDismiss';
import { buildSlotAttrs } from './buildSlotAttrs';
import { composeRootAttrs } from './composeRootAttrs';
import { createComponentBase } from './createComponentBase';
import { DEFAULT_DISCLOSURE_COLLAPSE_ICON, DEFAULT_DISCLOSURE_EXPAND_ICON, resolveDisclosureIndicator } from './disclosure';
import * as core from './index';
import { isRenderableNode } from './isRenderableNode';
import { renderPointerArrow } from './pointerArrow';

describe('core public entry', () => {
  it('re-exports every shared wrapper helper from its source module', () => {
    expect(core.blockDismiss).toBe(blockDismiss);
    expect(core.buildSlotAttrs).toBe(buildSlotAttrs);
    expect(core.composeRootAttrs).toBe(composeRootAttrs);
    expect(core.createComponentBase).toBe(createComponentBase);
    expect(core.isRenderableNode).toBe(isRenderableNode);
    expect(core.renderPointerArrow).toBe(renderPointerArrow);
    expect(core.resolveDisclosureIndicator).toBe(resolveDisclosureIndicator);
    expect(core.DEFAULT_DISCLOSURE_EXPAND_ICON).toBe(DEFAULT_DISCLOSURE_EXPAND_ICON);
    expect(core.DEFAULT_DISCLOSURE_COLLAPSE_ICON).toBe(DEFAULT_DISCLOSURE_COLLAPSE_ICON);
  });
});
