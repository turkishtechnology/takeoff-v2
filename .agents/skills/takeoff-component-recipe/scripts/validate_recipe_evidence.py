#!/usr/bin/env python3
"""Validate that a Takeoff component recipe is evidence-backed.

This is a lightweight local guardrail. It does not replace expert review; it
checks that the recipe contains local source coverage, evidence rows, completed
self-checks, and explicit decisions/risks for unknowns.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

SOURCE_KEYS = ["takeoffUi", "spar", "takeoffDesign", "takeoffSpar"]
SOURCE_LABELS = {
    "takeoffUi": "takeoff-ui core",
    "spar": "spar primitive",
    "takeoffDesign": "takeoff-design",
    "takeoffSpar": "takeoff-spar",
}
CONTRACT_TABLES = ["api", "events", "domContract", "sparCompatibility"]
BAD_EMPTY_STATUSES = {"", "unknown", "not found", "pending"}


def as_list(value: Any) -> list[Any]:
    if value is None:
        return []
    return value if isinstance(value, list) else [value]


def load(path: Path) -> dict[str, Any]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise SystemExit("Recipe JSON must be an object")
    return data


def has_decisions_or_risks(data: dict[str, Any], text: str) -> bool:
    hay = json.dumps(data.get("decisions", []), ensure_ascii=False).lower() + "\n" + json.dumps(data.get("risks", []), ensure_ascii=False).lower()
    return text.lower() in hay or "unknown" in hay or "decision" in hay


def row_source(row: Any) -> str:
    if not isinstance(row, dict):
        return ""
    for key in ("source", "evidence", "path", "repo"):
        value = row.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()
        if isinstance(value, list) and value:
            return json.dumps(value, ensure_ascii=False)
    return ""


def validate(data: dict[str, Any], require_complete: bool) -> tuple[list[dict[str, str]], str]:
    issues: list[dict[str, str]] = []

    def add(severity: str, area: str, message: str, fix: str) -> None:
        issues.append({"severity": severity, "area": area, "message": message, "fix": fix})

    sources = data.get("sources") or {}
    for key in SOURCE_KEYS:
        src = sources.get(key) or {}
        files = as_list(src.get("files"))
        found_files = [f for f in files if not isinstance(f, dict) or f.get("status") != "not found"]
        if not found_files:
            severity = "Blocker" if key in {"takeoffUi", "spar"} else "Major"
            add(severity, SOURCE_LABELS[key], "No local source files are recorded.", "Run collect_contract_context.py locally or provide source excerpts; convert missing contract to Decision Needed when applicable.")
        required_paths = as_list(src.get("requiredPaths"))
        missing_required = [p for p in required_paths if isinstance(p, dict) and p.get("required") and not p.get("exists")]
        if missing_required:
            add("Major", SOURCE_LABELS[key], "Required local path is missing: " + "; ".join(str(p.get("path")) for p in missing_required), "Record Not found and add a decision/risk if the missing path affects the contract.")

    ledger = as_list(data.get("evidenceLedger"))
    if len(ledger) < 4:
        add("Major", "evidenceLedger", "Evidence ledger has fewer than four rows.", "Add at least one ledger row for takeoff-ui, spar, takeoff-design, and takeoff-spar.")
    for item in ledger:
        if not isinstance(item, dict):
            continue
        if not item.get("claim") or not item.get("repo") or not (item.get("path") or item.get("evidence")):
            add("Major", "evidenceLedger", f"Incomplete ledger row: {item!r}", "Each ledger row needs claim, repo, path/evidence, status, confidence.")
        status = str(item.get("status") or "").lower()
        if status in {"unknown", "contradicted"} and not item.get("decisionId") and require_complete:
            add("Major", "evidenceLedger", f"Unknown/contradicted ledger row has no decisionId: {item.get('id')}", "Link unknown/contradicted evidence to a Decision Needed or risk.")

    checks = as_list(data.get("selfChecks"))
    if len(checks) < 6:
        add("Major", "selfChecks", "Missing recipe self-check rows.", "Add and complete R-Q self-checks from references/reasoning-gates.md.")
    for check in checks:
        if not isinstance(check, dict):
            continue
        status = str(check.get("status") or "").lower()
        if require_complete and status in {"", "pending"}:
            add("Major", "selfChecks", f"Self-check {check.get('id')} is still pending.", "Resolve as pass, decision-needed, unknown, contradicted, or blocked before implementation handoff.")
        if not check.get("evidence"):
            add("Minor", "selfChecks", f"Self-check {check.get('id')} has no evidence pointer.", "Add file/ledger/table reference.")

    for table in CONTRACT_TABLES:
        rows = as_list(data.get(table))
        if require_complete and not rows:
            add("Major", table, f"Contract table `{table}` is empty.", "Fill with source-backed rows or explain Not applicable.")
        for idx, row in enumerate(rows, start=1):
            src = row_source(row)
            if not src:
                add("Major", table, f"Row {idx} has no source/evidence.", "Add source path/evidence ID or mark Unknown with a decision/risk.")
            row_text = json.dumps(row, ensure_ascii=False).lower()
            if "unknown" in row_text and require_complete and not has_decisions_or_risks(data, "unknown"):
                add("Major", table, f"Row {idx} contains Unknown without linked decision/risk.", "Add Decision Needed or risk for the unknown.")

    contradictions = as_list(data.get("contradictions"))
    for item in contradictions:
        if isinstance(item, dict) and str(item.get("status") or "").lower() not in {"resolved", "decision-needed", "not applicable"}:
            add("Major", "contradictions", f"Open contradiction without resolution: {item.get('area') or item.get('id')}", "Resolve, link to decision, or block implementation.")

    if any(i["severity"] == "Blocker" for i in issues):
        verdict = "FAIL"
    elif any(i["severity"] == "Major" for i in issues):
        verdict = "CONDITIONAL"
    else:
        verdict = "PASS"
    return issues, verdict


def markdown(issues: list[dict[str, str]], verdict: str, recipe_path: Path) -> str:
    out = [f"# Recipe evidence validation\n\n- Recipe: `{recipe_path}`\n- Verdict: **{verdict}**\n\n"]
    if not issues:
        out.append("No evidence issues found.\n")
        return "".join(out)
    out.append("| Severity | Area | Message | Fix |\n| --- | --- | --- | --- |\n")
    for item in issues:
        out.append("| {severity} | {area} | {message} | {fix} |\n".format(**{k: str(v).replace("\n", " ").replace("|", "\\|") for k, v in item.items()}))
    return "".join(out)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--recipe", required=True, type=Path)
    parser.add_argument("--out", type=Path, help="Optional Markdown report path")
    parser.add_argument("--require-complete", action="store_true", help="Fail pending checks/empty tables. Use before implementation handoff.")
    parser.add_argument("--fail-on-blocker", action="store_true", help="Exit 1 when a blocker is found")
    args = parser.parse_args()

    data = load(args.recipe)
    issues, verdict = validate(data, require_complete=args.require_complete)
    report = markdown(issues, verdict, args.recipe)
    if args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(report, encoding="utf-8")
        print(f"Wrote validation report: {args.out}")
    else:
        print(report)
    if args.fail_on_blocker and any(i["severity"] == "Blocker" for i in issues):
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
