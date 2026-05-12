#!/usr/bin/env python3
"""Read-only Takeoff component context collector.

The output is a seed JSON file for the component recipe. It records repo
metadata, component-relevant local files, short excerpts, and self-check gates.
It does not infer or finalize the component contract.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parent))
from resolve_workspace import WorkspaceResolutionError, resolve_workspace  # noqa: E402

MAX_EXCERPT_CHARS = 16000
MAX_MATCHES = 80

MATCH_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    ("prop/type", re.compile(r"(@Prop|Prop\(|interface\s+\w+Props|type\s+\w+Props|export\s+interface|export\s+type)", re.I)),
    ("event", re.compile(r"(tk-[\w-]+|CustomEvent|dispatchEvent|EventEmitter|createEvent|on[A-Z]\w+Change)", re.I)),
    ("slot/part", re.compile(r"(<slot|slot=|part=|Object\.assign|displayName|\.Root|\.Trigger|\.Content|\.Item)", re.I)),
    ("class/data", re.compile(r"(tk-[\w-]+|data-[\w-]+|Host\(|class(Name)?=|selector|recipe)", re.I)),
    ("headless", re.compile(r"(useId|aria-|role=|onKeyDown|keydown|KeyboardEvent|focus|forceMount|hidden=\"?until-found|controlled|uncontrolled|defaultValue|value)", re.I)),
    ("export", re.compile(r"(export\s+(const|function|class|type|interface)|export\s+\*)", re.I)),
]


def run(cmd: list[str], cwd: Path) -> str:
    try:
        result = subprocess.run(cmd, cwd=str(cwd), text=True, capture_output=True, timeout=8, check=False)
    except Exception as exc:  # noqa: BLE001 - diagnostics helper
        return f"ERROR: {exc}"
    output = (result.stdout or result.stderr or "").strip()
    return output if output else ""


def git_info(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {
            "path": str(path),
            "branch": "Not found",
            "commit": "Not found",
            "dirty": "not found",
            "dirtyFiles": [],
            "notes": ["Repo path does not exist"],
        }
    status = run(["git", "status", "--short"], path)
    return {
        "path": str(path),
        "branch": run(["git", "branch", "--show-current"], path) or "Unknown",
        "commit": run(["git", "log", "-1", "--oneline"], path) or "Unknown",
        "dirty": "dirty" if status else "clean",
        "dirtyFiles": status.splitlines() if status else [],
        "notes": [],
    }


def rel(path: Path, base: Path) -> str:
    try:
        return str(path.relative_to(base))
    except ValueError:
        return str(path)


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8", errors="replace")).hexdigest()


def line_number_excerpt(text: str, max_chars: int = MAX_EXCERPT_CHARS) -> str:
    clipped = text[:max_chars]
    lines = clipped.splitlines()
    numbered = "\n".join(f"{idx + 1:>5} | {line}" for idx, line in enumerate(lines))
    if len(text) > max_chars:
        numbered += f"\n\n/* excerpt truncated at {max_chars} characters */"
    return numbered


def find_matches(text: str) -> list[dict[str, Any]]:
    matches: list[dict[str, Any]] = []
    for line_no, line in enumerate(text.splitlines(), start=1):
        for kind, pattern in MATCH_PATTERNS:
            if pattern.search(line):
                matches.append({"line": line_no, "kind": kind, "text": line.strip()[:240]})
                break
        if len(matches) >= MAX_MATCHES:
            break
    return matches


def file_info(path: Path, base: Path) -> dict[str, Any]:
    info: dict[str, Any] = {"path": rel(path, base), "exists": path.exists()}
    if not path.exists() or not path.is_file():
        info.update({"status": "not found", "excerpt": "", "matches": []})
        return info
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except Exception as exc:  # noqa: BLE001
        info.update({"status": "read error", "error": str(exc), "excerpt": "", "matches": []})
        return info
    info.update(
        {
            "status": "found",
            "sizeBytes": path.stat().st_size,
            "lineCount": len(text.splitlines()),
            "sha256": sha256_text(text),
            "excerpt": line_number_excerpt(text),
            "matches": find_matches(text),
        }
    )
    return info


def collect_files(base: Path, candidates: list[Path], globs: list[tuple[Path, str]]) -> list[dict[str, Any]]:
    found: list[Path] = []
    for path in candidates:
        if path.exists() and path.is_file():
            found.append(path)
    for root, pattern in globs:
        if root.exists():
            found.extend(sorted(p for p in root.glob(pattern) if p.is_file()))
    unique: list[Path] = []
    seen: set[Path] = set()
    for path in found:
        resolved = path.resolve()
        if resolved not in seen:
            seen.add(resolved)
            unique.append(path)
    return [file_info(path, base) for path in unique]


def required_path(path: Path, base: Path, required: bool = True) -> dict[str, Any]:
    return {"path": rel(path, base), "absolutePath": str(path), "exists": path.exists(), "required": required}


def repo_sources(workspace: dict, component: str, spar_primitive: str) -> tuple[list[dict[str, Any]], dict[str, Any], dict[str, Any]]:
    repo_roots = workspace["repoRoots"]
    repos = {
        "takeoff-ui": Path(repo_roots["takeoffUi"]),
        "spar": Path(repo_roots["spar"]),
        "takeoff-design": Path(repo_roots["takeoffDesign"]),
        "takeoff-spar": Path(repo_roots["takeoffSpar"]),
    }
    repo_rows = [{"name": name, **git_info(path)} for name, path in repos.items()]

    takeoff_ui = repos["takeoff-ui"]
    core_dir = takeoff_ui / "packages" / "core" / "src" / "components" / f"tk-{component}"

    spar = repos["spar"]
    spar_dir = spar / "packages" / "spar" / "src" / "components" / spar_primitive

    design = repos["takeoff-design"]
    design_recipe = design / "packages" / "tokens" / "styles" / "recipes" / f"_{component}.scss"
    design_token = design / "packages" / "tokens" / "tokens" / "component" / f"{component}.json"

    takeoff_spar = repos["takeoff-spar"]
    wrapper_dir = takeoff_spar / "packages" / "react-spar" / "src" / "components" / component
    docs_file = takeoff_spar / "apps" / "docs" / "docs" / "components" / f"{component}.mdx"
    api_config = takeoff_spar / "apps" / "docs" / "docs" / "components" / f"{component}.api.config.mjs"
    components_index = takeoff_spar / "packages" / "react-spar" / "src" / "components" / "index.ts"
    package_index = takeoff_spar / "packages" / "react-spar" / "src" / "index.ts"

    sources = {
        "takeoffUi": {
            "requiredPaths": [required_path(core_dir, takeoff_ui)],
            "files": collect_files(takeoff_ui, [], [(core_dir, "**/*")]),
            "findings": [f"Expected core directory: {core_dir}", "Fill findings after inspecting local excerpts."],
        },
        "spar": {
            "requiredPaths": [required_path(spar_dir, spar)],
            "files": collect_files(spar, [], [(spar_dir, "**/*")]),
            "findings": [f"Expected spar primitive directory: {spar_dir}", "Fill exported parts/state/a11y findings after inspection."],
        },
        "takeoffDesign": {
            "requiredPaths": [required_path(design_recipe, design), required_path(design_token, design, required=False)],
            "files": collect_files(design, [design_recipe, design_token], []),
            "findings": [f"Expected recipe: {design_recipe}", f"Expected token JSON if present: {design_token}"],
        },
        "takeoffSpar": {
            "requiredPaths": [required_path(wrapper_dir, takeoff_spar, required=False), required_path(docs_file, takeoff_spar, required=False), required_path(api_config, takeoff_spar, required=False), required_path(components_index, takeoff_spar), required_path(package_index, takeoff_spar, required=False)],
            "files": collect_files(takeoff_spar, [docs_file, api_config, components_index, package_index], [(wrapper_dir, "**/*")]),
            "findings": [f"Expected wrapper directory: {wrapper_dir}", f"Expected docs file: {docs_file}"],
        },
    }
    local = {
        "required": True,
        "complete": all((repos[name]).exists() for name in repos),
        "repoRoot": workspace.get("workspaceRoot", ""),
        "repoRoots": dict(repo_roots),
        "resolvedBy": workspace.get("resolvedBy", "unknown"),
        "note": "Seed was collected from local paths. Recipe author must inspect excerpts and complete evidence ledger before marking ready.",
    }
    return repo_rows, sources, local


def pascal_case(name: str) -> str:
    return "".join(part.capitalize() for part in name.replace("_", "-").split("-") if part)


def seed_self_checks() -> list[dict[str, str]]:
    return [
        {"id": "W-Q01", "question": "Did I resolve the user's local workspace without relying on an author-specific hardcoded path?", "status": "pending", "answer": "Fill after workspace resolution.", "evidence": "workspace.resolvedBy + workspace.repoRoots", "followUp": "If blocked, ask the user for workspaceRoot or per-repo roots before continuing."},
        {"id": "W-Q02", "question": "Did I verify all four local repos with required markers before reading component contracts?", "status": "pending", "answer": "Fill after marker validation.", "evidence": "workspace.repoRoots + marker validation", "followUp": "If any marker is missing, stop and ask for corrected repo path."},
        {"id": "R-Q01", "question": "Did I inspect local takeoff-ui core files for this component?", "status": "pending", "answer": "Fill after analysis.", "evidence": "sources.takeoffUi.files", "followUp": "Stop if absent and no user-approved fallback exists."},
        {"id": "R-Q02", "question": "Are proposed React prop names traceable to core or approved decisions?", "status": "pending", "answer": "Fill after API table.", "evidence": "api + evidenceLedger", "followUp": "Unsupported props become Decision Needed."},
        {"id": "R-Q03", "question": "Are web component event names and payloads traceable to core?", "status": "pending", "answer": "Fill after events table.", "evidence": "events + evidenceLedger", "followUp": "Unknown payload blocks payload-specific implementation."},
        {"id": "R-Q04", "question": "Did I inspect spar primitive exports, tests, and headless behavior?", "status": "pending", "answer": "Fill after spar analysis.", "evidence": "sources.spar.files", "followUp": "Do not assert compatibility without evidence."},
        {"id": "R-Q05", "question": "Would the wrapper plan duplicate spar-owned state/a11y/keyboard/focus/SSR behavior?", "status": "pending", "answer": "Fill after compatibility pass.", "evidence": "sparCompatibility", "followUp": "Mark Spar gap or block duplicate behavior."},
        {"id": "R-Q06", "question": "Did I inspect takeoff-design selectors/tokens and derive DOM levels from them?", "status": "pending", "answer": "Fill after design analysis.", "evidence": "sources.takeoffDesign.files + domContract", "followUp": "Unknown selectors become Design gap/Decision Needed."},
        {"id": "R-Q07", "question": "Did I inspect takeoff-spar wrapper conventions for exports, className, slotProps/classNames, tests, and docs?", "status": "pending", "answer": "Fill after wrapper pattern analysis.", "evidence": "sources.takeoffSpar.files", "followUp": "Do not invent patterns."},
        {"id": "R-Q08", "question": "Did I search for contradictions across core, spar, design, and wrapper?", "status": "pending", "answer": "Fill after contradiction pass.", "evidence": "contradictions", "followUp": "Contradictions become decisions or gaps."},
        {"id": "R-Q09", "question": "Did I convert unsupported assumptions to Decision Needed or risks?", "status": "pending", "answer": "Fill before finalizing.", "evidence": "assumptions + decisions + risks", "followUp": "Recipe is not ready with hidden assumptions."},
    ]


def source_coverage_ledger(sources: dict[str, Any]) -> list[dict[str, Any]]:
    labels = {
        "takeoffUi": "takeoff-ui core local source inspected",
        "spar": "spar primitive local source inspected",
        "takeoffDesign": "takeoff-design local recipe/tokens inspected",
        "takeoffSpar": "takeoff-spar local wrapper/patterns inspected",
    }
    ledger = []
    for idx, key in enumerate(["takeoffUi", "spar", "takeoffDesign", "takeoffSpar"], start=1):
        source = sources.get(key) or {}
        files = source.get("files") or []
        ledger.append(
            {
                "id": f"E{idx:03d}",
                "claim": labels[key],
                "repo": key,
                "path": "; ".join(item.get("path", "") for item in files[:5]) or "Not found",
                "lines": "excerpted in source files" if files else "Unknown",
                "evidence": f"{len(files)} file(s) collected. Inspect before deriving contract.",
                "status": "Direct evidence" if files else "Unknown",
                "confidence": "Medium" if files else "Low",
                "decisionId": None,
            }
        )
    return ledger


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--component", required=True, help="Component folder name, for example accordion")
    parser.add_argument("--spar-primitive", help="Spar primitive folder name; defaults to component")
    parser.add_argument("--root", "--workspace-root", dest="root", default=None, help="Optional workspace root override. Falls back to env vars, cache, cwd discovery, then a limited home scan.")
    parser.add_argument("--out", required=True, type=Path, help="Output recipe seed JSON")
    args = parser.parse_args()

    component = args.component.strip().lower()
    spar_primitive = (args.spar_primitive or component).strip().lower()

    try:
        workspace = resolve_workspace(args.root)
    except WorkspaceResolutionError as exc:
        print(str(exc), file=sys.stderr)
        return 2

    repos, sources, local = repo_sources(workspace, component, spar_primitive)

    data: dict[str, Any] = {
        "component": component,
        "componentPascal": pascal_case(component),
        "sparPrimitive": spar_primitive,
        "generatedAt": dt.datetime.now(dt.timezone.utc).isoformat(),
        "repoRoot": workspace.get("workspaceRoot", ""),
        "workspace": workspace,
        "summary": "Seed context collected from local repos. Fill contract tables only after inspecting excerpts and completing self-check gates.",
        "localEvidence": local,
        "repos": repos,
        "sources": sources,
        "evidenceLedger": source_coverage_ledger(sources),
        "selfChecks": seed_self_checks(),
        "contradictions": [],
        "assumptions": [],
        "api": [],
        "events": [],
        "compound": {"root": pascal_case(component), "parts": [], "internalOnly": [], "tree": "Unknown"},
        "domContract": [],
        "sparCompatibility": [],
        "implementationPlan": [],
        "tests": [],
        "docs": [],
        "validation": [
            {"command": "pnpm install", "required": True, "notes": "Use pnpm because pnpm-lock.yaml is expected."},
            {"command": f"pnpm exec vitest run {component}", "required": True, "notes": "Component-focused tests."},
            {"command": "pnpm exec vitest run", "required": True, "notes": "Full test suite."},
            {"command": "pnpm exec tsc --noEmit", "required": True, "notes": "TypeScript validation."},
            {"command": "pnpm exec eslint .", "required": True, "notes": "Lint validation."},
            {"command": "pnpm build", "required": True, "notes": "Build validation."},
        ],
        "decisions": [],
        "risks": [],
        "overviewBlocks": [
            {"type": "callout", "tone": "warn", "title": "Seed only", "body": "This file is not a finished recipe. Complete evidenceLedger, selfChecks, contract tables, decisions, and risks before implementation."}
        ],
    }

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote seed recipe JSON: {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
