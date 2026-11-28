import { useCallback, useEffect, type ChangeEvent, type ElementType } from 'react';
import { useControlledState, useMergedRef } from '@/hooks';
import { useSelectCollectionContext, useSelectContext } from './hooks';
import type { SelectSearchProps } from './types';

/**
 * Filter field inside `SelectContent`.
 *
 * With it mounted the field is the APG combobox: it takes focus when the list
 * opens, owns `aria-activedescendant`, and points `aria-controls` at
 * `SelectViewport`, which becomes the listbox. Arrows, PageUp / PageDown,
 * Enter, Escape and Tab still drive the list (SelectContent handles them as the
 * key events bubble); characters, Space, Home and End edit the text.
 *
 * It does not filter: render only the `SelectItem`s that match `value`. When
 * the highlighted option is filtered out, the highlight moves to the first one
 * left. The query resets to `''` while the list is closed.
 */
export const SelectSearch = <T extends ElementType = 'input'>({ as, ref, value, defaultValue = '', onValueChange, onChange, ...props }: SelectSearchProps<T>) => {
  const Component = as || 'input';
  const context = useSelectContext();
  const collection = useSelectCollectionContext();
  const { registerSearch, searchRef, listboxId, highlightedId } = collection;

  const [query = '', setQuery] = useControlledState<string>(value, defaultValue, onValueChange);
  const mergedRef = useMergedRef(searchRef, ref);

  useEffect(() => {
    registerSearch(true);
    return () => registerSearch(false);
  }, [registerSearch]);

  // A closed list starts over: the next open shows every option again.
  // SelectContent renders a closed list in a separate hidden tree, so this part
  // remounts on every open and close — the reset is therefore "while closed",
  // not "on the closing edge", and a controlled parent hears '' then.
  useEffect(() => {
    if (!context.open && query !== '') setQuery('');
  }, [context.open, query, setQuery]);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange?.(event);
      if (!event.defaultPrevented) setQuery(event.target.value);
    },
    [onChange, setQuery],
  );

  return (
    <Component
      type="text"
      autoComplete="off"
      spellCheck={false}
      {...props}
      ref={mergedRef}
      role="combobox"
      aria-expanded={context.open}
      aria-controls={listboxId}
      aria-autocomplete="list"
      aria-activedescendant={highlightedId ? `${context.contentId}-option-${encodeURIComponent(highlightedId)}` : undefined}
      value={query}
      onChange={handleChange}
    />
  );
};

SelectSearch.displayName = 'SelectSearch';
