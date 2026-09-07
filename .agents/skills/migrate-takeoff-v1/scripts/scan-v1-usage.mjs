#!/usr/bin/env node

/* eslint-disable no-console */
/* global console, process */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const root = resolve(process.argv[2] ?? '.');
const jsonOnly = process.argv.includes('--json');
const ignored = new Set(['.git', 'node_modules', 'dist', 'build', '.next', '.turbo']);
const sourceExtensions = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.css', '.scss', '.sass', '.less', '.html', '.vue']);
const gaps = new Set([
  'TkAvatar',
  'TkAvatarGroup',
  'TkCarousel',
  'TkChart',
  'TkColorPicker',
  'TkCurrencyInput',
  'TkDatepicker',
  'TkEditor',
  'TkGanttChart',
  'TkOrgChart',
  'TkPagination',
  'TkPhoneInput',
  'TkRating',
  'TkTimeline',
  'TkTimelineItem',
  'TkTreeView',
]);
const direct = new Set(['TkButton', 'TkAlert', 'TkBadge', 'TkCheckbox', 'TkChips', 'TkDivider', 'TkInput', 'TkTextarea', 'TkSlider', 'TkSpinner', 'TkToggle']);
const special = new Set(['TkIcon', 'TkToggleButton', 'TkToggleButtonGroup']);
const compound = new Set([
  'TkAccordion',
  'TkAccordionItem',
  'TkBreadcrumb',
  'TkBreadcrumbItem',
  'TkCard',
  'TkDialog',
  'TkDrawer',
  'TkDropdown',
  'TkPopover',
  'TkRadio',
  'TkRadioGroup',
  'TkSelect',
  'TkStep',
  'TkStepper',
  'TkTable',
  'TkTabs',
  'TkTabsItem',
  'TkTooltip',
  'TkUpload',
]);

function filesIn(dir) {
  if (!existsSync(dir)) return [];
  const result = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) result.push(...filesIn(path));
    else if (sourceExtensions.has(path.slice(path.lastIndexOf('.')))) result.push(path);
  }
  return result;
}

function packageReactVersion() {
  let dir = root;
  while (true) {
    const path = join(dir, 'package.json');
    if (existsSync(path)) {
      try {
        const pkg = JSON.parse(readFileSync(path, 'utf8'));
        const deps = { ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies };
        return { version: deps.react ?? null, packageJson: path };
      } catch {
        return { version: null, packageJson: path };
      }
    }
    const parent = dirname(dir);
    if (parent === dir) return { version: null, packageJson: null };
    dir = parent;
  }
}

function add(map, key, file, value, count = true) {
  if (!map[key]) map[key] = { count: 0, files: [], attributes: [] };
  if (count) map[key].count += 1;
  if (!map[key].files.includes(file)) map[key].files.push(file);
  if (value && !map[key].attributes.includes(value)) map[key].attributes.push(value);
}

function* componentTags(text) {
  const startPattern = /<((?:Tk)[A-Z][A-Za-z0-9]*)\b/gu;
  let match;
  while ((match = startPattern.exec(text)) !== null) {
    let index = startPattern.lastIndex;
    let braceDepth = 0;
    let quote = null;
    let escaped = false;

    for (; index < text.length; index += 1) {
      const character = text[index];
      if (quote) {
        if (escaped) {
          escaped = false;
        } else if (character === '\\') {
          escaped = true;
        } else if (character === quote) {
          quote = null;
        }
        continue;
      }
      if (character === "'" || character === '"' || character === '`') {
        quote = character;
      } else if (character === '{') {
        braceDepth += 1;
      } else if (character === '}' && braceDepth > 0) {
        braceDepth -= 1;
      } else if (character === '>' && braceDepth === 0) {
        break;
      }
    }

    if (index < text.length) {
      yield { name: match[1], attributes: text.slice(startPattern.lastIndex, index) };
      startPattern.lastIndex = index + 1;
    } else {
      break;
    }
  }
}

const components = {};
const handlers = {};
const imports = [];
const rawElements = [];
const cssFindings = [];
const files = filesIn(root);

for (const absolute of files) {
  const relative = absolute.slice(root.length + 1);
  const text = readFileSync(absolute, 'utf8');
  for (const match of text.matchAll(/(?:import|export)[\s\S]{0,300}?from\s*['"](@takeoff-ui\/(?:react|core|tailwind))['"]/gu)) {
    imports.push({ file: relative, package: match[1] });
  }
  for (const tag of componentTags(text)) {
    const name = tag.name;
    add(components, name, relative);
    for (const attr of tag.attributes.matchAll(/\s([A-Za-z][\w:-]*)(?:\s*=|\s|\/|$)/gu)) {
      if (attr[1] !== name) add(components, name, relative, attr[1], false);
    }
  }
  for (const match of text.matchAll(/\bonTk[A-Z][A-Za-z0-9]*/gu)) add(handlers, match[0], relative);
  for (const match of text.matchAll(/<tk-[a-z0-9-]+\b[^>]*>/giu)) rawElements.push({ file: relative, tag: match[0].match(/^<([^\s>]+)/u)[1] });
  if (/['"]@takeoff-ui\/core\/dist\/core\/core\.css['"]/u.test(text)) cssFindings.push({ file: relative, kind: 'v1 core.css import' });
  if (/--(?:tk|[a-z0-9-]*token)[a-z0-9-]*\s*:/iu.test(text)) cssFindings.push({ file: relative, kind: 'token or --tk override' });
  if (/containerStyle\s*=/u.test(text)) cssFindings.push({ file: relative, kind: 'containerStyle usage' });
}

for (const entry of Object.values(components)) {
  entry.files.sort();
  entry.attributes.sort();
}
const sortedComponents = Object.fromEntries(Object.entries(components).sort((a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0])));
const react = packageReactVersion();
const result = {
  root,
  react,
  imports,
  components: sortedComponents,
  handlers: Object.fromEntries(Object.entries(handlers).sort()),
  rawElements,
  cssFindings,
  blockers: { react18: /(^|[^0-9])18([.-]|$)/u.test(react.version ?? ''), gaps: Object.keys(components).filter(name => gaps.has(name)), rawElements: rawElements.length > 0 },
};

if (jsonOnly) {
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

const bucket = name => (gaps.has(name) ? 'gap' : direct.has(name) ? 'direct' : compound.has(name) ? 'compound' : special.has(name) ? 'special' : 'unknown');
const lines = [
  `# Takeoff v1 usage inventory`,
  '',
  `Root: \`${root}\``,
  `React: \`${react.version ?? 'not found'}\``,
  '',
  `## Imports`,
  '',
  imports.length ? imports.map(item => `- \`${item.package}\` in \`${item.file}\``).join('\n') : '- None found',
  '',
  '## Components by blast radius',
  '',
];
for (const [name, data] of Object.entries(sortedComponents))
  lines.push(
    `- **${name}** (${bucket(name)}, ${data.count} use${data.count === 1 ? '' : 's'}): ${data.attributes.length ? data.attributes.map(attr => `\`${attr}\``).join(', ') : 'no attributes detected'}; ${data.files.map(file => `\`${file}\``).join(', ')}`,
  );
lines.push(
  '',
  '## Handlers',
  '',
  Object.keys(handlers).length
    ? Object.keys(handlers)
        .map(name => `- \`${name}\` (${handlers[name].count})`)
        .join('\n')
    : '- None found',
  '',
  '## Styling and raw elements',
  '',
  cssFindings.length ? cssFindings.map(item => `- ${item.kind}: \`${item.file}\``).join('\n') : '- No v1 CSS signals found',
  rawElements.length ? rawElements.map(item => `- raw \`${item.tag}\` in \`${item.file}\``).join('\n') : '- No raw tk-* elements found',
  '',
  '## Blockers',
  '',
  result.blockers.react18 ? '- React 18 detected: upgrade React before mounting v2.' : '- React 18 not detected.',
  result.blockers.gaps.length ? `- Gap components: ${result.blockers.gaps.map(name => `\`${name}\``).join(', ')}` : '- No known gap component detected.',
  result.blockers.rawElements ? '- Raw custom elements detected: migrate those call sites separately.' : '- No raw custom elements detected.',
  '',
  '## Suggested order',
  '',
  '- 1. Finish provider, token CSS, React 19, and package setup.',
  '- 2. Migrate direct leaf controls by descending use count.',
  '- 3. Migrate compound parents after their leaf content.',
  '- 4. Explicitly decide every gap, then rerun this inventory.',
);
console.log(lines.join('\n'));
