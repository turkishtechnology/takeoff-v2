import { useState } from 'react';
import RenderedDemo from '../../../components/RenderedDemo';
import { Checkbox, ReactSparDemoRoot } from './shared';

const code = `type Value = boolean | null;

export function IndeterminateCheckboxDemo() {
  const [meal, setMeal] = useState(false);
  const [luggage, setLuggage] = useState(false);
  const [seat, setSeat] = useState(false);

  const children = [meal, luggage, seat];
  const checkedCount = children.filter(Boolean).length;
  const parent: Value =
    checkedCount === 0 ? false : checkedCount === children.length ? true : null;

  const toggleAll = (next: Value) => {
    const resolved = next === true;
    setMeal(resolved);
    setLuggage(resolved);
    setSeat(resolved);
  };

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Checkbox label="All extras" value={parent} onChange={toggleAll} />
      <div style={{ display: 'grid', gap: 8, paddingInlineStart: 28 }}>
        <Checkbox label="Meal" value={meal} onChange={(next) => setMeal(Boolean(next))} />
        <Checkbox label="Extra luggage" value={luggage} onChange={(next) => setLuggage(Boolean(next))} />
        <Checkbox label="Seat selection" value={seat} onChange={(next) => setSeat(Boolean(next))} />
      </div>
    </div>
  );
}`;

type Value = boolean | null;

function IndeterminateCheckboxDemo() {
  const [meal, setMeal] = useState(false);
  const [luggage, setLuggage] = useState(false);
  const [seat, setSeat] = useState(false);

  const children = [meal, luggage, seat];
  const checkedCount = children.filter(Boolean).length;
  const parent: Value = checkedCount === 0 ? false : checkedCount === children.length ? true : null;

  const toggleAll = (next: Value) => {
    const resolved = next === true;
    setMeal(resolved);
    setLuggage(resolved);
    setSeat(resolved);
  };

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Checkbox label="All extras" value={parent} onChange={toggleAll} />
      <div style={{ display: 'grid', gap: 8, paddingInlineStart: 28 }}>
        <Checkbox label="Meal" value={meal} onChange={next => setMeal(Boolean(next))} />
        <Checkbox label="Extra luggage" value={luggage} onChange={next => setLuggage(Boolean(next))} />
        <Checkbox label="Seat selection" value={seat} onChange={next => setSeat(Boolean(next))} />
      </div>
    </div>
  );
}

export default function Indeterminate() {
  return (
    <RenderedDemo code={code} previewWrapper={ReactSparDemoRoot}>
      <IndeterminateCheckboxDemo />
    </RenderedDemo>
  );
}
