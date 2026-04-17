import { useColorMode } from '@docusaurus/theme-common';
import { createElement, type PropsWithChildren } from 'react';
import {
  Accordion as ReactSparAccordion,
  AccordionItem as ReactSparAccordionItem,
  Button as ReactSparButton,
  Checkbox as ReactSparCheckbox,
  Dialog as ReactSparDialog,
  Input as ReactSparInput,
  SparReactProvider,
  type AccordionItemProps,
  type AccordionProps,
  type ButtonProps,
  type CheckboxProps,
  type DialogProps,
  type InputProps,
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

export function Checkbox(props: CheckboxProps) {
  return createElement(ReactSparCheckbox, props);
}

export function Dialog(props: DialogProps) {
  return createElement(ReactSparDialog, props);
}

export function Input(props: InputProps) {
  return createElement(ReactSparInput, props);
}

export function ReactSparDemoRoot({ children }: PropsWithChildren) {
  const { colorMode } = useColorMode();

  return <SparReactProvider colorMode={colorMode === 'dark' ? 'dark' : 'light'}>{children}</SparReactProvider>;
}
