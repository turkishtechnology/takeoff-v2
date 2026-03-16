import { useColorMode } from '@docusaurus/theme-common';
import { createElement, type PropsWithChildren } from 'react';
import { Button as ReactSparButton, ThemeProvider, type ButtonProps } from '@takeoff-ui/react-spar';

export function Button(props: ButtonProps) {
  return createElement(ReactSparButton, props);
}

export function ReactSparDemoRoot({ children }: PropsWithChildren) {
  const { colorMode } = useColorMode();

  return <ThemeProvider colorMode={colorMode === 'dark' ? 'dark' : 'light'}>{children}</ThemeProvider>;
}
