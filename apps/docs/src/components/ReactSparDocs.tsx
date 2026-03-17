import { useColorMode } from '@docusaurus/theme-common';
import { createElement, type PropsWithChildren } from 'react';
import { Button as ReactSparButton, SparReactProvider, type ButtonProps } from '@takeoff-ui/react-spar';

export function Button(props: ButtonProps) {
  return createElement(ReactSparButton, props);
}

export function ReactSparDemoRoot({ children }: PropsWithChildren) {
  const { colorMode } = useColorMode();

  return <SparReactProvider colorMode={colorMode === 'dark' ? 'dark' : 'light'}>{children}</SparReactProvider>;
}
