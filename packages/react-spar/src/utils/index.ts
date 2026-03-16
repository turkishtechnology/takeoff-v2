export const joinClassNames = (...classNames: Array<string | false | null | undefined>) => classNames.filter((className): className is string => Boolean(className)).join(' ');
