---
name: generate-api-alignment
description:
  Create or refresh a component API alignment worksheet under `tools/` by
  copying the shared `tools/api-alignment.template.html` scaffold and filling it
  from local `takeoff-ui`, `spar`, and optional current `react-spar` sources.
  Use when a component needs a parity worksheet, including scratch ports where
  the `react-spar` column should stay blank for manual decisions.
argument-hint: '[component] [mode]'
---

# Generate API alignment worksheet

Create exactly one HTML worksheet under `tools/`. Do not edit the shared
template unless the user asked to change the template itself.

## 1. Decide the worksheet mode

Use one of these modes before collecting data:

- `existing-surface` Use when the component already exists in `takeoff-ui`,
  `spar`, and the current `react-spar` tree. Fill all three columns from source.
- `blank-react-spar` Use when the component will be built from scratch in
  `react-spar`. Fill `takeoff-ui` and `spar` from source, but leave every
  `reactSpar` entry as `null` so the worksheet opens with empty decision cells.

If the user does not say otherwise and the component is not implemented in the
current `react-spar` source, default to `blank-react-spar`.

## 2. Canonical inputs

Read these before shaping the worksheet:

- `docs/contract-model.md`
- `docs/api-decision-framework.md`
- `AGENTS.md`

Then gather facts only from local source code:

- `../takeoff-ui`
- `../spar`
- current repo source
- git history in the current repo only when the user explicitly wants the old
  `react-spar` shape included

Never invent a prop, slot, default, or event.

## 3. Copy the template

Copy `tools/api-alignment.template.html` into a concrete worksheet file:

- Default output: `tools/<component-kebab>-api-alignment.html`
- If the user is actively iterating on the repo's main worksheet, reuse
  `tools/api-alignment.html`

Replace every placeholder token:

- `__ALIGNMENT_TITLE__`
- `__ALIGNMENT_SUBTITLE__`
- `__ALIGNMENT_STORAGE_KEY__`
- `__ALIGNMENT_EXPORT_TITLE__`
- `__ALIGNMENT_EXPORT_NOTE__`
- `__ALIGNMENT_DATA__`

Keep the generated file in `tools/` so the relative `./api-alignment.css` and
`./api-alignment.runtime.js` references keep working.

## 4. Build the `data.parts` payload

Author `window.API_ALIGNMENT_CONFIG.data` as:

```js
{
  parts: [
    {
      id: 'root',
      label: 'Component (root)',
      description: '...',
      props: [
        {
          id: 'conceptId',
          concept: 'Human-readable concept',
          takeoffUi: { name, type, default, note } | null,
          spar: { name, type, default, note } | null,
          reactSpar: { name, type, default, note } | null,
          note: 'Optional cross-layer fact',
        },
      ],
    },
  ],
}
```

Rules:

- Use conceptual rows, not implementation trivia.
- Group rows by actual anatomy when the component exists in all three layers.
- For scratch ports, prefer neutral groups like `Root`, `Content Mapping`,
  `Events`, `Structure`, instead of pre-deciding future `react-spar` part names.
- Use `null` for a missing layer entry.
- In `blank-react-spar` mode, every `reactSpar` value must stay `null`.
- Notes must be source-backed and descriptive, never speculative.
- In `blank-react-spar` mode, do not smuggle react-spar decisions into notes.
  Facts like "takeoff-ui uses a flat `label` prop" are fine; "this should become
  `Button.Label`" is not.

## 5. Keep the worksheet generic

The shared system consists of:

- `tools/api-alignment.css`
- `tools/api-alignment.runtime.js`
- `tools/api-alignment.template.html`

When the user asks for a better worksheet UX, update the shared files first and
only then refresh the component-specific output.

## 6. Validate

Run both checks:

```bash
rg '__ALIGNMENT_' tools/<file>.html
node -e "const fs=require('fs'); global.window={}; const html=fs.readFileSync('tools/<file>.html','utf8'); const scripts=[...html.matchAll(/<script>([\\s\\S]*?)<\\/script>/g)].map((m)=>m[1]); scripts.forEach((code)=>new Function(code)()); console.log('html-config-ok')"
node -e "const fs=require('fs'); new Function(fs.readFileSync('tools/api-alignment.runtime.js','utf8')); console.log('runtime-ok')"
```

The placeholder grep must return nothing.

## 7. Report

Return one concise summary:

- generated file path
- worksheet mode
- shared template/runtime files touched, if any
- whether validation passed

Do not commit or push unless the user explicitly asks.
