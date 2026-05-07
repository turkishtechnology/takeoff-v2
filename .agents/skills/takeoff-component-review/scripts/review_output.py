#!/usr/bin/env python3
"""Heuristic reviewer for Takeoff component implementation artifacts.

This script does not replace human/AI review. It scans recipe, decisions, diff,
final report, validation logs, and optional local evidence for common gates and
writes a Markdown/HTML review.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import re
from pathlib import Path
from typing import Any

FORBIDDEN_PATTERNS = [
    (re.compile(r"(^|\n)(diff --git a/)?takeoff-ui/|packages/core/src/components/tk-", re.I), "takeoff-ui core appears in diff"),
    (re.compile(r"(^|\n)(diff --git a/)?\.github/", re.I), "workflow files appear in diff"),
    (re.compile(r"task[-_ ]?generator|migration scaffold|audit scaffold|generic component", re.I), "generic infra/audit/migration language found"),
]

VALIDATION_COMMANDS = [
    "pnpm install",
    "pnpm exec vitest run {component}",
    "pnpm exec vitest run",
    "pnpm exec tsc --noEmit",
    "pnpm exec eslint .",
    "pnpm build",
]

REQUIRED_LOCAL_KEYS = ["takeoffUi", "spar", "takeoffDesign", "takeoffSpar"]


def read(path: Path | None) -> str:
    if not path:
        return ""
    try:
        return path.read_text(encoding="utf-8", errors="replace")
    except FileNotFoundError:
        return ""


def load_json(path: Path | None) -> dict[str, Any]:
    if not path or not path.exists():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else {}
    except Exception:  # noqa: BLE001
        return {}


def load_recipe(path: Path | None) -> dict[str, Any]:
    if not path or not path.exists() or path.suffix.lower() != ".json":
        return {}
    return load_json(path)


def issue(severity: str, title: str, evidence: Any, why: str, fix: str, owner: str, blocks: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    row: dict[str, Any] = {"severity": severity, "title": title, "evidence": evidence, "why": why, "fix": fix, "owner": owner}
    if blocks:
        row["blocks"] = blocks
    return row


def as_list(value: Any) -> list[Any]:
    if value is None:
        return []
    return value if isinstance(value, list) else [value]


def local_source_status(local_evidence: dict[str, Any]) -> tuple[list[dict[str, str]], list[str]]:
    rows: list[dict[str, str]] = []
    missing: list[str] = []
    sources = local_evidence.get("sources") or {}
    for key in REQUIRED_LOCAL_KEYS:
        files = as_list(sources.get(key))
        found = [f for f in files if not isinstance(f, dict) or f.get("status") != "not found"]
        status = "present" if found else "missing"
        if not found:
            missing.append(key)
        rows.append({"area": key, "status": status, "evidence": f"{len(found)} local file(s)", "notes": "from local evidence JSON"})
    return rows, missing


def scan(
    component: str,
    recipe: dict[str, Any],
    recipe_text: str,
    decisions: str,
    diff: str,
    final_report: str,
    validation_log: str,
    local_evidence: dict[str, Any],
) -> dict[str, Any]:
    blockers: list[dict[str, Any]] = []
    majors: list[dict[str, Any]] = []
    minors: list[dict[str, Any]] = []
    nits: list[dict[str, Any]] = []
    good: list[str] = []

    if local_evidence and not diff:
        diff = str(local_evidence.get("diffExcerpt") or "")
    combined_diff = diff or ""

    for pattern, title in FORBIDDEN_PATTERNS:
        if pattern.search(combined_diff):
            blockers.append(issue("Blocker", title, "Matched forbidden diff pattern.", "The component task must not change read-only/generic infrastructure scope.", "Remove unrelated changes or split into an approved task.", "scope"))

    local_rows: list[dict[str, str]] = []
    missing_local: list[str] = []
    touched = as_list(local_evidence.get("touchedFiles")) if local_evidence else []
    if local_evidence:
        local_rows, missing_local = local_source_status(local_evidence)
        if not missing_local:
            good.append("Local evidence is present for takeoff-ui core, spar, takeoff-design, and takeoff-spar.")
        else:
            majors.append(issue("Major", "Local source evidence incomplete", ", ".join(missing_local), "Review cannot fully verify source-of-truth alignment.", "Refresh local evidence or provide source excerpts for missing repos.", "evidence"))
        forbidden_touched = [row for row in touched if isinstance(row, dict) and row.get("scope") == "forbidden"]
        conditional_touched = [row for row in touched if isinstance(row, dict) and row.get("scope") == "conditional"]
        if forbidden_touched:
            blockers.append(issue("Blocker", "Forbidden touched files", "; ".join(f"{r.get('repo')}:{r.get('path')}" for r in forbidden_touched[:20]), "Scope gate forbids takeoff-ui, workflows, generic infra, and unrelated component changes.", "Remove forbidden changes or split into a separately approved task.", "scope"))
        if conditional_touched:
            majors.append(issue("Major", "Conditional source changes need explicit justification", "; ".join(f"{r.get('repo')}:{r.get('path')}" for r in conditional_touched[:20]), "spar/design changes are allowed only for real primitive gaps or selector alignment.", "Add recipe/final-report justification and tests; otherwise revert.", "spar/takeoff-design"))
    else:
        majors.append(issue("Major", "Local review evidence missing", "No --local-evidence JSON provided.", "A merge-readiness review must compare output against current local source-of-truth repos.", "Run collect_review_context.py and rerun review_output.py with --local-evidence.", "evidence"))

    if combined_diff and f"tk-{component}" in combined_diff:
        good.append(f"Diff references canonical class prefix tk-{component}.")
    elif combined_diff:
        majors.append(issue("Major", "Canonical class evidence missing", f"No `tk-{component}` string found in diff.", "takeoff-design styling depends on canonical classes.", "Verify root and part classes are emitted and tested.", "wrapper"))

    if combined_diff and "Object.assign" in combined_diff:
        good.append("Compound `Object.assign` pattern appears in diff.")
    elif recipe.get("compound", {}).get("parts"):
        majors.append(issue("Major", "Compound export evidence missing", "Recipe has public parts but diff does not show Object.assign.", "Consumers need the approved compound API.", "Use Object.assign or the repo's existing equivalent and test displayName.", "wrapper"))

    if combined_diff and "displayName" in combined_diff:
        good.append("displayName appears in diff.")
    elif recipe.get("compound", {}).get("parts"):
        minors.append(issue("Minor", "displayName evidence missing", "No displayName string found in diff.", "Debuggability and recipe contract require public part names.", "Add or verify displayName for every public part.", "wrapper"))

    if re.search(r"useState\s*\(", combined_diff) and re.search(r"open|value|selected|active", combined_diff, re.I):
        majors.append(issue("Major", "Possible wrapper state duplication", "Diff contains useState near value/open/selected vocabulary.", "spar should own headless state; wrapper state may duplicate behavior.", "Prove it is visual-only/derived or move behavior to spar/primitive mapping.", "wrapper/spar"))

    if re.search(r"onKeyDown|keydown|KeyboardEvent", combined_diff, re.I):
        majors.append(issue("Major", "Possible wrapper keyboard behavior", "Diff references keyboard handlers.", "Keyboard navigation is spar-owned unless wrapper adds only event composition.", "Remove custom navigation or justify with primitive gap and tests.", "wrapper/spar"))

    if decisions and re.search(r"Decision:\s*_?pending_?|Status:\s*needed", decisions, re.I):
        majors.append(issue("Major", "Unresolved decision remains", "Decisions file contains pending/needed items.", "Public API/DOM/state decisions should not be silently implemented.", "Resolve decision or keep implementation blocked for that area.", "decision"))

    if recipe and not recipe.get("evidenceLedger"):
        majors.append(issue("Major", "Recipe evidence ledger missing", "Recipe JSON has no evidenceLedger.", "Review cannot trace derived claims back to local sources.", "Regenerate/complete recipe with evidenceLedger before approving.", "recipe"))
    if recipe and not recipe.get("selfChecks"):
        minors.append(issue("Minor", "Recipe self-checks missing", "Recipe JSON has no selfChecks.", "Recipe quality is harder to audit.", "Add recipe self-check gates or attach validation report.", "recipe"))

    validation_rows = []
    validation_status = "Needs evidence"
    missing_commands = []
    for template in VALIDATION_COMMANDS:
        command = template.format(component=component)
        found = command in validation_log or command in final_report
        result = "mentioned" if found else "not run"
        if not found:
            missing_commands.append(command)
        validation_rows.append({"command": command, "result": result, "triage": "Evidence found" if found else "Needs evidence", "notes": ""})
    if not missing_commands:
        validation_status = "mentioned"
        good.append("All expected validation commands are mentioned in provided evidence.")
    else:
        minors.append(issue("Minor", "Validation evidence incomplete", ", ".join(missing_commands), "Not-run validation leaves merge risk.", "Run missing commands or attach logs/triage.", "validation"))

    if re.search(r"fail|failed|error|ERR!|✘", validation_log, re.I):
        majors.append(issue("Major", "Validation log contains failure/error markers", "Failure-like text found in validation log.", "Related failures must be fixed; unrelated failures need baseline evidence.", "Triage each failure as related or pre-existing with evidence.", "validation"))

    contract_coverage = [
        {"area": "Local source evidence", "status": "reviewed" if local_evidence and not missing_local else "needs evidence", "evidence": "local evidence JSON" if local_evidence else "missing", "notes": "No PASS without local source-of-truth evidence."},
        {"area": "Scope", "status": "fail" if any("scope" in i["owner"] for i in blockers) else "needs evidence" if not combined_diff and not touched else "reviewed", "evidence": "diff/local touched files" if (combined_diff or touched) else "missing diff", "notes": "Forbidden path scan performed."},
        {"area": "Public API", "status": "needs evidence", "evidence": "recipe/core/final report/diff", "notes": "Requires semantic review against source-backed recipe."},
        {"area": "Compound", "status": "reviewed" if "Object.assign" in combined_diff or not recipe.get("compound", {}).get("parts") else "needs evidence", "evidence": "diff", "notes": "Heuristic only."},
        {"area": "DOM contract", "status": "reviewed" if f"tk-{component}" in combined_diff else "needs evidence", "evidence": "diff + takeoff-design local source", "notes": "Confirm levels/data attrs manually."},
        {"area": "Spar responsibility", "status": "needs evidence" if re.search(r"useState|onKeyDown|KeyboardEvent", combined_diff) else "reviewed", "evidence": "diff + spar local source", "notes": "Heuristic duplication scan."},
        {"area": "Tests/docs/exports", "status": "needs evidence", "evidence": "final report/diff", "notes": "Manual review required."},
    ]
    contract_coverage.extend(local_rows)

    review_self_checks = as_list(local_evidence.get("reviewSelfChecks")) if local_evidence else []
    if not review_self_checks:
        review_self_checks = [
            {"id": "V-Q01", "question": "Was local source evidence refreshed?", "status": "needs evidence", "answer": "No local evidence JSON provided.", "evidence": "--local-evidence", "followUp": "Max CONDITIONAL."},
            {"id": "V-Q02", "question": "Was scope red-team checked?", "status": "partial", "answer": "Diff pattern scan only.", "evidence": "diff", "followUp": "Use collect_review_context.py for touched-file classification."},
        ]

    incomplete_review_checks = [
        c for c in review_self_checks
        if str(c.get("status") or "").lower() in {"", "pending", "needs evidence", "unknown", "blocked"}
    ]
    if incomplete_review_checks:
        majors.append(issue(
            "Major",
            "Reviewer self-checks incomplete",
            ", ".join(str(c.get("id")) for c in incomplete_review_checks),
            "The review has not completed the required skeptical passes.",
            "Complete reviewSelfChecks or explain why a check is not applicable before approving.",
            "review",
        ))

    if blockers:
        verdict = "FAIL"
    elif majors:
        verdict = "CONDITIONAL"
    elif missing_commands or missing_local or not local_evidence:
        verdict = "CONDITIONAL"
    else:
        verdict = "PASS WITH NOTES"

    content_blocks: list[dict[str, Any]] = []
    if local_evidence:
        content_blocks.append({"type": "table", "title": "Touched files from local evidence", "columns": [
            {"key": "repo", "label": "Repo"}, {"key": "status", "label": "Git"}, {"key": "path", "label": "Path"}, {"key": "scope", "label": "Scope", "type": "status"}, {"key": "reason", "label": "Reason"}
        ], "rows": touched})
        if local_evidence.get("diffStat"):
            content_blocks.append({"type": "code", "language": "text", "title": "Diff stat", "content": local_evidence.get("diffStat")})
    if combined_diff:
        diff_lines = combined_diff.splitlines()
        excerpt = "\n".join(diff_lines[:240])
        if len(diff_lines) > 240:
            excerpt += "\n... truncated ..."
        content_blocks.append({"type": "diff", "title": "Diff excerpt", "description": "Truncated review input for quick visual inspection.", "content": excerpt})
    if validation_log:
        log_lines = validation_log.splitlines()
        excerpt = "\n".join(log_lines[-160:])
        content_blocks.append({"type": "code", "language": "text", "title": "Validation log excerpt", "description": "Last lines of the validation log.", "content": excerpt})

    return {
        "component": component,
        "componentPascal": recipe.get("componentPascal") or "".join(part.capitalize() for part in component.split("-")),
        "generatedAt": dt.datetime.now(dt.timezone.utc).isoformat(),
        "verdict": verdict,
        "summary": "Heuristic review generated from provided artifacts. Complete the semantic source checks before merge.",
        "validationStatus": validation_status,
        "evidenceReviewed": [
            {"artifact": "recipe", "status": "present" if recipe_text or recipe else "missing", "notes": "evidenceLedger present" if recipe.get("evidenceLedger") else ""},
            {"artifact": "decisions", "status": "present" if decisions else "missing/not needed", "notes": ""},
            {"artifact": "diff", "status": "present" if combined_diff else "missing", "notes": ""},
            {"artifact": "local evidence", "status": "present" if local_evidence else "missing", "notes": "Required for PASS/PASS WITH NOTES"},
            {"artifact": "final report", "status": "present" if final_report else "missing", "notes": ""},
            {"artifact": "validation logs", "status": "present" if validation_log else "missing", "notes": ""},
        ],
        "reviewSelfChecks": review_self_checks,
        "blockingIssues": blockers,
        "majorIssues": majors,
        "minorIssues": minors,
        "nits": nits,
        "good": good,
        "contractCoverage": contract_coverage,
        "validation": validation_rows,
        "decisionFollowUp": ["Complete reviewSelfChecks and confirm approved decisions manually before final merge verdict."],
        "contentBlocks": content_blocks,
        "nextAction": "Address blocker/major issues, attach missing evidence, complete skeptical passes, then rerun this review.",
    }


def markdown(report: dict[str, Any]) -> str:
    def issues(title: str, rows: list[dict[str, Any]]) -> str:
        if not rows:
            return f"## {title}\n\nNone.\n"
        out = [f"## {title}\n"]
        for item in rows:
            out.append(f"### {item.get('title', 'Untitled')}\n")
            out.append(f"- Severity: {item.get('severity', 'Unknown')}\n")
            out.append(f"- Evidence: {item.get('evidence', 'Needs evidence')}\n")
            out.append(f"- Why it matters: {item.get('why', 'Unknown')}\n")
            out.append(f"- Minimal fix: {item.get('fix', 'Unknown')}\n")
            out.append(f"- Owner area: {item.get('owner', 'Unknown')}\n\n")
        return "".join(out)

    def table(headers: list[str], rows: list[dict[str, Any]]) -> str:
        if not rows:
            return "_No rows._\n"
        out = ["| " + " | ".join(headers) + " |", "| " + " | ".join(["---"] * len(headers)) + " |"]
        for row in rows:
            out.append("| " + " | ".join(str(row.get(h, "")).replace("\n", " ").replace("|", "\\|") for h in headers) + " |")
        return "\n".join(out) + "\n"

    out = [f"# {report.get('componentPascal')} implementation review\n\n"]
    out.append("## Verdict\n\n")
    out.append(f"**{report.get('verdict')}** — {report.get('summary')}\n\n")
    out.append("## Evidence reviewed\n\n")
    out.append(table(["artifact", "status", "notes"], report.get("evidenceReviewed", [])))
    out.append("\n## Reviewer self-checks\n\n")
    out.append(table(["id", "question", "status", "answer", "evidence", "followUp"], report.get("reviewSelfChecks", [])))
    out.append("\n")
    out.append(issues("Blocking issues", report.get("blockingIssues", [])))
    out.append("\n")
    out.append(issues("Major issues", report.get("majorIssues", [])))
    out.append("\n")
    out.append(issues("Minor issues", report.get("minorIssues", [])))
    out.append("\n")
    out.append(issues("Nits", report.get("nits", [])))
    out.append("\n## Good / confirmed\n\n")
    good = report.get("good") or []
    out.append("".join(f"- {item}\n" for item in good) if good else "None recorded.\n")
    out.append("\n## Contract coverage matrix\n\n")
    out.append(table(["area", "status", "evidence", "notes"], report.get("contractCoverage", [])))
    out.append("\n## Validation assessment\n\n")
    out.append(table(["command", "result", "triage", "notes"], report.get("validation", [])))
    out.append("\n## Decision follow-up\n\n")
    out.append("".join(f"- {item}\n" for item in report.get("decisionFollowUp", [])) or "None.\n")
    out.append("\n## Recommended next action\n\n")
    out.append(str(report.get("nextAction", "No next action recorded.")) + "\n")
    return "".join(out)


def render_html(report: dict[str, Any], template_path: Path) -> str:
    template = template_path.read_text(encoding="utf-8")
    payload = json.dumps(report, ensure_ascii=False, indent=2).replace('</', '<\\/')
    return template.replace("/*__REVIEW_DATA__*/", payload)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--component", required=True)
    parser.add_argument("--recipe", type=Path)
    parser.add_argument("--decisions", type=Path)
    parser.add_argument("--diff", type=Path)
    parser.add_argument("--final-report", type=Path)
    parser.add_argument("--validation-log", type=Path)
    parser.add_argument("--local-evidence", type=Path, help="Output of collect_review_context.py")
    parser.add_argument("--out", required=True, type=Path, help="Markdown review output")
    parser.add_argument("--html-out", type=Path, help="Optional HTML review output")
    parser.add_argument("--template", type=Path)
    args = parser.parse_args()

    recipe = load_recipe(args.recipe)
    recipe_text = read(args.recipe) if args.recipe else ""
    local_evidence = load_json(args.local_evidence)
    report = scan(
        component=args.component,
        recipe=recipe,
        recipe_text=recipe_text,
        decisions=read(args.decisions),
        diff=read(args.diff),
        final_report=read(args.final_report),
        validation_log=read(args.validation_log),
        local_evidence=local_evidence,
    )

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(markdown(report), encoding="utf-8")
    print(f"Wrote review Markdown: {args.out}")

    if args.html_out:
        template = args.template or Path(__file__).resolve().parent.parent / "assets" / "review-template.html"
        args.html_out.parent.mkdir(parents=True, exist_ok=True)
        args.html_out.write_text(render_html(report, template), encoding="utf-8")
        print(f"Wrote review HTML: {args.html_out}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
