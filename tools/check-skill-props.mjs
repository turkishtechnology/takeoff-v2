#!/usr/bin/env node

/* eslint-disable no-console */

/**
 * Guard: when a component gains a prop, its `takeoff-<name>` skill has to
 * mention it.
 *
 * `gen:api:check` already keeps the *docs* API tables honest, but nothing
 * watched the skills — they are hand-written prose, and a prop added to
 * `types.ts` would silently leave every skill (and therefore `llms.txt`,
 * `AGENTS.md`, and the Copilot instructions) describing a stale API.
 *
 * ## Why this is a baseline check, not an exhaustive one
 *
 * The skills deliberately document the props people reach for, not every prop
 * the type exposes. Spar passes through a long tail of advanced escape hatches
 * (`onPointerDownOutside`, `onEscapeKeyDown`, `autoFocus`, `container`, …) that
 * the skills omit on purpose. Failing on those would make the guard noise, and
 * a guard everyone silences is worse than no guard.
 *
 * So the accepted omissions are frozen in BASELINE below. The guard fails only
 * when a prop appears that is in neither the skill nor the baseline — i.e. one
 * that was added after this file was written. Documenting a baseline prop and
 * removing it from the list is always safe; the guard re-checks that the entry
 * is still needed and tells you when one goes stale.
 *
 * Run via: pnpm lint:skill-props
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const skillsDir = join(repoRoot, '.agents/skills');
const componentsDir = join(repoRoot, 'packages/react-spar/src/components');

const NON_COMPONENT_SKILLS = new Set(['takeoff-ui', 'takeoff-component-workflow']);

/**
 * Props every component inherits from the polymorphic/HTML surface. They are
 * either universal (`className`, `ref`) or covered by the shared customization
 * section in the `takeoff-ui` skill rather than repeated 28 times.
 */
const UNIVERSAL_PROPS = new Set(['ref', 'key', 'className', 'classNames', 'slotProps', 'children', 'as', 'style', 'id']);

/**
 * Advanced props the skills intentionally leave out, recorded per component so
 * a new omission can't hide inside a broad pattern. Shrinking this list is an
 * improvement; growing it should be a deliberate decision in review.
 */
const BASELINE = {
  accordion: ['onBeforeMatch', 'startContent'],
  breadcrumb: ['rel', 'target'],
  checkbox: ['autoFocus', 'form'],
  dialog: ['container', 'finalFocus', 'forceMount', 'initialFocus', 'onCloseAutoFocus', 'onEscapeKeyDown', 'onInteractOutside', 'onOpenAutoFocus', 'onPointerDownOutside'],
  drawer: ['container', 'onCloseAutoFocus', 'onEscapeKeyDown', 'onInteractOutside', 'onOpenAutoFocus', 'onPointerDownOutside'],
  dropdown: ['align', 'disabled', 'onEscapeKeyDown', 'onFocusOutside', 'onPointerDownOutside', 'side'],
  input: ['autoFocus'],
  popover: ['onCloseAutoFocus', 'onEscapeKeyDown', 'onFocusOutside', 'onInteractOutside', 'onOpenAutoFocus', 'onPointerDownOutside'],
  radio: ['name', 'readOnly'],
  select: ['autoFocus', 'container', 'name', 'onCloseAutoFocus', 'onEscapeKeyDown', 'onPointerDownOutside'],
  switch: ['autoFocus', 'form'],
  tabs: ['autoFocus'],
  toast: ['toast'],
  tooltip: ['disableHoverableContent', 'onCloseAutoFocus', 'onEscapeKeyDown', 'onOpenAutoFocus', 'onPointerDownOutside'],
};

/**
 * Only `*Props` declarations describe the component's public prop surface.
 * Render-prop payloads, contexts, column defs, and toast options all live in
 * the same file and would otherwise be read as props they are not.
 */
const NON_PROP_SUFFIX = /(RenderProps|RenderState|Context|State|Detail|Config|Def|Meta|Option|Options|Data|Request|Accessor|Filter|Controller|Handler)$/u;

function sourceProps(component) {
  const file = join(componentsDir, component, 'types.ts');
  if (!existsSync(file)) return null;
  const src = readFileSync(file, 'utf8');

  // Slice the file into top-level declaration blocks so each prop is attributed
  // to the type that declares it.
  const declarations = [...src.matchAll(/^export (?:interface|type)\s+(\w+)\b/gmu)].map(m => ({ name: m[1], start: m.index }));

  const props = new Set();
  declarations.forEach((decl, i) => {
    if (!decl.name.endsWith('Props') || NON_PROP_SUFFIX.test(decl.name)) return;
    const body = src.slice(decl.start, declarations[i + 1]?.start ?? src.length);
    for (const m of body.matchAll(/^ {2}(\w+)\??\s*:/gmu)) props.add(m[1]);
    // Props inherited from Spar arrive as `Pick<SparFooProps, 'a' | 'b'>`.
    for (const pick of body.matchAll(/Pick<[^,]+,\s*([^>]+)>/gu)) {
      for (const name of pick[1].matchAll(/'(\w+)'/gu)) props.add(name[1]);
    }
  });
  return props;
}

/** A prop counts as documented if the skill names it in prose or in a table. */
function skillMentions(skillText, prop) {
  if (skillText.includes(`\`${prop}\``)) return true;
  // Built by concatenation: a backtick can't be escaped inside String.raw.
  return new RegExp('^\\|\\s*`?' + prop + '`?\\s*\\|', 'mu').test(skillText);
}

const errors = [];
const staleBaseline = [];
let checked = 0;

const componentSkills = readdirSync(skillsDir, { withFileTypes: true })
  .filter(e => e.isDirectory() && e.name.startsWith('takeoff-') && !NON_COMPONENT_SKILLS.has(e.name))
  .map(e => e.name.slice('takeoff-'.length))
  .sort();

for (const component of componentSkills) {
  const props = sourceProps(component);
  if (props === null) continue; // No types.ts — nothing to compare against.
  checked++;

  const skillText = readFileSync(join(skillsDir, `takeoff-${component}`, 'SKILL.md'), 'utf8');
  const allowed = new Set(BASELINE[component] ?? []);

  for (const prop of [...props].sort()) {
    if (UNIVERSAL_PROPS.has(prop)) continue;
    if (skillMentions(skillText, prop)) {
      // Documented since the baseline was taken — the entry can go.
      if (allowed.has(prop)) staleBaseline.push(`${component}: ${prop}`);
      continue;
    }
    if (allowed.has(prop)) continue;
    errors.push(`takeoff-${component} does not document \`${prop}\` (declared in packages/react-spar/src/components/${component}/types.ts)`);
  }
}

if (staleBaseline.length > 0) {
  console.warn('Baseline entries that are now documented — remove them from BASELINE in this file:');
  for (const entry of staleBaseline) console.warn(`  - ${entry}`);
  console.warn('');
}

if (errors.length > 0) {
  console.error('Skill prop check failed:');
  for (const error of errors) console.error(`  - ${error}`);
  console.error(
    `\n${errors.length} undocumented prop(s). Add each one to the skill's props table, ` +
      `then run \`pnpm gen:agent-instructions\`. If a prop is a deliberate omission, ` +
      `add it to BASELINE in tools/check-skill-props.mjs with a reason in review.`,
  );
  process.exit(1);
}

console.log(`Skill props OK — ${checked} component skill(s) document every prop outside the recorded baseline.`);
