export function parseErrorString(raw: string): { errorName: string; errorMessage: string; stack: string } {
  let errorName = 'Error';
  let errorMessage;

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

  return { errorName, errorMessage, stack };
}
