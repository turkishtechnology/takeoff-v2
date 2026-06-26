#!/usr/bin/env node
/* eslint-disable no-console */
/* global console */

/**
 * Markdown / llms.txt generator for the Takeoff Spar docs.
 *
 * Turns every page under `apps/docs/docs/**` into an AI-friendly plain-Markdown
 * file so a consumer can download a page (or the whole library) and hand it to
 * an LLM to generate code against `@takeoff-ui/react-spar`.
 *
 * Three kinds of output land in `apps/docs/static/` (Docusaurus copies that
 * directory verbatim to the build root, so the files are served in both `dev`
 * and `build`. A planned per-page "Copy / Download as Markdown" button can then
 * resolve them locally — TODO: that button is not wired up yet):
 *
 *   static/docs/<route>.md   one clean Markdown file per docs page, served at
 *                            the same URL + ".md" (e.g.
 *                            /docs/components/button -> /docs/components/button.md)
 *   static/llms.txt          llmstxt.org index: title, blurb, links to every .md
 *   static/llms-full.txt     the entire corpus concatenated into one file
 *
 * The hard part is that component pages are MDX, not Markdown: the actual demo
 * source lives in `export const xDemo = String.raw`...`` and is pulled in by
 * `<LiveCode code={xDemo} />`, and the API tables are built from `<ApiBadge>`,
 * `<code>`, `<a>` and HTML entities (`&#124;` etc.). `mdxToMarkdown()` below
 * inlines each referenced demo as a fenced ```tsx block and flattens the table
 * JSX back to plain Markdown so an LLM sees real, runnable usage.
 *
 * Wired into the same prebuild step as the other generators:
 *   pnpm run gen:llms        (also runs via predev / prebuild)
 *
 * Generated output is not committed — see apps/docs/.gitignore.
 */

import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const DOCS_APP_DIR = resolve(SCRIPT_DIR, '..');
const DOCS_DIR = join(DOCS_APP_DIR, 'docs');
const STATIC_DIR = join(DOCS_APP_DIR, 'static');
const CONFIG_FILE = join(DOCS_APP_DIR, 'docusaurus.config.ts');

// Docs live under this route base (classic preset default). Keep in sync with
// the docs plugin if `routeBasePath` is ever set explicitly.
const ROUTE_BASE = '/docs';

// Section grouping for llms.txt, in display order. First matching prefix wins;
// anything unmatched falls through to "Guides".
const SECTIONS = [
  { title: 'Getting Started', match: p => p === 'intro.md' || p === 'installation.mdx' },
  { title: 'Foundations', match: p => p.startsWith('foundations/') },
  { title: 'Components', match: p => p.startsWith('components/') },
  { title: 'Forms', match: p => p.startsWith('forms/') },
];

// --- site URL (read from docusaurus.config.ts, with a safe fallback) ---------

function readSiteUrl() {
  let url = 'https://takeoff-v2.app.turkishtechlab.com';
  try {
    const cfg = readFileSync(CONFIG_FILE, 'utf8');
    url = cfg.match(/\burl:\s*'([^']+)'/u)?.[1] ?? url;
  } catch {
    // keep fallback
  }
  return url.replace(/\/$/u, '');
}

// --- frontmatter -------------------------------------------------------------

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/u);
  if (!match) return { data: {}, body: raw };

  const data = {};
  const lines = match[1].split('\n');
  for (let i = 0; i < lines.length; i++) {
    const keyMatch = lines[i].match(/^([A-Za-z_][\w-]*):\s*(.*)$/u);
    if (!keyMatch) continue;
    const key = keyMatch[1];
    let value = keyMatch[2];
    // Folded/multi-line YAML scalar: gather indented continuation lines.
    if (value === '') {
      const parts = [];
      while (i + 1 < lines.length && /^\s+\S/u.test(lines[i + 1])) {
        parts.push(lines[++i].trim());
      }
      value = parts.join(' ');
    }
    data[key] = value.replace(/^['"]|['"]$/gu, '');
  }
  return { data, body: raw.slice(match[0].length) };
}

// --- MDX -> Markdown ---------------------------------------------------------

const HTML_ENTITIES = [
  // `&#124;` (pipe) MUST become an escaped pipe — a bare `|` would break the
  // surrounding Markdown table. `\|` renders as `|` everywhere (CommonMark).
  [/&#124;/gu, '\\|'],
  [/&lt;/gu, '<'],
  [/&gt;/gu, '>'],
  [/&quot;/gu, '"'],
  [/&#123;/gu, '{'],
  [/&#125;/gu, '}'],
  [/&amp;/gu, '&'],
];

function decodeEntities(text) {
  return HTML_ENTITIES.reduce((acc, [pattern, replacement]) => acc.replace(pattern, replacement), text);
}

// Flatten the inline JSX/HTML used in the API tables down to plain Markdown.
function flattenInline(text) {
  let out = text;
  // Strip anchors first (they wrap type-definition cross links).
  out = out.replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gu, '$1');
  // Unwrap <span> (used for type-definition anchor ids) until none remain.
  let prev;
  do {
    prev = out;
    out = out.replace(/<span\b[^>]*>([\s\S]*?)<\/span>/gu, '$1');
  } while (out !== prev);
  // <ApiBadge label="X" /> (or with children) -> X
  out = out.replace(/<ApiBadge\b[^>]*\blabel=(["'])([\s\S]*?)\1[^>]*\/?>(?:<\/ApiBadge>)?/gu, '$2');
  // <code>X</code> -> `X`
  out = out.replace(/<code>([\s\S]*?)<\/code>/gu, (_, inner) => '`' + inner + '`');
  // <kbd>X</kbd> -> X ; <br> -> space
  out = out.replace(/<\/?kbd>/gu, '');
  out = out.replace(/<br\s*\/?>/gu, ' ');
  return out;
}

// Normalize a String.raw demo body into a clean snippet for a fenced block.
function normalizeDemo(code) {
  return code.replace(/^\n+/u, '').replace(/\s+$/u, '');
}

function mdxToMarkdown(rawBody) {
  let body = rawBody;

  // Fenced code blocks (authored prose snippets AND the demos we inline below)
  // must survive verbatim — import-stripping and entity-decoding would corrupt
  // them. Stash every fence behind a placeholder and restore at the end.
  const fences = [];
  const protect = block => {
    fences.push(block);
    return '%%FENCE' + (fences.length - 1) + '%%';
  };

  // 0. Protect the authored fenced blocks BEFORE any stripping runs — e.g. the
  //    `import { Button } from '@takeoff-ui/react-spar'` snippet in "Usage".
  body = body.replace(/```[\s\S]*?```/gu, protect);

  // 1. Capture every `export const X = String.raw`...`` (demos AND css), then
  //    remove the declarations from the body.
  const rawExports = new Map();
  body = body.replace(/export\s+const\s+(\w+)\s*=\s*String\.raw`([\s\S]*?)`;?/gu, (_, name, code) => {
    rawExports.set(name, code);
    return '';
  });

  // 2. Drop JSX comments ({/* ... */}), including the api-tables + prettier
  //    markers.
  body = body.replace(/\{\/\*[\s\S]*?\*\/\}/gu, '');

  // 3. Drop imports and the remaining object exports (scope maps). Every
  //    `export const` is either a String.raw (handled above) or an object, so
  //    no broad leftover sweep is needed.
  body = body.replace(/^import\b[\s\S]*?;[ \t]*$/gmu, '');
  body = body.replace(/^export\s+const\s+\w+\s*=\s*\{[\s\S]*?\};?[ \t]*$/gmu, '');
  body = body.replace(/^export\s+default\b[\s\S]*?;[ \t]*$/gmu, '');

  // 4. Replace <LiveCode code={ident} cssCode={ident} ... /> with the inlined
  //    demo (and optional css) as fenced code blocks, protected immediately so
  //    step 5 leaves the JSX inside them untouched.
  body = body.replace(/<LiveCode\b[\s\S]*?\/>/gu, tag => {
    const codeName = tag.match(/\bcode=\{(\w+)\}/u)?.[1];
    const cssName = tag.match(/\bcssCode=\{(\w+)\}/u)?.[1];
    const blocks = [];
    if (codeName && rawExports.has(codeName)) {
      blocks.push(protect('```tsx\n' + normalizeDemo(rawExports.get(codeName)) + '\n```'));
    } else if (codeName) {
      blocks.push('> _Interactive demo — see the online docs._');
    }
    if (cssName && rawExports.has(cssName)) {
      blocks.push(protect('```css\n' + normalizeDemo(rawExports.get(cssName)) + '\n```'));
    }
    return blocks.join('\n\n');
  });

  // 5. Flatten the table JSX + decode entities on everything that is NOT a
  //    fenced code block.
  body = decodeEntities(flattenInline(body));

  // 6. Restore fences and tidy whitespace.
  body = body.replace(/%%FENCE(\d+)%%/gu, (_, i) => fences[Number(i)]);
  return body.replace(/\n{3,}/gu, '\n\n').trim() + '\n';
}

// --- routing -----------------------------------------------------------------

function permalinkFor(slug) {
  if (slug === '/' || slug === '') return `${ROUTE_BASE}/`;
  return ROUTE_BASE + (slug.startsWith('/') ? slug : `/${slug}`);
}

// Maps a permalink to the served `.md` path. Both this and the docs footer
// button MUST agree on this mapping. A trailing-slash route (the docs landing
// page) maps to `index.md` so the URL stays clean.
function mdPathFor(permalink) {
  return permalink.endsWith('/') ? `${permalink}index.md` : `${permalink}.md`;
}

function sectionFor(relPath) {
  return SECTIONS.find(s => s.match(relPath))?.title ?? 'Guides';
}

// --- discovery ---------------------------------------------------------------

function listDocs(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listDocs(full));
    } else if (/\.mdx?$/u.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

// --- main --------------------------------------------------------------------

function main() {
  const siteUrl = readSiteUrl();
  const files = listDocs(DOCS_DIR).sort();
  const pages = [];

  for (const file of files) {
    const relPath = relative(DOCS_DIR, file).split('\\').join('/');
    const raw = readFileSync(file, 'utf8');
    const { data, body } = parseFrontmatter(raw);
    if (!data.slug) {
      console.warn(`gen:llms — skipping ${relPath} (no slug frontmatter)`);
      continue;
    }

    const permalink = permalinkFor(data.slug);
    const mdPath = mdPathFor(permalink);
    const markdown = mdxToMarkdown(body);

    pages.push({
      relPath,
      title: data.title ?? relPath,
      description: data.description ?? '',
      section: sectionFor(relPath),
      position: Number.parseInt(data.sidebar_position ?? '999', 10),
      permalink,
      mdPath,
      mdUrl: siteUrl + mdPath,
      markdown,
    });

    const outFile = join(STATIC_DIR, mdPath);
    mkdirSync(dirname(outFile), { recursive: true });
    writeFileSync(outFile, markdown);
  }

  // llms.txt — grouped, ordered index.
  const order = new Map(SECTIONS.map((s, i) => [s.title, i]));
  const llmsLines = [
    '# Takeoff Spar',
    '',
    '> React-first wrapper layer (`@takeoff-ui/react-spar`) over the Spar headless primitives, styled with Takeoff design tokens.',
    '',
    'Each link below is a clean Markdown version of a docs page, written for LLMs. Download one page for focused context, or use llms-full.txt for the entire library in a single file. Import components from `@takeoff-ui/react-spar`.',
    '',
  ];
  const sectionsSeen = [...new Set(pages.map(p => p.section))].sort((a, b) => (order.get(a) ?? 99) - (order.get(b) ?? 99));
  for (const section of sectionsSeen) {
    llmsLines.push(`## ${section}`, '');
    const inSection = pages.filter(p => p.section === section).sort((a, b) => a.position - b.position || a.title.localeCompare(b.title));
    for (const p of inSection) {
      const blurb = p.description ? `: ${p.description}` : '';
      llmsLines.push(`- [${p.title}](${p.mdUrl})${blurb}`);
    }
    llmsLines.push('');
  }
  writeFileSync(join(STATIC_DIR, 'llms.txt'), `${llmsLines.join('\n').trim()}\n`);

  // llms-full.txt — the whole corpus.
  const fullParts = [
    '# Takeoff Spar — Full Documentation',
    '',
    '> Complete docs corpus for `@takeoff-ui/react-spar`, generated for LLMs. Import all components from `@takeoff-ui/react-spar`.',
    '',
  ];
  const fullOrdered = [...pages].sort((a, b) => (order.get(a.section) ?? 99) - (order.get(b.section) ?? 99) || a.position - b.position || a.title.localeCompare(b.title));
  for (const p of fullOrdered) {
    fullParts.push('---', '', `<!-- Source: ${p.mdUrl} -->`, '', p.markdown.trim(), '');
  }
  writeFileSync(join(STATIC_DIR, 'llms-full.txt'), `${fullParts.join('\n').trim()}\n`);

  console.log(`gen:llms — wrote ${pages.length} page(s) to static/docs, plus llms.txt and llms-full.txt`);
}

main();
