import { access, cp, mkdir } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { dirname, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const docsDir = resolve(__dirname, '..');
const takeoffUiRoot = process.env.TAKEOFF_UI_PATH || '/Users/ulasturan/Desktop/http/takeoff-ui';
const takeoffUiStaticImgPath = resolve(takeoffUiRoot, 'docs/static/img');
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

async function main() {
  if (!(await exists(takeoffUiStaticImgPath))) {
    process.stderr.write(`takeoff-ui assets not found at ${takeoffUiStaticImgPath}; skipping asset sync.\n`);
    return;
  }

  await mkdir(resolve(docsStaticDir, 'img'), { recursive: true });
  await Promise.all(syncedAssetEntries.map(entry => cp(resolve(takeoffUiStaticImgPath, entry), resolve(docsStaticDir, 'img', entry), { recursive: true, force: true })));

  process.stdout.write(`Synced takeoff-ui assets -> ${resolve(docsStaticDir, 'img')}\n`);
}

main().catch(error => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
