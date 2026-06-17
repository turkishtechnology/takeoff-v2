import { Card as CardRoot } from './Card';
import { CardHeader } from './CardHeader';
import { CardTitle } from './CardTitle';
import { CardDescription } from './CardDescription';
import { CardBody } from './CardBody';
import { CardFooter } from './CardFooter';

const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Body: CardBody,
  Footer: CardFooter,
});

export { Card };

export type {
  CardBodyProps,
  CardBodySlot,
  CardDescriptionProps,
  CardDescriptionSlot,
  CardFooterProps,
  CardFooterSlot,
  CardHeaderProps,
  CardHeaderSlot,
  CardProps,
  CardSlot,
  CardFooterType,
  CardHeaderType,
  CardTitleProps,
  CardTitleSlot,
} from './types';
