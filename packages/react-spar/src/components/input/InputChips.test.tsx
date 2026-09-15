import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState, type FormEvent } from 'react';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProvider as render, screen, within } from '../../test-utils';
import { Field } from '../field';

import { Input } from './index';

// Note on user-event: Input.Chips empties the field through the native value
// setter (as a browser would observe it), which bypasses user-event's own
// record of the typed text. Tests therefore commit through typing at most once
// per render and use clicks or pre-seeded tags for follow-up steps.

const chipLabels = (container: HTMLElement) => Array.from(container.querySelectorAll('.tk-input-chips .tk-chip-label')).map(label => label.textContent);
const getTagsField = () => screen.getByRole('textbox', { name: 'Destinations' });

describe('Input.Chips', () => {
  describe('rendering', () => {
    it('renders one outlined neutral Chip per tag inside the chips root, at the Input size', () => {
      const { container } = render(
        <Input size="small">
          <Input.Chips defaultValue={['Istanbul', 'London']} />
          <Input.Field aria-label="Destinations" />
        </Input>,
      );

      const chipsRoot = container.querySelector('.tk-input-chips') as HTMLElement;
      expect(chipsRoot.tagName).toBe('DIV');
      expect(chipsRoot).toHaveAttribute('data-slot', 'root');
      expect(container.querySelector('.tk-input')).toContainElement(chipsRoot);
      expect(chipLabels(container)).toEqual(['Istanbul', 'London']);

      const chips = Array.from(chipsRoot.querySelectorAll('.tk-chip'));
      expect(chips).toHaveLength(2);
      for (const chip of chips) {
        expect(chip).toHaveAttribute('data-type', 'outlined');
        expect(chip).toHaveAttribute('data-variant', 'neutral');
        expect(chip).toHaveAttribute('data-size', 'small');
        expect(chip).toHaveAttribute('data-removable', '');
      }
      expect(within(chipsRoot).getByRole('button', { name: 'Remove Istanbul' })).toBeInTheDocument();
      expect(within(chipsRoot).getByRole('button', { name: 'Remove London' })).toBeInTheDocument();
    });

    it('renders no chips without a value', () => {
      const { container } = render(
        <Input>
          <Input.Chips />
          <Input.Field aria-label="Destinations" />
        </Input>,
      );

      expect(container.querySelector('.tk-input-chips')).toBeEmptyDOMElement();
    });

    it('renders extra children after the chips', () => {
      const { container } = render(
        <Input>
          <Input.Chips defaultValue={['Rome']}>
            <span>extra</span>
          </Input.Chips>
          <Input.Field aria-label="Destinations" />
        </Input>,
      );

      const chipsRoot = container.querySelector('.tk-input-chips') as HTMLElement;
      expect(chipsRoot.lastElementChild).toBe(screen.getByText('extra'));
      expect(chipLabels(container)).toEqual(['Rome']);
    });

    it('lands className, classNames and slotProps on the chips root and renders through as', () => {
      const { container } = render(
        <Input>
          <Input.Chips as="section" className="instance-class" classNames={{ root: 'slot-class' }} slotProps={{ root: { title: 'Tags' } }} />
          <Input.Field aria-label="Destinations" />
        </Input>,
      );

      const chipsRoot = container.querySelector('.tk-input-chips') as HTMLElement;
      expect(chipsRoot.tagName).toBe('SECTION');
      expect(chipsRoot).toHaveClass('tk-input-chips', 'instance-class', 'slot-class');
      expect(chipsRoot).toHaveAttribute('title', 'Tags');
      expect(container.querySelector('.tk-input')).not.toHaveClass('slot-class');
    });

    it('forwards the ref to the chips root', () => {
      const ref = createRef<HTMLDivElement>();
      const { container } = render(
        <Input>
          <Input.Chips ref={ref} />
          <Input.Field aria-label="Destinations" />
        </Input>,
      );

      expect(ref.current).toBe(container.querySelector('.tk-input-chips'));
    });
  });

  describe('committing', () => {
    it('commits the trimmed field text on Enter, empties the field and reports the next array', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const { container } = render(
        <Input>
          <Input.Chips onValueChange={onValueChange} />
          <Input.Field aria-label="Destinations" />
        </Input>,
      );

      await user.type(getTagsField(), '  Paris  {Enter}');

      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange).toHaveBeenCalledWith(['Paris']);
      expect(chipLabels(container)).toEqual(['Paris']);
      expect(getTagsField()).toHaveValue('');
    });

    it('appends to the existing tags', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const { container } = render(
        <Input>
          <Input.Chips defaultValue={['Istanbul']} onValueChange={onValueChange} />
          <Input.Field aria-label="Destinations" />
        </Input>,
      );

      await user.type(getTagsField(), 'London{Enter}');

      expect(onValueChange).toHaveBeenCalledWith(['Istanbul', 'London']);
      expect(chipLabels(container)).toEqual(['Istanbul', 'London']);
    });

    it('keeps a commit from submitting an enclosing form, while Enter on an empty field still submits', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());
      const onValueChange = vi.fn();
      render(
        <form aria-label="Trip" onSubmit={onSubmit}>
          <Input>
            <Input.Chips onValueChange={onValueChange} />
            <Input.Field aria-label="Destinations" />
          </Input>
        </form>,
      );

      await user.type(getTagsField(), 'Oslo{Enter}');
      expect(onValueChange).toHaveBeenCalledWith(['Oslo']);
      expect(onSubmit).not.toHaveBeenCalled();

      // Nothing to commit, so Enter keeps its native implicit-submit behaviour.
      await user.keyboard('{Enter}');
      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('commits on the separator character without typing it into the field', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const { container } = render(
        <Input>
          <Input.Chips separator="," onValueChange={onValueChange} />
          <Input.Field aria-label="Destinations" />
        </Input>,
      );

      await user.type(getTagsField(), 'Rome,');

      expect(onValueChange).toHaveBeenCalledWith(['Rome']);
      expect(chipLabels(container)).toEqual(['Rome']);
      expect(getTagsField()).toHaveValue('');
    });

    it('treats the separator as plain text when none is configured', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <Input>
          <Input.Chips onValueChange={onValueChange} />
          <Input.Field aria-label="Destinations" />
        </Input>,
      );

      await user.type(getTagsField(), 'Rome,');

      expect(onValueChange).not.toHaveBeenCalled();
      expect(getTagsField()).toHaveValue('Rome,');
    });

    it('ignores Enter on an empty or whitespace-only field', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const { container } = render(
        <Input>
          <Input.Chips onValueChange={onValueChange} />
          <Input.Field aria-label="Destinations" />
        </Input>,
      );

      await user.type(getTagsField(), '{Enter}');
      await user.type(getTagsField(), '   {Enter}');

      expect(onValueChange).not.toHaveBeenCalled();
      expect(chipLabels(container)).toEqual([]);
      expect(getTagsField()).toHaveValue('   ');
    });

    it('ignores Enter while an IME composition is active', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <Input>
          <Input.Chips onValueChange={onValueChange} />
          <Input.Field aria-label="Destinations" />
        </Input>,
      );

      await user.type(getTagsField(), 'Tokyo');
      // userEvent cannot drive an IME session, so dispatch the composing keydown directly.
      fireEvent.keyDown(getTagsField(), { key: 'Enter', isComposing: true });

      expect(onValueChange).not.toHaveBeenCalled();
      expect(getTagsField()).toHaveValue('Tokyo');

      await user.keyboard('{Enter}');
      expect(onValueChange).toHaveBeenCalledWith(['Tokyo']);
    });

    it('commits while below max', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <Input>
          <Input.Chips defaultValue={['Rome']} max={2} onValueChange={onValueChange} />
          <Input.Field aria-label="Destinations" />
        </Input>,
      );

      await user.type(getTagsField(), 'Oslo{Enter}');

      expect(onValueChange).toHaveBeenCalledWith(['Rome', 'Oslo']);
    });

    it('ignores commits once max is reached', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const { container } = render(
        <Input>
          <Input.Chips defaultValue={['Rome', 'Oslo']} max={2} onValueChange={onValueChange} />
          <Input.Field aria-label="Destinations" />
        </Input>,
      );

      await user.type(getTagsField(), 'Nice{Enter}');

      expect(onValueChange).not.toHaveBeenCalled();
      expect(chipLabels(container)).toEqual(['Rome', 'Oslo']);
      // The ignored commit leaves the user's text in place.
      expect(getTagsField()).toHaveValue('Nice');
    });

    it('keeps an ignored commit from submitting an enclosing form', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());
      render(
        <form aria-label="Trip" onSubmit={onSubmit}>
          <Input>
            <Input.Chips defaultValue={['Rome']} max={1} />
            <Input.Field aria-label="Destinations" />
          </Input>
        </form>,
      );

      await user.type(getTagsField(), 'Nice{Enter}');

      expect(onSubmit).not.toHaveBeenCalled();
      expect(getTagsField()).toHaveValue('Nice');
    });

    it('ignores a duplicate tag by default', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const { container } = render(
        <Input>
          <Input.Chips defaultValue={['Rome']} onValueChange={onValueChange} />
          <Input.Field aria-label="Destinations" />
        </Input>,
      );

      await user.type(getTagsField(), 'Rome{Enter}');

      expect(onValueChange).not.toHaveBeenCalled();
      expect(chipLabels(container)).toEqual(['Rome']);
      expect(getTagsField()).toHaveValue('Rome');
    });

    it('keeps a rejected duplicate in the field when committed through the separator', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <Input>
          <Input.Chips defaultValue={['Rome']} separator="," onValueChange={onValueChange} />
          <Input.Field aria-label="Destinations" />
        </Input>,
      );

      await user.type(getTagsField(), 'Rome,');

      expect(onValueChange).not.toHaveBeenCalled();
      expect(getTagsField()).toHaveValue('Rome');
    });

    it('commits a duplicate tag when allowDuplicates is set', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const { container } = render(
        <Input>
          <Input.Chips defaultValue={['Rome']} allowDuplicates onValueChange={onValueChange} />
          <Input.Field aria-label="Destinations" />
        </Input>,
      );

      await user.type(getTagsField(), 'Rome{Enter}');

      expect(onValueChange).toHaveBeenCalledWith(['Rome', 'Rome']);
      expect(chipLabels(container)).toEqual(['Rome', 'Rome']);
      expect(screen.getAllByRole('button', { name: 'Remove Rome' })).toHaveLength(2);
    });
  });

  describe('removing', () => {
    it('removes the last tag on Backspace in an empty field', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const { container } = render(
        <Input>
          <Input.Chips defaultValue={['Rome', 'Oslo']} onValueChange={onValueChange} />
          <Input.Field aria-label="Destinations" />
        </Input>,
      );

      await user.click(getTagsField());
      await user.keyboard('{Backspace}');
      expect(onValueChange).toHaveBeenLastCalledWith(['Rome']);
      expect(chipLabels(container)).toEqual(['Rome']);

      await user.keyboard('{Backspace}');
      expect(onValueChange).toHaveBeenLastCalledWith([]);
      expect(chipLabels(container)).toEqual([]);

      await user.keyboard('{Backspace}');
      expect(onValueChange).toHaveBeenCalledTimes(2);
    });

    it('keeps the tags when Backspace edits typed text', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const { container } = render(
        <Input>
          <Input.Chips defaultValue={['Rome']} onValueChange={onValueChange} />
          <Input.Field aria-label="Destinations" />
        </Input>,
      );

      await user.type(getTagsField(), 'Os{Backspace}');

      expect(getTagsField()).toHaveValue('O');
      expect(onValueChange).not.toHaveBeenCalled();
      expect(chipLabels(container)).toEqual(['Rome']);
    });

    it('removes a specific tag through its remove button', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const { container } = render(
        <Input>
          <Input.Chips defaultValue={['Istanbul', 'London', 'Paris']} onValueChange={onValueChange} />
          <Input.Field aria-label="Destinations" />
        </Input>,
      );

      await user.click(screen.getByRole('button', { name: 'Remove London' }));

      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange).toHaveBeenCalledWith(['Istanbul', 'Paris']);
      expect(chipLabels(container)).toEqual(['Istanbul', 'Paris']);
    });
    it('removes a tag from the keyboard through its focusable remove button', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const { container } = render(
        <Input>
          <Input.Chips defaultValue={['Rome', 'Oslo']} onValueChange={onValueChange} />
          <Input.Field aria-label="Destinations" />
        </Input>,
      );

      await user.tab();
      expect(screen.getByRole('button', { name: 'Remove Rome' })).toHaveFocus();

      await user.keyboard('{Enter}');

      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange).toHaveBeenCalledWith(['Oslo']);
      expect(chipLabels(container)).toEqual(['Oslo']);
    });

    it('moves focus to the previous remove button after removing a tag from the keyboard', async () => {
      const user = userEvent.setup();
      render(
        <Input>
          <Input.Chips defaultValue={['Rome', 'Oslo', 'Nice']} />
          <Input.Field aria-label="Destinations" />
        </Input>,
      );

      await user.tab();
      await user.tab();
      expect(screen.getByRole('button', { name: 'Remove Oslo' })).toHaveFocus();

      await user.keyboard('{Enter}');

      expect(screen.getByRole('button', { name: 'Remove Rome' })).toHaveFocus();
    });

    it('moves focus to the next remove button, then to the field, as the leading tags are removed', async () => {
      const user = userEvent.setup();
      render(
        <Input>
          <Input.Chips defaultValue={['Rome', 'Oslo']} />
          <Input.Field aria-label="Destinations" />
        </Input>,
      );

      await user.tab();
      expect(screen.getByRole('button', { name: 'Remove Rome' })).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(screen.getByRole('button', { name: 'Remove Oslo' })).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(screen.queryByRole('button', { name: /^Remove/ })).not.toBeInTheDocument();
      expect(getTagsField()).toHaveFocus();
    });

    it('moves focus to a neighbour after a pointer removal that focused the remove button', async () => {
      const user = userEvent.setup();
      render(
        <Input>
          <Input.Chips defaultValue={['Rome', 'Oslo']} />
          <Input.Field aria-label="Destinations" />
        </Input>,
      );

      await user.click(screen.getByRole('button', { name: 'Remove Oslo' }));

      expect(screen.getByRole('button', { name: 'Remove Rome' })).toHaveFocus();
    });
  });

  describe('controlled', () => {
    it('renders the controlled value and reports changes without mutating it', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const { container } = render(
        <Input>
          <Input.Chips value={['Rome']} onValueChange={onValueChange} />
          <Input.Field aria-label="Destinations" />
        </Input>,
      );

      await user.type(getTagsField(), 'Oslo{Enter}');
      expect(onValueChange).toHaveBeenLastCalledWith(['Rome', 'Oslo']);
      expect(chipLabels(container)).toEqual(['Rome']);

      await user.click(screen.getByRole('button', { name: 'Remove Rome' }));
      expect(onValueChange).toHaveBeenLastCalledWith([]);
      expect(chipLabels(container)).toEqual(['Rome']);
    });

    it('follows value updates from the parent', async () => {
      const user = userEvent.setup();
      const Destinations = () => {
        const [tags, setTags] = useState(['Istanbul']);
        return (
          <>
            <Input>
              <Input.Chips value={tags} onValueChange={setTags} />
              <Input.Field aria-label="Destinations" />
            </Input>
            <button type="button" onClick={() => setTags(['Tokyo', 'Seoul'])}>
              Load preset
            </button>
          </>
        );
      };
      const { container } = render(<Destinations />);

      await user.type(getTagsField(), 'London{Enter}');
      expect(chipLabels(container)).toEqual(['Istanbul', 'London']);

      await user.click(screen.getByRole('button', { name: 'Remove Istanbul' }));
      expect(chipLabels(container)).toEqual(['London']);

      await user.click(screen.getByRole('button', { name: 'Load preset' }));
      expect(chipLabels(container)).toEqual(['Tokyo', 'Seoul']);
    });
  });

  describe('disabled and readOnly', () => {
    it.each([{ disabled: true }, { readOnly: true }])('renders disabled, non-removable chips when the Input is %o', stateProps => {
      const { container } = render(
        <Input {...stateProps}>
          <Input.Chips defaultValue={['Rome', 'Oslo']} />
          <Input.Field aria-label="Destinations" />
        </Input>,
      );

      const chips = Array.from(container.querySelectorAll('.tk-chip'));
      expect(chips).toHaveLength(2);
      for (const chip of chips) {
        expect(chip).toHaveAttribute('data-disabled', '');
        expect(chip).toHaveAttribute('aria-disabled', 'true');
        expect(chip).not.toHaveAttribute('data-removable');
      }
      expect(screen.queryByRole('button', { name: /^Remove/ })).not.toBeInTheDocument();
    });

    it('does not remove the last tag on Backspace in a read-only Input', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const { container } = render(
        <Input readOnly>
          <Input.Chips defaultValue={['Rome']} onValueChange={onValueChange} />
          <Input.Field aria-label="Destinations" />
        </Input>,
      );

      await user.click(getTagsField());
      await user.keyboard('{Backspace}');

      expect(onValueChange).not.toHaveBeenCalled();
      expect(chipLabels(container)).toEqual(['Rome']);
    });

    it('does not commit a tag on Enter in a read-only Input, and leaves the field text and onChange alone', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const onChange = vi.fn();
      const { container } = render(
        <Input readOnly>
          <Input.Chips defaultValue={['Rome']} onValueChange={onValueChange} />
          <Input.Field aria-label="Destinations" defaultValue="Oslo" onChange={onChange} />
        </Input>,
      );

      await user.click(getTagsField());
      await user.keyboard('{Enter}');

      expect(onValueChange).not.toHaveBeenCalled();
      expect(onChange).not.toHaveBeenCalled();
      expect(chipLabels(container)).toEqual(['Rome']);
      expect(getTagsField()).toHaveValue('Oslo');
    });

    it('does not prevent the native Enter (form submit) in a read-only Input', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());
      render(
        <form aria-label="Trip" onSubmit={onSubmit}>
          <Input readOnly>
            <Input.Chips defaultValue={['Rome']} />
            <Input.Field aria-label="Destinations" defaultValue="Oslo" />
          </Input>
        </form>,
      );

      await user.click(getTagsField());
      await user.keyboard('{Enter}');

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(getTagsField()).toHaveValue('Oslo');
    });

    it('ignores the separator in a read-only Input without touching the field', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const onChange = vi.fn();
      render(
        <Input readOnly>
          <Input.Chips defaultValue={['Rome']} separator="," onValueChange={onValueChange} />
          <Input.Field aria-label="Destinations" defaultValue="Oslo" onChange={onChange} />
        </Input>,
      );

      await user.click(getTagsField());
      await user.keyboard(',');

      expect(onValueChange).not.toHaveBeenCalled();
      expect(onChange).not.toHaveBeenCalled();
      expect(getTagsField()).toHaveValue('Oslo');
    });
  });

  describe('with Input.ClearButton', () => {
    it('keeps the clear button visible while tags exist and clears tags and text in one click', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const onClear = vi.fn();
      const { container } = render(
        <Input>
          <Input.Chips defaultValue={['Istanbul']} onValueChange={onValueChange} />
          <Input.Field aria-label="Destinations" />
          <Input.ClearButton onClear={onClear} />
        </Input>,
      );

      expect(getTagsField()).toHaveValue('');
      expect(screen.getByRole('button', { name: 'Clear input' })).toBeInTheDocument();

      await user.type(getTagsField(), 'Lon');
      await user.click(screen.getByRole('button', { name: 'Clear input' }));

      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange).toHaveBeenCalledWith([]);
      expect(chipLabels(container)).toEqual([]);
      expect(getTagsField()).toHaveValue('');
      expect(getTagsField()).toHaveFocus();
      expect(onClear).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole('button', { name: 'Clear input' })).not.toBeInTheDocument();
    });

    it('does not report a chips change when clearing typed text while there are no tags', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const onClear = vi.fn();
      render(
        <Input>
          <Input.Chips onValueChange={onValueChange} />
          <Input.Field aria-label="Destinations" />
          <Input.ClearButton onClear={onClear} />
        </Input>,
      );

      await user.type(getTagsField(), 'Lon');
      await user.click(screen.getByRole('button', { name: 'Clear input' }));

      expect(getTagsField()).toHaveValue('');
      expect(onClear).toHaveBeenCalledTimes(1);
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('hides the clear button once the last tag is removed from an empty field', async () => {
      const user = userEvent.setup();
      render(
        <Input>
          <Input.Chips defaultValue={['Rome']} />
          <Input.Field aria-label="Destinations" />
          <Input.ClearButton />
        </Input>,
      );
      expect(screen.getByRole('button', { name: 'Clear input' })).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Remove Rome' }));

      expect(screen.queryByRole('button', { name: 'Clear input' })).not.toBeInTheDocument();
    });

    it('clears every registered chips part, even without an Input.Field', async () => {
      const user = userEvent.setup();
      const onClear = vi.fn();
      const { container } = render(
        <Input>
          <Input.Chips />
          <Input.Chips defaultValue={['Rome', 'Oslo']} />
          <Input.ClearButton onClear={onClear} />
        </Input>,
      );

      // The first part is empty; the second one alone keeps the button visible.
      expect(screen.getByRole('button', { name: 'Clear input' })).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Clear input' }));

      expect(chipLabels(container)).toEqual([]);
      expect(onClear).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole('button', { name: 'Clear input' })).not.toBeInTheDocument();
    });

    it('stops keeping the clear button visible once the chips part unmounts', () => {
      const TagsInput = ({ showChips }: { showChips: boolean }) => (
        <Input>
          {showChips && <Input.Chips defaultValue={['Rome']} />}
          <Input.Field aria-label="Destinations" />
          <Input.ClearButton />
        </Input>
      );
      const { rerender } = render(<TagsInput showChips />);
      expect(screen.getByRole('button', { name: 'Clear input' })).toBeInTheDocument();

      rerender(<TagsInput showChips={false} />);

      expect(screen.queryByRole('button', { name: 'Clear input' })).not.toBeInTheDocument();
    });
  });

  describe('field replacement', () => {
    it('re-binds key handling when the field element is replaced', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const TagsInput = ({ fieldKey }: { fieldKey: string }) => (
        <Input>
          <Input.Chips onValueChange={onValueChange} />
          <Input.Field key={fieldKey} aria-label="Destinations" />
        </Input>
      );
      const { rerender } = render(<TagsInput fieldKey="first" />);
      const firstField = getTagsField();

      rerender(<TagsInput fieldKey="second" />);
      expect(getTagsField()).not.toBe(firstField);

      await user.type(getTagsField(), 'Oslo{Enter}');

      expect(onValueChange).toHaveBeenCalledWith(['Oslo']);
      expect(getTagsField()).toHaveValue('');
    });
  });

  describe('accessibility', () => {
    it('has no axe violations for a labelled chips field', async () => {
      const { container } = render(
        <Field>
          <Field.Label>Destinations</Field.Label>
          <Input>
            <Input.Chips defaultValue={['Istanbul', 'London']} separator="," />
            <Input.Field placeholder="Type a city and press Enter" />
            <Input.ClearButton />
          </Input>
          <Field.Description>Press Enter or comma to add.</Field.Description>
        </Field>,
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
