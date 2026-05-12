# Recipe output contract

The recipe must be useful as both a human-readable review document and as input
to the implementation prompt.

## Required Markdown sections

Use this exact high-level structure:

```markdown
# {{Component}} component recipe

## 1. Inputs

## 2. Repo cut-off

## 3. Discovery summary

## 4. Evidence & self-check gates

## 5. Source contract matrix

## 6. Public React API proposal

## 7. Compound structure

## 8. DOM / class / data-state contract

## 9. Spar compatibility

## 10. takeoff-design alignment

## 11. takeoff-spar implementation plan

## 12. Tests and docs plan

## 13. Validation plan

## 14. Decision Needed

## 15. Handoff prompt

## 16. Remaining risks
```

Use `Unknown` for missing evidence and `Not found` when a searched file/path
does not exist.

## Required JSON shape

The HTML template and scripts expect a JSON object with these top-level keys.
Extra keys are allowed.

```json
{
  "component": "accordion",
  "componentPascal": "Accordion",
  "sparPrimitive": "accordion",
  "generatedAt": "2026-05-07T00:00:00Z",
  "repoRoot": "/Users/U_TURAN4/Desktop/http",
  "summary": "One paragraph summary.",
  "repos": [
    {
      "name": "takeoff-ui",
      "path": "...",
      "branch": "...",
      "commit": "...",
      "dirty": "clean",
      "dirtyFiles": [],
      "notes": []
    }
  ],
  "localEvidence": {
    "required": true,
    "complete": true,
    "repoRoot": "/Users/U_TURAN4/Desktop/http",
    "note": "Collected from local repos or equivalent user-provided excerpts."
  },
  "sources": {
    "takeoffUi": { "requiredPaths": [], "files": [], "findings": [] },
    "spar": { "requiredPaths": [], "files": [], "findings": [] },
    "takeoffDesign": { "requiredPaths": [], "files": [], "findings": [] },
    "takeoffSpar": { "requiredPaths": [], "files": [], "findings": [] }
  },
  "evidenceLedger": [
    {
      "id": "E001",
      "claim": "Root must emit tk-accordion class.",
      "repo": "takeoff-design",
      "path": "packages/tokens/styles/recipes/_accordion.scss",
      "lines": "12-31 or Unknown",
      "evidence": "Short excerpt or summary.",
      "status": "Direct evidence",
      "confidence": "High",
      "decisionId": null
    }
  ],
  "selfChecks": [
    {
      "id": "R-Q01",
      "question": "Did I inspect local takeoff-ui core files?",
      "status": "pass",
      "answer": "Yes; files listed in sources.takeoffUi.files.",
      "evidence": "E001",
      "followUp": "None"
    }
  ],
  "contradictions": [],
  "assumptions": [],
  "api": [
    {
      "name": "value",
      "type": "string",
      "default": "undefined",
      "source": "takeoff-ui:tk-accordion.tsx",
      "status": "proposed",
      "notes": "Mapped to spar controlled value."
    }
  ],
  "events": [
    {
      "webComponent": "tk-accordion-change",
      "react": "onAccordionChange",
      "payload": "...",
      "source": "takeoff-ui",
      "status": "proposed",
      "notes": "..."
    }
  ],
  "compound": {
    "root": "Accordion",
    "parts": [
      {
        "name": "Accordion.Item",
        "element": "div",
        "displayName": "Accordion.Item",
        "public": true,
        "source": "slot:item"
      }
    ],
    "internalOnly": [{ "name": "Indicator", "reason": "visual-only" }],
    "tree": "Accordion > Accordion.Item > Accordion.Trigger + Accordion.Content"
  },
  "domContract": [
    {
      "level": "root",
      "class": "tk-accordion",
      "dataAttr": "data-orientation",
      "values": ["horizontal", "vertical"],
      "source": "takeoff-design:_accordion.scss",
      "required": true,
      "status": "planned",
      "notes": "..."
    }
  ],
  "sparCompatibility": [
    {
      "capability": "controlled/uncontrolled value",
      "spar": "Supported by value/defaultValue/onValueChange",
      "wrapper": "Map to takeoff-ui-compatible names",
      "status": "Wrapper mapping",
      "resolution": "No duplicate state in wrapper."
    }
  ],
  "implementationPlan": [
    {
      "area": "types",
      "action": "Export AccordionProps and item part props.",
      "files": []
    }
  ],
  "tests": [
    {
      "name": "DOM contract",
      "coverage": "canonical classes and data attrs",
      "status": "planned"
    }
  ],
  "docs": [{ "name": "Default demo", "status": "planned" }],
  "validation": [
    {
      "command": "pnpm exec vitest run accordion",
      "required": true,
      "notes": "component-focused"
    }
  ],
  "decisions": [
    {
      "id": "D001",
      "title": "...",
      "status": "needed",
      "blocking": true,
      "question": "...",
      "evidence": ["..."],
      "impact": "...",
      "options": ["...", "..."],
      "recommendation": "...",
      "decision": "",
      "followUp": ["..."]
    }
  ],
  "risks": [{ "risk": "...", "mitigation": "...", "status": "open" }]
}
```

## Optional rich content blocks for the HTML template

The HTML recipe template has a generic `contentBlocks` renderer. Use it whenever
the recipe needs more than a plain paragraph: code snippets, diffs, tables,
checklists, callouts, file trees, key/value facts, cards, collapsible details,
or short Markdown notes.

Top-level placement options:

```json
{
  "overviewBlocks": [],
  "apiBlocks": [],
  "compoundBlocks": [],
  "domBlocks": [],
  "sparBlocks": [],
  "planBlocks": [],
  "contentBlocks": [],
  "sections": [
    {
      "title": "Source evidence",
      "description": "Optional grouped evidence.",
      "blocks": []
    }
  ],
  "sources": {
    "takeoffUi": { "files": [], "findings": [], "blocks": [] }
  },
  "decisions": [{ "id": "D001", "title": "...", "blocks": [] }]
}
```

Supported block types:

```json
[
  {
    "type": "code",
    "title": "React API sketch",
    "language": "tsx",
    "file": "packages/react-spar/src/components/accordion/index.tsx",
    "lineNumbers": true,
    "content": "export type AccordionProps = ..."
  },
  {
    "type": "diff",
    "title": "Minimal design selector change",
    "content": "+ .tk-accordion-trigger[data-state='open'] { ... }"
  },
  {
    "type": "table",
    "title": "Contract comparison",
    "columns": [
      { "key": "area", "label": "Area" },
      { "key": "core", "label": "takeoff-ui" },
      { "key": "spar", "label": "spar" },
      { "key": "status", "label": "Status", "type": "status" }
    ],
    "rows": [
      {
        "area": "value",
        "core": "value",
        "spar": "value/defaultValue",
        "status": "Wrapper mapping"
      }
    ]
  },
  {
    "type": "keyValue",
    "title": "Important facts",
    "items": [{ "key": "Root class", "value": "tk-accordion" }]
  },
  {
    "type": "checklist",
    "title": "Implementation readiness",
    "items": [
      {
        "label": "Event payload confirmed",
        "status": "Decision Needed",
        "checked": false
      }
    ]
  },
  {
    "type": "callout",
    "tone": "warn",
    "title": "Decision required",
    "body": "Payload shape is not confirmed. Do not implement until approved."
  },
  {
    "type": "fileTree",
    "title": "Files to touch",
    "items": [
      {
        "name": "packages/react-spar/src/components/accordion",
        "children": ["index.tsx", "accordion.test.tsx", "types.test-d.ts"]
      }
    ]
  },
  {
    "type": "details",
    "title": "Raw evidence summary",
    "open": false,
    "blocks": [
      {
        "type": "markdown",
        "content": "- Keep snippets short.\n- Do not paste entire source files."
      }
    ]
  }
]
```

Do not use content blocks as a dumping ground for entire source files. Prefer
short, source-backed snippets that clarify a decision, API shape, selector
contract, or review finding.

## Markdown quality requirements

- Every table row should have a source or `Unknown`.
- Do not include long source dumps; summarize evidence.
- Separate `facts` from `proposal` from `decisions`.
- Keep code snippets short and only when they clarify API shape.
- The `Handoff prompt` section should be copyable without requiring the HTML UI.

## Evidence and self-check requirements

The recipe is not implementation-ready until these are true:

- `localEvidence.required` is true and local repo evidence is present, or the
  user explicitly provided equivalent source excerpts.
- `sources.takeoffUi`, `sources.spar`, `sources.takeoffDesign`, and
  `sources.takeoffSpar` all contain searched paths and findings.
- `evidenceLedger` includes source-backed rows for every API, event, compound,
  DOM/data-state, spar compatibility, docs/tests/export, and validation claim.
- `selfChecks` includes the recipe reasoning gates from
  `references/reasoning-gates.md` and no required row remains `pending` before
  handoff.
- Unknown or contradicted evidence is linked to a `Decision Needed` ID or a
  remaining risk.
- The Markdown recipe distinguishes `Direct evidence`, `Derived`, `Unknown`, and
  `Contradicted` facts.

Do not use these fields to expose hidden chain-of-thought. They are an auditable
summary of checks, evidence, and outcomes.
