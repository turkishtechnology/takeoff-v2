import type { ErrorState } from './types';

export function parseErrorString(raw: string): Omit<ErrorState, 'hasError' | 'timestamp'> {
  let errorName = 'Error';
  let errorMessage;
  let line: number | null = null;
  let column: number | null = null;

  const newlineIndex = raw.indexOf('\n');
  const firstLine = newlineIndex > -1 ? raw.slice(0, newlineIndex) : raw;
  const stack = newlineIndex > -1 ? raw.slice(newlineIndex + 1) : '';

  const colonIndex = firstLine.indexOf(':');
  if (colonIndex > 0 && colonIndex < 30 && /^[A-Z]\w*Error$/.test(firstLine.slice(0, colonIndex))) {
    errorName = firstLine.slice(0, colonIndex);
    errorMessage = firstLine.slice(colonIndex + 1).trim();
  } else {
    errorMessage = firstLine;
  }

  const lineColumnMatch = raw.match(/\((\d+):(\d+)\)/) || raw.match(/(\d+):(\d+)/);
  if (lineColumnMatch) {
    line = Number.parseInt(lineColumnMatch[1], 10);
    column = Number.parseInt(lineColumnMatch[2], 10);
  } else {
    const lineOnlyMatch = raw.match(/line\s+(\d+)/i);
    if (lineOnlyMatch) {
      line = Number.parseInt(lineOnlyMatch[1], 10);
    }
  }

  return { errorName, errorMessage, stack, line, column };
}
