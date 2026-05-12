import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

export function getVariableBaselineReport(currentVars, previousVars, { acceptBaseline = false } = {}) {
  const currentSet = new Set(currentVars);
  const previousSet = new Set(previousVars);
  const removed = previousVars.filter(v => !currentSet.has(v));
  const added = currentVars.filter(v => !previousSet.has(v));

  return {
    added,
    removed,
    passed: acceptBaseline || removed.length === 0,
  };
}

export function writeVariableBaseline(filePath, currentVars) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, currentVars.join('\n') + '\n');
}
