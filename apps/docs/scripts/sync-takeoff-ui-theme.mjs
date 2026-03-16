import { access, cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { dirname, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const docsDir = resolve(__dirname, '..');
const generatedDir = resolve(docsDir, 'src/css/generated');

const takeoffUiRoot = process.env.TAKEOFF_UI_PATH || '/Users/ulasturan/Desktop/http/takeoff-ui';
const docusaurusOverridesSourcePath = resolve(takeoffUiRoot, 'docs/src/css/custom.css');
const takeoffUiTokensSourcePath = resolve(takeoffUiRoot, 'packages/core/src/global/sass/abstracts/_variables.scss');
const takeoffUiStaticImgPath = resolve(takeoffUiRoot, 'docs/static/img');

const generatedIfmOverridesPath = resolve(generatedDir, 'takeoff-ui-docusaurus-overrides.css');
const generatedLayoutPath = resolve(generatedDir, 'takeoff-ui-layout.css');
const generatedTokensPath = resolve(generatedDir, 'takeoff-ui-tokens.css');
const docsStaticDir = resolve(docsDir, 'static');

const syncedAssetEntries = [
  'bg-body.png',
  'contributors',
  'design-system-preview.svg',
  'design-system-preview-dark.svg',
  'favicon.ico',
  'figma-icon.svg',
  'figma-icon-dark.svg',
  'flexible.svg',
  'footer-image.png',
  'footer-image-dark.png',
  'framework-agnostic.svg',
  'framework-section',
  'hero',
  'navbar-logo.svg',
  'navbar-logo-dark.svg',
  'overview',
  'powered-by-stencil.svg',
  'simple.svg',
  'takeoff-og.jpg',
];

async function exists(path) {
  try {
    await access(path, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function extractBlock(source, marker) {
  const start = source.indexOf(marker);
  if (start === -1) {
    throw new Error(`Could not find block starting with: ${marker}`);
  }

  const openBraceIndex = source.indexOf('{', start);
  if (openBraceIndex === -1) {
    throw new Error(`Could not find opening brace for block: ${marker}`);
  }

  let depth = 0;

  for (let index = openBraceIndex; index < source.length; index += 1) {
    const character = source[index];

    if (character === '{') {
      depth += 1;
    }

    if (character === '}') {
      depth -= 1;

      if (depth === 0) {
        return source.slice(start, index + 1);
      }
    }
  }

  throw new Error(`Could not find closing brace for block: ${marker}`);
}

function removeSingleImportLine(source, importPath) {
  const importLinePattern = new RegExp(`^\\s*@import\\s+['"]${importPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"];\\s*\\n?`, 'm');
  return source.replace(importLinePattern, '');
}

function normalizeScssComments(source) {
  return source.replace(/^(\s*)\/\/\s?(.*)$/gmu, '$1/* $2 */');
}

async function main() {
  const sourceFilesExist = (await exists(docusaurusOverridesSourcePath)) && (await exists(takeoffUiTokensSourcePath));

  if (!sourceFilesExist) {
    const generatedFilesExist = (await exists(generatedIfmOverridesPath)) && (await exists(generatedLayoutPath)) && (await exists(generatedTokensPath));

    if (generatedFilesExist) {
      process.stderr.write(`takeoff-ui theme sources are missing under ${takeoffUiRoot}; using committed generated files.\n`);
      return;
    }

    throw new Error(`takeoff-ui theme sources were not found under ${takeoffUiRoot}`);
  }

  const docusaurusOverridesSource = await readFile(docusaurusOverridesSourcePath, 'utf8');
  const takeoffUiTokensSource = await readFile(takeoffUiTokensSourcePath, 'utf8');

  const ifmRootBlock = extractBlock(docusaurusOverridesSource, ':root {');
  const darkIfmBlockMatch = [...docusaurusOverridesSource.matchAll(/\[data-theme='dark'\]\s*\{[\s\S]*?\n\}/gmu)].find(match => match[0].includes('--ifm-color-primary'));

  if (!darkIfmBlockMatch) {
    throw new Error(`Could not find the dark-mode IFM override block in ${docusaurusOverridesSourcePath}`);
  }

  const darkIfmBlock = darkIfmBlockMatch[0];
  const tokensRootBlock = extractBlock(takeoffUiTokensSource, ':root {');
  const tokensDarkBlock = extractBlock(takeoffUiTokensSource, "[data-theme='dark'] {");
  const generatedLayoutSource = removeSingleImportLine(
    removeSingleImportLine(
      docusaurusOverridesSource
        .replace(ifmRootBlock, '')
        .replace(darkIfmBlock, '')
        .replace(/^@tailwind.*$/gm, '')
        .trim(),
      './docs/docs.css',
    ),
    './docs/docs.css',
  );

  const generatedIfmOverrides = `/* Generated from ${docusaurusOverridesSourcePath}. Do not edit manually. */\n\n` + `${ifmRootBlock.trim()}\n\n` + `${darkIfmBlock.trim()}\n`;
  const generatedLayout = `/* Generated from ${docusaurusOverridesSourcePath}. Do not edit manually. */\n\n${generatedLayoutSource}\n`;
  const generatedTokens =
    `/* Generated from ${takeoffUiTokensSourcePath}. Do not edit manually. */\n\n` +
    `${normalizeScssComments(tokensRootBlock).trim()}\n\n` +
    `${normalizeScssComments(tokensDarkBlock).trim()}\n`;

  await mkdir(generatedDir, { recursive: true });
  await mkdir(resolve(docsStaticDir, 'img'), { recursive: true });
  await Promise.all([
    writeFile(generatedIfmOverridesPath, generatedIfmOverrides),
    writeFile(generatedLayoutPath, generatedLayout),
    writeFile(generatedTokensPath, generatedTokens),
    ...syncedAssetEntries.map(entry => cp(resolve(takeoffUiStaticImgPath, entry), resolve(docsStaticDir, 'img', entry), { recursive: true, force: true })),
  ]);

  process.stdout.write(`Synced takeoff-ui tokens -> ${generatedTokensPath}\n`);
  process.stdout.write(`Synced takeoff-ui Docusaurus IFM overrides -> ${generatedIfmOverridesPath}\n`);
  process.stdout.write(`Synced takeoff-ui layout styles -> ${generatedLayoutPath}\n`);
  process.stdout.write(`Synced takeoff-ui assets -> ${resolve(docsStaticDir, 'img')}\n`);
}

main().catch(error => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
