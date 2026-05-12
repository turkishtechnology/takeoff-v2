#!/usr/bin/env python3
"""Collect read-only local evidence for a Takeoff component review.

This script captures repo cut-off, touched files, scope classification, component
source files, and diff excerpts. It does not modify files.
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

MAX_EXCERPT_CHARS = 12000
MAX_DIFF_CHARS = 80000


def run(cmd: list[str], cwd: Path, timeout: int = 20) -> str:
    if not cwd.exists():
        return ""
    try:
        result = subprocess.run(cmd, cwd=str(cwd), text=True, capture_output=True, timeout=timeout, check=False)
    except Exception as exc:  # noqa: BLE001
        return f"ERROR: {exc}"
    return (result.stdout or result.stderr or "").strip()


def git_info(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {"path": str(path), "branch": "Not found", "commit": "Not found", "dirty": "not found", "dirtyFiles": [], "notes": ["Repo path does not exist"]}
    status = run(["git", "status", "--short"], path)
    return {"path": str(path), "branch": run(["git", "branch", "--show-current"], path) or "Unknown", "commit": run(["git", "log", "-1", "--oneline"], path) or "Unknown", "dirty": "dirty" if status else "clean", "dirtyFiles": status.splitlines() if status else [], "notes": []}


def rel(path: Path, base: Path) -> str:
    try:
        return str(path.relative_to(base))
    except ValueError:
        return str(path)


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8", errors="replace")).hexdigest()


def read_file_info(path: Path, base: Path) -> dict[str, Any]:
    info: dict[str, Any] = {"path": rel(path, base), "exists": path.exists()}
    if not path.exists() or not path.is_file():
        return {**info, "status": "not found", "excerpt": ""}
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except Exception as exc:  # noqa: BLE001
        return {**info, "status": "read error", "error": str(exc), "excerpt": ""}
    excerpt = text[:MAX_EXCERPT_CHARS]
    numbered = "\n".join(f"{idx + 1:>5} | {line}" for idx, line in enumerate(excerpt.splitlines()))
    if len(text) > MAX_EXCERPT_CHARS:
        numbered += f"\n\n/* excerpt truncated at {MAX_EXCERPT_CHARS} characters */"
    return {**info, "status": "found", "sizeBytes": path.stat().st_size, "lineCount": len(text.splitlines()), "sha256": sha256_text(text), "excerpt": numbered}


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
    return [read_file_info(path, base) for path in unique]


def parse_name_status(raw: str, repo: str) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    for line in raw.splitlines():
        if not line.strip():
            continue
        parts = line.split("\t")
        status = parts[0]
        paths = parts[1:] or [line]
        rows.append({"repo": repo, "status": status, "path": " -> ".join(paths)})
    return rows


def classify(repo: str, path: str, component: str, spar_primitive: str) -> tuple[str, str]:
    p = path.replace("\\", "/")
    if repo == "takeoff-ui":
        return "forbidden", "takeoff-ui core is read-only"
    if ".github/" in p or p.startswith(".github/"):
        return "forbidden", "workflow scope is forbidden"
    if re.search(r"task[-_ ]?generator|migration|audit|scaffold", p, re.I):
        return "forbidden", "generic infra/audit/migration scope is forbidden"
    if repo == "spar":
        allowed_prefix = f"packages/spar/src/components/{spar_primitive}/"
        return ("conditional", "allowed only for real primitive gap") if p.startswith(allowed_prefix) else ("forbidden", "unrelated spar path")
    if repo == "takeoff-design":
        allowed = {f"packages/tokens/styles/recipes/_{component}.scss", f"packages/tokens/tokens/component/{component}.json"}
        return ("conditional", "selector/token alignment only") if p in allowed else ("forbidden", "unrelated design path")
    if repo == "takeoff-spar":
        allowed_prefixes = [
            f"packages/react-spar/src/components/{component}/",
            f"apps/docs/docs/components/{component}.",
        ]
        allowed_exact = {
            "packages/react-spar/src/components/index.ts",
            "packages/react-spar/src/index.ts",
        }
        if any(p.startswith(prefix) for prefix in allowed_prefixes) or p in allowed_exact or re.search(rf"(^|/){re.escape(component)}\.api\.config\.mjs$", p):
            return "allowed", "component-specific takeoff-spar scope"
        return "forbidden", "unrelated takeoff-spar path"
    return "unknown", "repo not recognized"


def repo_sources(workspace: dict, component: str, spar_primitive: str) -> dict[str, Any]:
    repo_roots = workspace["repoRoots"]
    repos = {
        "takeoff-ui": Path(repo_roots["takeoffUi"]),
        "spar": Path(repo_roots["spar"]),
        "takeoff-design": Path(repo_roots["takeoffDesign"]),
        "takeoff-spar": Path(repo_roots["takeoffSpar"]),
    }
    sources = {
        "takeoffUi": collect_files(repos["takeoff-ui"], [], [(repos["takeoff-ui"] / "packages/core/src/components" / f"tk-{component}", "**/*")]),
        "spar": collect_files(repos["spar"], [], [(repos["spar"] / "packages/spar/src/components" / spar_primitive, "**/*")]),
        "takeoffDesign": collect_files(repos["takeoff-design"], [repos["takeoff-design"] / "packages/tokens/styles/recipes" / f"_{component}.scss", repos["takeoff-design"] / "packages/tokens/tokens/component" / f"{component}.json"], []),
        "takeoffSpar": collect_files(repos["takeoff-spar"], [repos["takeoff-spar"] / "apps/docs/docs/components" / f"{component}.mdx", repos["takeoff-spar"] / "apps/docs/docs/components" / f"{component}.api.config.mjs", repos["takeoff-spar"] / "packages/react-spar/src/components/index.ts", repos["takeoff-spar"] / "packages/react-spar/src/index.ts"], [(repos["takeoff-spar"] / "packages/react-spar/src/components" / component, "**/*")]),
    }
    return sources


def collect(workspace: dict, component: str, spar_primitive: str) -> dict[str, Any]:
    repo_roots = workspace["repoRoots"]
    repos = {
        "takeoff-ui": Path(repo_roots["takeoffUi"]),
        "spar": Path(repo_roots["spar"]),
        "takeoff-design": Path(repo_roots["takeoffDesign"]),
        "takeoff-spar": Path(repo_roots["takeoffSpar"]),
    }
    repo_rows = [{"name": name, **git_info(path)} for name, path in repos.items()]

    touched: list[dict[str, str]] = []
    diff_chunks: list[str] = []
    stat_chunks: list[str] = []
    for name, path in repos.items():
        name_status = "\n".join(filter(None, [run(["git", "diff", "--name-status"], path), run(["git", "diff", "--cached", "--name-status"], path)]))
        for row in parse_name_status(name_status, name):
            scope, reason = classify(name, row["path"], component, spar_primitive)
            row.update({"scope": scope, "reason": reason})
            touched.append(row)
        stat = run(["git", "diff", "--stat"], path)
        if stat:
            stat_chunks.append(f"# {name}\n{stat}")
        patch = run(["git", "diff", "--patch"], path, timeout=30)
        if patch:
            if len(patch) > MAX_DIFF_CHARS:
                patch = patch[:MAX_DIFF_CHARS] + f"\n\n/* {name} diff truncated at {MAX_DIFF_CHARS} characters */"
            diff_chunks.append(f"diff --repo {name}\n{patch}")

    review_checks = [
        {"id": "RW-Q01", "question": "Was the review based on the current user's resolved local workspace, not on a hardcoded path from the original prompt?", "status": "pending", "answer": "Reviewer must confirm.", "evidence": "workspace.resolvedBy + workspace.repoRoots + local evidence timestamp", "followUp": "If blocked, ask for workspaceRoot before giving a verdict."},
        {"id": "V-Q01", "question": "Did I refresh local repo cut-off for all four repos?", "status": "pending", "answer": "Reviewer must confirm.", "evidence": "repos", "followUp": "Max CONDITIONAL if missing."},
        {"id": "V-Q02", "question": "Are touched files allowed, conditional with justification, or forbidden?", "status": "pending", "answer": "Reviewer must confirm.", "evidence": "touchedFiles", "followUp": "Forbidden paths are blockers."},
        {"id": "V-Q03", "question": "Does public API match core + recipe + approved decisions?", "status": "pending", "answer": "Reviewer must confirm.", "evidence": "recipe + sources.takeoffUi + diff", "followUp": "Block or major issue on drift."},
        {"id": "V-Q04", "question": "Does wrapper avoid spar-owned state/a11y/keyboard/focus/SSR behavior?", "status": "pending", "answer": "Reviewer must confirm.", "evidence": "sources.spar + diff", "followUp": "Block responsibility inversion."},
        {"id": "V-Q05", "question": "Do classes/data attrs match design selectors at correct DOM levels?", "status": "pending", "answer": "Reviewer must confirm.", "evidence": "sources.takeoffDesign + diff/tests", "followUp": "Block design contract break."},
        {"id": "V-Q06", "question": "Were decisions followed and new uncertainty surfaced?", "status": "pending", "answer": "Reviewer must confirm.", "evidence": "decisions + diff + final report", "followUp": "Decision drift is major/blocker."},
        {"id": "V-Q07", "question": "Did validation run and are failures triaged?", "status": "pending", "answer": "Reviewer must confirm.", "evidence": "validation logs", "followUp": "Conditional or fail."},
        {"id": "V-Q08", "question": "What evidence could make this verdict wrong, and was it checked?", "status": "pending", "answer": "Reviewer must fill after counterexample pass.", "evidence": "review notes", "followUp": "Lower confidence if not checked."},
    ]

    return {
        "component": component,
        "sparPrimitive": spar_primitive,
        "generatedAt": dt.datetime.now(dt.timezone.utc).isoformat(),
        "repoRoot": workspace.get("workspaceRoot", ""),
        "workspace": workspace,
        "repos": repo_rows,
        "touchedFiles": touched,
        "diffStat": "\n\n".join(stat_chunks),
        "diffExcerpt": "\n\n".join(diff_chunks),
        "sources": repo_sources(workspace, component, spar_primitive),
        "reviewSelfChecks": review_checks,
        "notes": ["Review evidence seed only. Reviewer must complete reviewSelfChecks before final verdict."],
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--component", required=True)
    parser.add_argument("--spar-primitive")
    parser.add_argument("--root", "--workspace-root", dest="root", default=None, help="Optional workspace root override. Falls back to env vars, cache, cwd discovery, then a limited home scan.")
    parser.add_argument("--out", required=True, type=Path, help="Output local evidence JSON")
    parser.add_argument("--diff-out", type=Path, help="Optional patch excerpt output")
    args = parser.parse_args()
    component = args.component.strip().lower()
    spar_primitive = (args.spar_primitive or component).strip().lower()

    try:
        workspace = resolve_workspace(args.root)
    except WorkspaceResolutionError as exc:
        print(str(exc), file=sys.stderr)
        return 2

    data = collect(workspace, component, spar_primitive)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote review local evidence: {args.out}")
    if args.diff_out:
        args.diff_out.parent.mkdir(parents=True, exist_ok=True)
        args.diff_out.write_text(data.get("diffExcerpt", ""), encoding="utf-8")
        print(f"Wrote diff excerpt: {args.diff_out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
