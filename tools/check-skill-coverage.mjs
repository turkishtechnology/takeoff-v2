#!/usr/bin/env node

/* eslint-disable no-console */

/**
 * Guard: the per-component usage skills must stay in sync with the components
 * the package actually ships, and the `takeoff-ui` component map must route to
 * every one of them.
 *
 * Three drift modes are caught:
 *   1. A component in `packages/react-spar/src/components/` has no
 *      `.agents/skills/takeoff-<name>/` skill.
 *   2. A `takeoff-<name>` skill exists with no matching shipped component
 *      (component renamed or removed, skill left behind).
 *   3. A skill exists but is absent from the "Component map" section of
 *      `.agents/skills/takeoff-ui/SKILL.md` — so the entry-point skill cannot
 *      route to it and the guidance is silently unreachable.
 *
 * Also fails when a skill directory is missing its `SKILL.md`.
 *
 * Run via: pnpm lint:skills
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const componentsDir = resolve(repoRoot, 'packages/react-spar/src/components');
const skillsDir = resolve(repoRoot, '.agents/skills');
const routerSkill = resolve(skillsDir, 'takeoff-ui/SKILL.md');

/** Skills under `takeoff-*` that are not per-component usage skills. */
const NON_COMPONENT_SKILLS = new Set(['takeoff-ui', 'takeoff-component-workflow']);

const errors = [];

function dirNames(dir) {
  return readdirSync(dir)
    .filter(entry => statSync(resolve(dir, entry)).isDirectory())
    .sort();
}

// Shipped components: every directory under src/components (index.ts is a file).
const components = dirNames(componentsDir);

// Per-component skills: `takeoff-<name>`, minus the known non-component ones.
const skills = dirNames(skillsDir).filter(name => name.startsWith('takeoff-') && !NON_COMPONENT_SKILLS.has(name));
const skillComponents = skills.map(name => name.slice('takeoff-'.length));

// 1 + 2. Coverage in both directions.
for (const component of components) {
  if (!skillComponents.includes(component)) {
    errors.push(`component '${component}' ships from packages/react-spar but has no .agents/skills/takeoff-${component}/ skill`);
  }
}
for (const component of skillComponents) {
  if (!components.includes(component)) {
    errors.push(`skill 'takeoff-${component}' has no matching component in packages/react-spar/src/components/`);
  }
}

// Every skill directory must actually carry a SKILL.md.
for (const name of [...skills, ...NON_COMPONENT_SKILLS].sort()) {
  const skillFile = resolve(skillsDir, name, 'SKILL.md');
  if (!existsSync(skillFile)) {
    errors.push(`skill '${name}' is missing SKILL.md`);
  }
}

// 3. The router skill's component map must mention every per-component skill.
if (!existsSync(routerSkill)) {
  errors.push('.agents/skills/takeoff-ui/SKILL.md is missing — the component map cannot be verified');
} else {
  const src = readFileSync(routerSkill, 'utf8');
  const mapStart = src.indexOf('## Component map');
  if (mapStart === -1) {
    errors.push('takeoff-ui/SKILL.md has no "## Component map" section');
  } else {
    // The map runs until the next top-level heading.
    const rest = src.slice(mapStart + 1);
    const nextHeading = rest.indexOf('\n## ');
    const map = nextHeading === -1 ? rest : rest.slice(0, nextHeading);
    for (const component of skillComponents) {
      // Match the skill name without matching a longer sibling (e.g. `takeoff-table` vs `takeoff-tabs`).
      const mentioned = new RegExp(`takeoff-${component}(?![a-z-])`).test(map);
      if (!mentioned) {
        errors.push(`takeoff-${component} is missing from the "Component map" section of takeoff-ui/SKILL.md`);
      }
    }
  }
}

if (errors.length) {
  console.error('Skill coverage check failed:');
  for (const error of errors) console.error(`  - ${error}`);
  console.error(`\n${errors.length} problem(s). Every shipped component needs a takeoff-<name> skill listed in the takeoff-ui component map.`);
  process.exit(1);
}

console.log(`Skill coverage OK — ${components.length} components, ${skills.length} per-component skills, all routed from the takeoff-ui component map.`);
