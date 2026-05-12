import type { ReactNode } from 'react';

export const renderIconSymbol = (icon: ReactNode, symbolClassName: string) => {
  if (typeof icon === 'string') {
    return (
      <span className={symbolClassName} data-icon-kind="symbol">
        {icon}
      </span>
    );
  }

  return icon;
};
