#!/usr/bin/env python3
"""Render a Takeoff component recipe JSON file to static HTML and Markdown.

This script is dependency-free and safe for local/offline use.
"""
from __future__ import annotations

import argparse
import datetime as _dt
import html
import json
from pathlib import Path
from typing import Any, Iterable


def _as_list(value: Any) -> list[Any]:
    if value is None:
        return []
    if isinstance(value, list):
        return value
    return [value]


def _text(value: Any, fallback: str = "Unknown") -> str:
    if value is None or value == "":
        return fallback
    if isinstance(value, (dict, list)):
        return json.dumps(value, ensure_ascii=False)
    return str(value)


def _md_escape(value: Any) -> str:
    return _text(value).replace("\n", " ").strip()


def _md_table(headers: list[str], rows: Iterable[Iterable[Any]]) -> str:
    headers = [_md_escape(h) for h in headers]
    body = [[_md_escape(cell) for cell in row] for row in rows]
    if not body:
        return "_No rows recorded._\n"
    out = ["| " + " | ".join(headers) + " |", "| " + " | ".join(["---"] * len(headers)) + " |"]
    for row in body:
        padded = row + [""] * (len(headers) - len(row))
        out.append("| " + " | ".join(padded[: len(headers)]) + " |")
    return "\n".join(out) + "\n"


def _bullets(items: Any) -> str:
    values = _as_list(items)
    if not values:
        return "- Unknown\n"
    return "".join(f"- {_md_escape(item)}\n" for item in values)


def _file_bullets(items: Any) -> str:
    values = _as_list(items)
    if not values:
        return "- Not found\n"
    out: list[str] = []
    for item in values:
        if isinstance(item, dict):
            path = item.get("path") or item.get("absolutePath") or "Unknown"
            status = item.get("status") or ("not found" if item.get("exists") is False else "found")
            bits = [f"status={status}"]
            if item.get("lineCount"):
                bits.append(f"lines={item.get('lineCount')}")
            if item.get("sha256"):
                bits.append(f"sha={str(item.get('sha256'))[:12]}")
            out.append(f"- `{_md_escape(path)}` ({', '.join(bits)})\n")
        else:
            out.append(f"- `{_md_escape(item)}`\n")
    return "".join(out)

def _block_to_md(block: Any) -> str:
    if block is None:
        return ""
    if isinstance(block, str):
        return block.strip() + "\n"
    if not isinstance(block, dict):
        return _text(block) + "\n"
    kind = str(block.get("type") or "").lower()
    title = block.get("title") or block.get("heading") or block.get("name")
    description = block.get("description") or block.get("caption")
    out: list[str] = []
    if title:
        out.append(f"### {_md_escape(title)}\n")
    if description:
        out.append(f"{_md_escape(description)}\n\n")
    if kind in {"code", "diff"}:
        language = "diff" if kind == "diff" else (block.get("language") or block.get("lang") or "text")
        filename = block.get("file") or block.get("filename") or block.get("path")
        if filename:
            out.append(f"_File: `{_md_escape(filename)}`_\n\n")
        out.append(f"```{language}\n{block.get('content') or block.get('code') or block.get('value') or ''}\n```\n")
    elif kind in {"table"} or block.get("rows"):
        columns = _as_list(block.get("columns") or block.get("headers"))
        rows = _as_list(block.get("rows") or block.get("items"))
        if not columns and rows and isinstance(rows[0], dict):
            columns = [{"key": key, "label": key} for key in rows[0].keys()]
        headers = [_text(col.get("label") or col.get("key")) if isinstance(col, dict) else _text(col) for col in columns]
        row_values = []
        for row in rows:
            if isinstance(row, dict):
                row_values.append([row.get(col.get("key")) if isinstance(col, dict) else row.get(str(col)) for col in columns])
            else:
                row_values.append(_as_list(row))
        out.append(_md_table(headers or ["Value"], row_values))
    elif kind in {"keyvalue", "key-value", "kv"}:
        rows = []
        for item in _as_list(block.get("items") or block.get("rows") or block.get("values")):
            if isinstance(item, dict):
                rows.append([item.get("key") or item.get("label") or item.get("name"), item.get("value") or item.get("description") or item.get("notes")])
        out.append(_md_table(["Key", "Value"], rows))
    elif kind == "checklist":
        for item in _as_list(block.get("items") or block.get("rows")):
            if isinstance(item, dict):
                mark = "x" if item.get("checked") or item.get("done") else " "
                out.append(f"- [{mark}] {_md_escape(item.get('label') or item.get('name') or item.get('task'))}")
                if item.get("status"):
                    out[-1] += f" — {_md_escape(item.get('status'))}"
                if item.get("note") or item.get("notes"):
                    out[-1] += f" — {_md_escape(item.get('note') or item.get('notes'))}"
                out[-1] += "\n"
    elif kind in {"callout", "note", "warning", "danger"}:
        body = block.get("body") or block.get("content") or ""
        out.append(f"> **{_md_escape(block.get('title') or block.get('heading') or 'Note')}** {_md_escape(body)}\n")
        if block.get("items"):
            out.append(_bullets(block.get("items")))
    elif kind in {"markdown", "md"}:
        out.append(str(block.get("content") or block.get("body") or "").rstrip() + "\n")
    elif kind in {"list"}:
        out.append(_bullets(block.get("items")))
    elif kind in {"details", "accordion", "tabs", "cards", "metrics", "steps", "filetree", "file-tree"}:
        nested = block.get("blocks") or block.get("contentBlocks") or block.get("items") or block.get("tabs") or block.get("cards") or block.get("steps") or block.get("children")
        out.append(_blocks_to_md(nested))
    else:
        body = block.get("body") or block.get("content") or block.get("text")
        if body:
            out.append(_md_escape(body) + "\n")
        else:
            out.append(f"```json\n{json.dumps(block, ensure_ascii=False, indent=2)}\n```\n")
    return "".join(out).rstrip() + "\n"


def _blocks_to_md(blocks: Any) -> str:
    values = _as_list(blocks)
    return "\n".join(_block_to_md(block).rstrip() for block in values if block is not None).rstrip() + ("\n" if values else "")

def build_markdown(data: dict[str, Any]) -> str:
    component = data.get("component") or "unknown"
    component_pascal = data.get("componentPascal") or component
    spar_primitive = data.get("sparPrimitive") or component

    lines: list[str] = []
    lines.append(f"# {component_pascal} component recipe\n")

    lines.append("## 1. Inputs\n")
    lines.append(_md_table(
        ["Field", "Value"],
        [
            ["component", component],
            ["componentPascal", component_pascal],
            ["sparPrimitive", spar_primitive],
            ["repoRoot", data.get("repoRoot")],
            ["generatedAt", data.get("generatedAt")],
        ],
    ))
    lines.append(f"\n**Summary:** {_md_escape(data.get('summary', 'No summary recorded.'))}\n")

    lines.append("\n## 2. Repo cut-off\n")
    lines.append(_md_table(
        ["Repo", "Path", "Branch", "Commit", "Dirty", "Files / notes"],
        ([
            repo.get("name"),
            repo.get("path"),
            repo.get("branch"),
            repo.get("commit"),
            repo.get("dirty"),
            "; ".join([*map(str, _as_list(repo.get("dirtyFiles"))), *map(str, _as_list(repo.get("notes")))]) or "None",
        ] for repo in _as_list(data.get("repos"))),
    ))

    lines.append("\n## 3. Discovery summary\n")
    sources = data.get("sources") or {}
    for title, key in [
        ("takeoff-ui core", "takeoffUi"),
        ("spar primitive", "spar"),
        ("takeoff-design", "takeoffDesign"),
        ("takeoff-spar", "takeoffSpar"),
    ]:
        source = sources.get(key) or {}
        lines.append(f"\n### {title}\n")
        lines.append("**Files**\n")
        lines.append(_file_bullets(source.get("files")))
        lines.append("\n**Findings**\n")
        lines.append(_bullets(source.get("findings")))

    lines.append("\n## 4. Evidence & self-check gates\n")
    lines.append("The recipe must be based on local evidence. These rows show the observable self-check result, not hidden chain-of-thought.\n")
    lines.append("\n### Self-checks\n")
    lines.append(_md_table(
        ["ID", "Question", "Status", "Answer", "Evidence", "Follow-up"],
        ([c.get("id"), c.get("question"), c.get("status"), c.get("answer"), c.get("evidence"), c.get("followUp") or c.get("risk")] for c in _as_list(data.get("selfChecks"))),
    ))
    lines.append("\n### Evidence ledger\n")
    lines.append(_md_table(
        ["ID", "Claim", "Repo", "Path", "Lines", "Status", "Confidence", "Decision"],
        ([e.get("id"), e.get("claim"), e.get("repo"), e.get("path"), e.get("lines"), e.get("status"), e.get("confidence"), e.get("decisionId")] for e in _as_list(data.get("evidenceLedger"))),
    ))
    lines.append("\n### Contradictions\n")
    lines.append(_md_table(
        ["Area", "Conflict", "Sources", "Status", "Resolution"],
        ([x.get("area") or x.get("id"), x.get("conflict") or x.get("claim"), x.get("sources"), x.get("status"), x.get("resolution")] for x in _as_list(data.get("contradictions"))),
    ))
    lines.append("\n### Assumptions under watch\n")
    lines.append(_md_table(
        ["ID", "Assumption", "Evidence", "Status", "Decision"],
        ([a.get("id"), a.get("assumption") or a.get("claim"), a.get("evidence"), a.get("status"), a.get("decisionId")] for a in _as_list(data.get("assumptions"))),
    ))

    lines.append("\n## 5. Source contract matrix\n")
    lines.append("Use the API, event, compound, DOM, and spar tables below as the contract matrix. Each row should carry source evidence or `Unknown`.\n")

    if data.get("contentBlocks") or data.get("evidenceBlocks") or data.get("sections"):
        lines.append("\n### Additional content / evidence blocks\n")
        lines.append(_blocks_to_md(data.get("contentBlocks") or data.get("evidenceBlocks")))
        for section in _as_list(data.get("sections")):
            if isinstance(section, dict):
                lines.append(f"\n### {_md_escape(section.get('title') or section.get('name') or 'Extra section')}\n")
                if section.get("description"):
                    lines.append(_md_escape(section.get("description")) + "\n\n")
                lines.append(_blocks_to_md(section.get("blocks") or section.get("contentBlocks") or section.get("items")))

    lines.append("\n## 6. Public React API proposal\n")
    lines.append(_md_table(
        ["Name", "Type", "Default", "Source", "Status", "Notes"],
        ([p.get("name"), p.get("type"), p.get("default"), p.get("source"), p.get("status"), p.get("notes")] for p in _as_list(data.get("api"))),
    ))
    lines.append("\n### Events\n")
    lines.append(_md_table(
        ["Web component", "React", "Payload", "Source", "Status", "Notes"],
        ([e.get("webComponent"), e.get("react"), e.get("payload"), e.get("source"), e.get("status"), e.get("notes")] for e in _as_list(data.get("events"))),
    ))

    compound = data.get("compound") or {}
    lines.append("\n## 7. Compound structure\n")
    lines.append(f"- Root: `{_md_escape(compound.get('root'))}`\n")
    lines.append(f"- Tree: `{_md_escape(compound.get('tree'))}`\n\n")
    lines.append("### Public parts\n")
    lines.append(_md_table(
        ["Part", "Element", "displayName", "Public", "Source"],
        ([p.get("name"), p.get("element"), p.get("displayName"), p.get("public"), p.get("source")] for p in _as_list(compound.get("parts"))),
    ))
    lines.append("\n### Internal-only parts\n")
    lines.append(_md_table(
        ["Name", "Reason"],
        ([p.get("name"), p.get("reason")] for p in _as_list(compound.get("internalOnly"))),
    ))

    lines.append("\n## 8. DOM / class / data-state contract\n")
    lines.append(_md_table(
        ["Level", "Class", "Data attr", "Values", "Required", "Source", "Status", "Notes"],
        ([d.get("level"), d.get("class"), d.get("dataAttr"), ", ".join(map(str, _as_list(d.get("values")))), d.get("required"), d.get("source"), d.get("status"), d.get("notes")] for d in _as_list(data.get("domContract"))),
    ))

    lines.append("\n## 9. Spar compatibility\n")
    lines.append(_md_table(
        ["Capability", "Spar", "takeoff-spar wrapper", "Status", "Resolution"],
        ([s.get("capability"), s.get("spar"), s.get("wrapper"), s.get("status"), s.get("resolution")] for s in _as_list(data.get("sparCompatibility"))),
    ))

    lines.append("\n## 10. takeoff-design alignment\n")
    design_findings = (sources.get("takeoffDesign") or {}).get("findings")
    lines.append(_bullets(design_findings))

    lines.append("\n## 11. takeoff-spar implementation plan\n")
    lines.append(_md_table(
        ["Area", "Action", "Files"],
        ([p.get("area"), p.get("action"), "; ".join(map(str, _as_list(p.get("files"))))] for p in _as_list(data.get("implementationPlan"))),
    ))

    lines.append("\n## 12. Tests and docs plan\n")
    lines.append("### Tests\n")
    lines.append(_md_table(
        ["Name", "Coverage", "Status"],
        ([t.get("name"), t.get("coverage"), t.get("status")] for t in _as_list(data.get("tests"))),
    ))
    lines.append("\n### Docs\n")
    lines.append(_md_table(
        ["Name", "Status", "Notes"],
        ([d.get("name"), d.get("status"), d.get("notes")] for d in _as_list(data.get("docs"))),
    ))

    lines.append("\n## 13. Validation plan\n")
    lines.append(_md_table(
        ["Command", "Required", "Notes"],
        ([v.get("command"), v.get("required"), v.get("notes")] for v in _as_list(data.get("validation"))),
    ))

    lines.append("\n## 14. Decision Needed\n")
    decisions = _as_list(data.get("decisions"))
    if not decisions:
        lines.append("No open decisions recorded.\n")
    for decision in decisions:
        lines.append(f"\n### {decision.get('id', 'D?')} — {_md_escape(decision.get('title', 'Untitled decision'))}\n\n")
        lines.append(f"- Status: {_md_escape(decision.get('status', 'needed'))}\n")
        lines.append(f"- Blocking: {'yes' if decision.get('blocking') else 'no'}\n")
        lines.append(f"- Question: {_md_escape(decision.get('question'))}\n")
        lines.append(f"- Impact: {_md_escape(decision.get('impact'))}\n")
        lines.append("- Evidence:\n")
        lines.append("".join(f"  - {_md_escape(item)}\n" for item in _as_list(decision.get("evidence"))) or "  - Unknown\n")
        lines.append("- Options:\n")
        options = _as_list(decision.get("options"))
        lines.append("".join(f"  {i + 1}. {_md_escape(option)}\n" for i, option in enumerate(options)) or "  1. Unknown\n")
        lines.append(f"- Recommendation: {_md_escape(decision.get('recommendation', 'None'))}\n")
        lines.append(f"- Decision: {_md_escape(decision.get('decision', '_pending_'))}\n")
        lines.append("- Follow-up:\n")
        lines.append("".join(f"  - {_md_escape(item)}\n" for item in _as_list(decision.get("followUp"))) or "  - None recorded\n")

    lines.append("\n## 15. Handoff prompt\n")
    lines.append("Use `references/implementation-handoff.md` from this skill and replace placeholders with this recipe's component values. Attach this recipe and the approved decisions Markdown.\n")

    lines.append("\n## 16. Remaining risks\n")
    lines.append(_md_table(
        ["Risk", "Mitigation", "Status"],
        ([r.get("risk"), r.get("mitigation"), r.get("status")] for r in _as_list(data.get("risks"))),
    ))

    return "".join(lines).rstrip() + "\n"


def load_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, dict):
        raise ValueError("Recipe JSON root must be an object")
    data.setdefault("generatedAt", _dt.datetime.now(_dt.timezone.utc).isoformat())
    return data


def render_html(data: dict[str, Any], template_path: Path) -> str:
    template = template_path.read_text(encoding="utf-8")
    payload = json.dumps(data, ensure_ascii=False, indent=2).replace('</', '<\\/')
    if "/*__RECIPE_DATA__*/" not in template:
        raise ValueError(f"Template missing placeholder: {template_path}")
    return template.replace("/*__RECIPE_DATA__*/", payload)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data", required=True, type=Path, help="Path to recipe JSON")
    parser.add_argument("--out", type=Path, help="Path to write recipe HTML")
    parser.add_argument("--md-out", type=Path, help="Path to write recipe Markdown")
    parser.add_argument("--template", type=Path, help="HTML template path")
    args = parser.parse_args()

    data = load_json(args.data)
    script_dir = Path(__file__).resolve().parent
    template = args.template or script_dir.parent / "assets" / "component-recipe-template.html"

    if not args.out and not args.md_out:
        raise SystemExit("Nothing to do: pass --out and/or --md-out")

    if args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(render_html(data, template), encoding="utf-8")
        print(f"Wrote HTML: {args.out}")

    if args.md_out:
        args.md_out.parent.mkdir(parents=True, exist_ok=True)
        args.md_out.write_text(build_markdown(data), encoding="utf-8")
        print(f"Wrote Markdown: {args.md_out}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
