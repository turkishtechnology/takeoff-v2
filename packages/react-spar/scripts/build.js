import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, relative, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { compile } from 'sass';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageDir = resolve(scriptDir, '..');
const distDir = resolve(packageDir, 'dist');
const distStylesDir = resolve(distDir, 'styles');
const sourceStylesEntry = resolve(packageDir, 'src/styles/style.scss');
const emittedModuleExtensions = new Set(['.js', '.mjs', '.cjs', '.css', '.json']);
const sourceModuleExtensions = ['.ts', '.tsx', '.mts', '.cts'];

const collectFiles = (directoryPath, predicate, collected = []) => {
  for (const entry of readdirSync(directoryPath)) {
    const entryPath = resolve(directoryPath, entry);
    const entryStats = statSync(entryPath);

    if (entryStats.isDirectory()) {
      collectFiles(entryPath, predicate, collected);
      continue;
    }

    if (predicate(entryPath)) {
      collected.push(entryPath);
    }
  }

  return collected;
};

const getRelativeSpecifiers = source => {
  const specifiers = [];
  const statementPattern = /^\s*(?:import|export)\b(?:[^'"`]|"[^"]*"|'[^']*')*?['"]([^'"]+)['"]/gm;

  for (const match of source.matchAll(statementPattern)) {
    const specifier = match[1];

    if (specifier.startsWith('.')) {
      specifiers.push(specifier);
    }
  }

  return specifiers;
};

const getRelativeSpecifierMatches = source =>
  [...source.matchAll(/(^\s*(?:import|export)\b(?:[^'"`]|"[^"]*"|'[^']*')*?)(['"])([^'"]+)(\2)/gm)].map(match => ({
    fullMatch: match[0],
    prefix: match[1],
    quote: match[2],
    specifier: match[3],
    suffix: match[4],
  }));

const normalizePathSeparators = filePath => filePath.replaceAll('\\', '/');

const ensureRelativeSpecifier = filePath => (filePath.startsWith('.') ? filePath : `./${filePath}`);

const stripSourceExtension = specifier => {
  for (const extension of sourceModuleExtensions) {
    if (specifier.endsWith(extension)) {
      return specifier.slice(0, -extension.length);
    }
  }

  return specifier;
};

const resolveEmittedSpecifier = (filePath, specifier) => {
  if (!specifier.startsWith('.')) {
    return specifier;
  }

  if (emittedModuleExtensions.has(extname(specifier))) {
    return specifier;
  }

  const normalizedSpecifier = stripSourceExtension(specifier);
  const candidateBasePath = resolve(dirname(filePath), normalizedSpecifier);
  const candidates = [
    `${candidateBasePath}.js`,
    `${candidateBasePath}.mjs`,
    `${candidateBasePath}.cjs`,
    resolve(candidateBasePath, 'index.js'),
    resolve(candidateBasePath, 'index.mjs'),
    resolve(candidateBasePath, 'index.cjs'),
  ];
  const resolvedTarget = candidates.find(candidatePath => existsSync(candidatePath));

  if (!resolvedTarget) {
    return specifier;
  }

  return ensureRelativeSpecifier(normalizePathSeparators(relative(dirname(filePath), resolvedTarget)));
};

// Keep source imports extensionless while still emitting Node-compatible ESM specifiers.
const rewriteEmittedRelativeSpecifiers = directoryPath => {
  const emittedFiles = collectFiles(directoryPath, filePath => filePath.endsWith('.js') || filePath.endsWith('.d.ts'));

  for (const filePath of emittedFiles) {
    const source = readFileSync(filePath, 'utf8');
    const rewrittenSource = getRelativeSpecifierMatches(source).reduce((currentSource, match) => {
      const rewrittenSpecifier = resolveEmittedSpecifier(filePath, match.specifier);

      if (rewrittenSpecifier === match.specifier) {
        return currentSource;
      }

      return currentSource.replace(match.fullMatch, `${match.prefix}${match.quote}${rewrittenSpecifier}${match.suffix}`);
    }, source);

    if (rewrittenSource !== source) {
      writeFileSync(filePath, rewrittenSource);
    }
  }
};

const assertEmittedRelativeSpecifiersAreFullySpecified = directoryPath => {
  const emittedFiles = collectFiles(directoryPath, filePath => filePath.endsWith('.js') || filePath.endsWith('.d.ts'));
  const invalidSpecifiers = [];

  for (const filePath of emittedFiles) {
    const source = readFileSync(filePath, 'utf8');
    const specifiers = getRelativeSpecifiers(source);

    for (const specifier of specifiers) {
      if (!emittedModuleExtensions.has(extname(specifier))) {
        invalidSpecifiers.push({ filePath, specifier });
      }
    }
  }

  if (invalidSpecifiers.length > 0) {
    const details = invalidSpecifiers.map(({ filePath, specifier }) => `- ${filePath}: ${specifier}`).join('\n');
    throw new Error(`Build produced relative specifiers without emitted file extensions:\n${details}`);
  }
};

const run = (command, args) => {
  const executable = process.platform === 'win32' ? `${command}.cmd` : command;

  execFileSync(executable, args, {
    cwd: packageDir,
    stdio: 'inherit',
  });
};

rmSync(distDir, { force: true, recursive: true });
run('tsc', ['--project', 'tsconfig.build.json']);
rewriteEmittedRelativeSpecifiers(distDir);
assertEmittedRelativeSpecifiersAreFullySpecified(distDir);

const styles = compile(sourceStylesEntry, {
  loadPaths: [resolve(packageDir, 'src/styles')],
  style: 'expanded',
});

mkdirSync(distStylesDir, { recursive: true });
writeFileSync(resolve(distDir, 'styles.css'), styles.css);
writeFileSync(resolve(distStylesDir, 'index.js'), "import '../styles.css';\n");
