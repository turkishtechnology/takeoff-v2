'use strict';

const fs = require('fs');
const path = require('path');
const rootDir = path.join(__dirname, '..');
const tokensDistTW = path.join(rootDir, '..', 'tokens', 'dist', 'tailwind');
const tailwindOutput = require('../../tokens/scripts/tailwind-output.json');

const v3ThemeFiles = Object.values(tailwindOutput.v3ThemeFiles);
const v3ComponentFiles = Object.values(tailwindOutput.v3ComponentFiles);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyFile(src, dest, label) {
  if (!fs.existsSync(src)) {
    console.warn(`  [WARN] ${label}: ${path.basename(src)} not found — skipping`);
    return false;
  }
  fs.copyFileSync(src, dest);
  return true;
}

try {
  fs.rmSync(path.join(rootDir, 'dist'), { recursive: true, force: true });
  fs.rmSync(path.join(rootDir, tailwindOutput.v4ThemeFile), { force: true });
  fs.rmSync(path.join(rootDir, 'lib'), { recursive: true, force: true });

  console.log('v4: building dist/v4/theme.css');
  const v4Dir = path.join(rootDir, 'dist', 'v4');
  ensureDir(v4Dir);
  if (!copyFile(path.join(tokensDistTW, tailwindOutput.v4ThemeFile), path.join(v4Dir, tailwindOutput.v4ThemeFile), 'v4')) {
    throw new Error('theme.css not found in tokens dist — run tokens build first');
  }
  console.log('  [PASS] dist/v4/theme.css');

  console.log('v3: syncing dist/v3 from tokens dist');

  const v3Dir = path.join(rootDir, 'dist', 'v3');
  const v3ThemeDir = path.join(v3Dir, 'theme');
  const v3CompDir = path.join(v3Dir, 'components');
  ensureDir(v3ThemeDir);
  ensureDir(v3CompDir);

  let v3Count = 0;

  for (const file of v3ThemeFiles) {
    if (copyFile(path.join(tokensDistTW, file), path.join(v3ThemeDir, file), 'v3/theme')) {
      v3Count++;
    }
  }

  for (const file of v3ComponentFiles) {
    if (copyFile(path.join(tokensDistTW, file), path.join(v3CompDir, file), 'v3/components')) {
      v3Count++;
    }
  }

  fs.writeFileSync(
    path.join(v3Dir, 'index.js'),
    `const plugin = require('tailwindcss/plugin');

module.exports = plugin(
  api => {
    require('./components/typography')(api);
  },
  {
    theme: {
      screens: require('./theme/screens'),
      extend: {
        colors: require('./theme/colors'),
        spacing: require('./theme/spacing'),
      },
      borderRadius: require('./theme/radius'),
      boxShadow: require('./theme/effects'),
    },
  },
);
`,
  );

  console.log(`  [PASS] ${v3Count}/${v3ThemeFiles.length + v3ComponentFiles.length} files synced`);
  console.log('Build completed successfully!');
} catch (error) {
  console.error(`[FAIL] Build failed: ${error.message}`);
  process.exit(1);
}
