import { useColorMode } from '@docusaurus/theme-common';
import { createElement, type PropsWithChildren } from 'react';
import {
  Accordion as ReactSparAccordion,
  AccordionItem as ReactSparAccordionItem,
  Button as ReactSparButton,
  SparReactProvider,
  type AccordionItemProps,
  type AccordionProps,
  type ButtonProps,
} from '@takeoff-ui/react-spar';

export function Accordion(props: AccordionProps) {
  return createElement(ReactSparAccordion, props);
}

export function AccordionItem(props: AccordionItemProps) {
  return createElement(ReactSparAccordionItem, props);
}

export function Button(props: ButtonProps) {
  return createElement(ReactSparButton, props);
}

export function ReactSparDemoRoot({ children }: PropsWithChildren) {
  const { colorMode } = useColorMode();

  return <SparReactProvider colorMode={colorMode === 'dark' ? 'dark' : 'light'}>{children}</SparReactProvider>;
}
