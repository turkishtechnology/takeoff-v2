import type { Dispatch, RefObject, SetStateAction } from 'react';
import { createSafeContext } from '../../hooks';

import type { InputSize } from './types';

export interface InputOwnContextValue {
  size: InputSize;
  fieldRef: RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  /**
   * The live field element as reactive state (mirrors `fieldRef.current`).
   * Parts that need to (re)subscribe when the field node is replaced — e.g.
   * `Input.Chips`'s keydown listener — should depend on this, not `fieldRef`,
   * whose identity never changes.
   */
  fieldNode: HTMLInputElement | HTMLTextAreaElement | null;
  setFieldNode: Dispatch<SetStateAction<HTMLInputElement | HTMLTextAreaElement | null>>;
  fieldValue: string;
  setFieldValue: Dispatch<SetStateAction<string>>;
  revealed: boolean;
  setRevealed: Dispatch<SetStateAction<boolean>>;
  toggleReveal: () => void;
  /**
   * Lets content-owning parts (e.g. `Input.Chips`) report their clearable
   * content and a reset callback, so `Input.ClearButton` shows whenever the
   * field OR any such part has content and a single "clear" wipes the whole
   * field — typed text plus every registered part — not just the typed text.
   */
  setClearable: (id: symbol, entry: { hasContent: boolean; clear: () => void } | null) => void;
  hasAuxContent: boolean;
  clearAux: () => void;
}

export const [InputProvider, useInputOwnContext] = createSafeContext<InputOwnContextValue>('InputProvider');
