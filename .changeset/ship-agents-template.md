---
'@takeoff-ui/react-spar': minor
---

Ship an `AGENTS.md` template in the package so coding assistants can write
correct `@takeoff-ui/react-spar` code.

Copilot, Cursor, and Claude don't know this library and will invent props or
hand-roll markup that a component already covers. The package now includes
`agents/AGENTS.template.md` — an index of all 28 components with what each is
for, plus the rules that matter (React 19 only, provider + token CSS, the
slot/customization model).

Copy it to your repository root, where all three tools read it automatically:

```bash
cp node_modules/@takeoff-ui/react-spar/agents/AGENTS.template.md ./AGENTS.md
```

Full guide, including tool-specific paths and how to give an assistant the
complete component API:
https://takeoff-v2.app.turkishtechlab.com/docs/ai-assistants

Nothing else changes — no runtime, type, or API changes. `files` now includes
`agents`, so this is the first release where that path exists.
