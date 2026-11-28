import { act, render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Avatar, AvatarFallback, AvatarImage } from '../index';
import { MockImage } from './mockImage';

expect.extend(toHaveNoViolations);
MockImage.install();

describe('Avatar accessibility', () => {
  it('has no violations while loading and once loaded', async () => {
    const { container } = render(
      <Avatar>
        <AvatarImage src="/user.png" alt="Ada Lovelace" />
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>,
    );
    expect(await axe(container)).toHaveNoViolations();

    act(() => MockImage.last().load());
    expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('can be named as a whole with role="img"', async () => {
    const { container } = render(
      <Avatar role="img" aria-label="Ada Lovelace">
        <AvatarFallback aria-hidden="true">AL</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
