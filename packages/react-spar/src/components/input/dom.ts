// Shared DOM helpers for the Input field actions. These centralise the two
// native-input workarounds that several Input parts need:
//   1. Writing a value through React's tracked setter so a synthetic `input`
//      event makes React fire the consumer's onChange (ClearButton, Chips).
//   2. Stepping a number input safely (Increment / Decrement).

type Field = HTMLInputElement | HTMLTextAreaElement;

/**
 * Set a native input/textarea value through the prototype's value setter (which
 * React patches to track changes) and dispatch a bubbling `input` event, so
 * React maps it onto the field's onInput/onChange and the controlled value and
 * the scalar fieldValue mirror both stay in sync.
 */
export const setNativeValue = (field: Field, value: string) => {
  const prototype = field instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const valueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
  valueSetter?.call(field, value);
  field.dispatchEvent(new Event('input', { bubbles: true }));
};

/**
 * Step a number input up or down, then dispatch `input` and refocus. Guards two
 * ways: the ref may point at a non-input (textarea) or at an input whose `type`
 * is not steppable (text/email/…), where `stepUp`/`stepDown` throw a DOMException
 * (`InvalidStateError`). Both are treated as no-ops so the action button never
 * throws when composed with a non-number field.
 */
export const stepField = (field: Field | null, direction: 'up' | 'down') => {
  if (!(field instanceof HTMLInputElement)) return;
  try {
    if (direction === 'up') {
      field.stepUp();
    } else {
      field.stepDown();
    }
  } catch {
    // Non-steppable input type (text, email, …) — nothing to step.
    return;
  }
  field.dispatchEvent(new Event('input', { bubbles: true }));
  field.focus();
};
