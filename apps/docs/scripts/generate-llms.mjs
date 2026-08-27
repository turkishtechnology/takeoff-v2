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

import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const DOCS_APP_DIR = resolve(SCRIPT_DIR, '..');
const DOCS_DIR = join(DOCS_APP_DIR, 'docs');
const ICONS_DIR = join(DOCS_APP_DIR, 'icons');
const STATIC_DIR = join(DOCS_APP_DIR, 'static');
const CONFIG_FILE = join(DOCS_APP_DIR, 'docusaurus.config.ts');
const SKILLS_DIR = resolve(DOCS_APP_DIR, '../../.agents/skills');

// Docs live under this route base (classic preset default). Keep in sync with
// the docs plugin if `routeBasePath` is ever set explicitly.
const ROUTE_BASE = '/docs';

/**
 * Every docs tree the site serves, each with the route base its plugin instance
 * is mounted at. Both are mirrored to `static/`, so the "Copy page" action
 * resolves on every docs route rather than 404-ing outside `/docs`. `section`
 * overrides the prefix-matched grouping for trees that are one section.
 */
const DOC_TREES = [
  { dir: DOCS_DIR, routeBase: ROUTE_BASE, staticSubdir: 'docs' },
  { dir: ICONS_DIR, routeBase: '/icons', staticSubdir: 'icons', section: 'Icons' },
];

/**
 * Pages whose rendered content comes from a React component rather than MDX
 * prose, mapped to the generated Markdown that stands in for it. Without this
 * the mirror is just the frontmatter, so "Copy page" on the gallery would hand
 * an assistant a description instead of the icon set. `gen:icons` writes these
 * (it owns the data) and runs before `gen:llms` in predev/prebuild.
 */
const GENERATED_BODY = new Map([['/icons/gallery', join(STATIC_DIR, 'icons-inventory.md')]]);

// Section grouping for llms.txt, in display order. First matching prefix wins;
// anything unmatched falls through to "Guides".
const SECTIONS = [
  { title: 'Getting Started', match: p => p === 'intro.md' || p === 'installation.mdx' || p === 'ai-assistants.mdx' },
  { title: 'Foundations', match: p => p.startsWith('foundations/') },
  { title: 'Components', match: p => p.startsWith('components/') },
  { title: 'Forms', match: p => p.startsWith('forms/') },
  { title: 'Icons', match: () => false },
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

  // 5. Unwrap <Tabs>/<TabItem> containers. Tabs are a reading affordance for
  //    the site; in a flat Markdown file every branch is simply present, so
  //    keep the content and turn each tab's label into a heading that says
  //    which branch it belongs to.
  body = body.replace(/<TabItem\b[^>]*\blabel=(["'])([\s\S]*?)\1[^>]*>/gu, (_, __, label) => `\n### ${label}\n`);
  body = body.replace(/<\/TabItem>/gu, '');
  body = body.replace(/<Tabs\b[^>]*>/gu, '');
  body = body.replace(/<\/Tabs>/gu, '');

  // 6. Flatten the table JSX + decode entities on everything that is NOT a
  //    fenced code block.
  body = decodeEntities(flattenInline(body));

  // 7. Restore fences and tidy whitespace.
  body = body.replace(/%%FENCE(\d+)%%/gu, (_, i) => fences[Number(i)]);
  return body.replace(/\n{3,}/gu, '\n\n').trim() + '\n';
}

// --- agent skills ------------------------------------------------------------

/**
 * The per-component skills in `.agents/skills/takeoff-<name>/SKILL.md` carry
 * selection guidance the MDX pages deliberately don't: when to reach for a
 * component (and when NOT to), plus the natural-language phrasings that should
 * trigger it. That is exactly what an LLM needs and cannot infer from an API
 * table, so we fold it into the generated Markdown.
 *
 * Only the two blocks below are lifted. Everything else in a skill (examples,
 * prop tables) already exists in the docs page in a richer form, and the two
 * repo-workflow skills are excluded entirely — they hard-require files that
 * only exist inside this monorepo.
 */
function readSkill(componentSlug) {
  const file = join(SKILLS_DIR, `takeoff-${componentSlug}`, 'SKILL.md');
  let raw;
  try {
    raw = readFileSync(file, 'utf8');
  } catch {
    return null; // No skill for this page (foundations, guides, …).
  }

  const { body } = parseFrontmatter(raw);

  // "When to use" is a bolded lead-in paragraph, not a heading. Capture until
  // the blank line that ends the paragraph. Five skills use a "Quick start"
  // layout with no such block — those simply contribute nothing here.
  const whenToUse = body
    .match(/^\*\*When to use:\*\*\s*([\s\S]*?)(?=\n\s*\n)/mu)?.[1]
    ?.replace(/\s+/gu, ' ')
    .trim();

  // The Accessibility section is a bullet list under a `## Accessibility`
  // heading; keep it verbatim up to the next heading. Anchoring the heading
  // needs the `m` flag, but the end-of-input alternative must NOT use `$` under
  // it — `$` would match at the first line ending and the lazy quantifier would
  // stop there, capturing only the first bullet. Split the two concerns: `m`
  // for the start anchor, an explicit end-of-input lookahead for the stop.
  const accessibilityStart = body.match(/^## Accessibility[ \t]*\n/mu);
  const accessibility = accessibilityStart
    ? body
        .slice(accessibilityStart.index + accessibilityStart[0].length)
        .split(/\n## /u)[0]
        .trim()
    : undefined;

  return { whenToUse, accessibility };
}

/**
 * Appends the skill blocks to a component page's Markdown. Returns the page
 * unchanged when there is no skill or nothing worth adding, so pages without a
 * matching skill are never padded with empty headings.
 */
function withSkillGuidance(markdown, componentSlug) {
  const skill = readSkill(componentSlug);
  if (!skill) return { markdown, applied: false };

  // Only append a section the page doesn't already author — 20 component pages
  // write their own `## Accessibility`, and appending the skill's copy on top
  // would leave the reader (and the model) with two of the same heading.
  const hasHeading = heading => new RegExp(`^## ${heading}\\b`, 'mu').test(markdown);

  const blocks = [];
  if (skill.whenToUse && !hasHeading('When to use')) {
    blocks.push('## When to use', '', skill.whenToUse, '');
  }
  if (skill.accessibility && !hasHeading('Accessibility')) {
    blocks.push('## Accessibility', '', skill.accessibility, '');
  }
  if (blocks.length === 0) return { markdown, applied: false };

  return { markdown: `${markdown.trim()}\n\n${blocks.join('\n').trim()}\n`, applied: true };
}

// --- routing -----------------------------------------------------------------

function permalinkFor(slug, routeBase = ROUTE_BASE) {
  if (slug === '/' || slug === '') return `${routeBase}/`;
  return routeBase + (slug.startsWith('/') ? slug : `/${slug}`);
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
  const pages = [];
  let skillsApplied = 0;
  const missingSkillGuidance = [];

  // Remove outputs for pages that no longer exist. Without this cleanup, a
  // persistent build workspace can keep serving deleted pages indefinitely.
  for (const tree of DOC_TREES) {
    rmSync(join(STATIC_DIR, tree.staticSubdir), { recursive: true, force: true });
  }

  for (const tree of DOC_TREES) {
    for (const file of listDocs(tree.dir).sort()) {
      const relPath = relative(tree.dir, file).split('\\').join('/');
      const raw = readFileSync(file, 'utf8');
      const { data, body } = parseFrontmatter(raw);

      // Docusaurus falls back to the file path when a page declares no slug, so
      // mirror that rather than skipping the page and leaving its route without
      // a `.md` for the "Copy page" action to fetch.
      const slug = data.slug ?? `/${relPath.replace(/\.mdx?$/u, '').replace(/\/index$/u, '')}`;

      const permalink = permalinkFor(slug, tree.routeBase);
      const mdPath = mdPathFor(permalink);
      let markdown = mdxToMarkdown(body);

      // A page whose body is nothing but a component invocation — the icon
      // gallery renders entirely from React — reduces to an empty mirror. Fall
      // back to the frontmatter so the served `.md` still states what the page
      // is instead of shipping a bare `<IconGallery />`.
      if (!markdown.replace(/<[^>]*>/gu, '').trim()) {
        markdown = `${[`# ${data.title ?? relPath}`, '', data.description ?? ''].join('\n').trim()}\n`;
      }

      // Fold in the component-rendered content for pages that have one. Missing
      // is not fatal: a `gen:llms` run without a preceding `gen:icons` still
      // produces a valid (if thinner) mirror.
      const generatedBody = GENERATED_BODY.get(permalink);
      if (generatedBody) {
        try {
          markdown = `${markdown.trimEnd()}\n\n${readFileSync(generatedBody, 'utf8').trim()}\n`;
        } catch {
          console.warn(`gen:llms — no generated body at ${relative(DOCS_APP_DIR, generatedBody)} for ${permalink}; run gen:icons first`);
        }
      }

      // Fold in the agent-skill guidance for component pages. `components/index`
      // is the section landing page, not a component — it has no skill by design,
      // so exclude it rather than reporting it as missing on every run.
      const componentSlug = relPath.startsWith('components/') && !/^components\/index\.mdx?$/u.test(relPath) ? relPath.replace(/^components\//u, '').replace(/\.mdx?$/u, '') : null;
      if (componentSlug) {
        const enriched = withSkillGuidance(markdown, componentSlug);
        markdown = enriched.markdown;
        if (enriched.applied) skillsApplied++;
        else missingSkillGuidance.push(componentSlug);
      }

      pages.push({
        relPath,
        title: data.title ?? relPath,
        description: data.description ?? '',
        section: tree.section ?? sectionFor(relPath),
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

  console.log(`gen:llms — wrote ${pages.length} page(s) to ${DOC_TREES.map(t => `static/${t.staticSubdir}`).join(' + ')}, plus llms.txt and llms-full.txt`);
  console.log(`gen:llms — folded agent-skill guidance into ${skillsApplied} component page(s)`);
  // Surfaced rather than silently skipped: a component page with no skill
  // guidance means the skill is missing the block, not that none was wanted.
  if (missingSkillGuidance.length > 0) {
    console.warn(`gen:llms — no skill guidance for: ${missingSkillGuidance.join(', ')}`);
  }
}

main();
