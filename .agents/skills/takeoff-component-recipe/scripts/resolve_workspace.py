#!/usr/bin/env python3
"""Resolve the local Takeoff workspace once.

Returns a workspace dict of the form:

    {
      "workspaceRoot": "<absolute parent workspace path>",
      "repoRoots": {
        "takeoffUi": "<absolute path to takeoff-ui repo>",
        "spar": "<absolute path to spar repo>",
        "takeoffDesign": "<absolute path to takeoff-design repo>",
        "takeoffSpar": "<absolute path to takeoff-spar repo>"
      },
      "resolvedBy": "cli | env | repo-env | cache | cwd | scan",
      "checkedAt": "<iso timestamp>"
    }

Resolution order:
  1. --root / --workspace-root
  2. TAKEOFF_WORKSPACE_ROOT
  3. TAKEOFF_UI_ROOT / SPAR_ROOT / TAKEOFF_DESIGN_ROOT / TAKEOFF_SPAR_ROOT
  4. ~/.takeoff-skills/workspace.json cache
  5. cwd discovery (current dir, parents, parent of repo dirs)
  6. limited scan of common workspace folders under $HOME
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple


REPOS = {
    "takeoffUi": {
        "folder": "takeoff-ui",
        "env": "TAKEOFF_UI_ROOT",
        "markers": ["packages/core/src"],
    },
    "spar": {
        "folder": "spar",
        "env": "SPAR_ROOT",
        "markers": ["packages/spar/src"],
    },
    "takeoffDesign": {
        "folder": "takeoff-design",
        "env": "TAKEOFF_DESIGN_ROOT",
        "markers": ["packages/tokens"],
    },
    "takeoffSpar": {
        "folder": "takeoff-spar",
        "env": "TAKEOFF_SPAR_ROOT",
        "markers": ["packages/react-spar/src"],
    },
}

CACHE_PATH = Path.home() / ".takeoff-skills" / "workspace.json"


class WorkspaceResolutionError(RuntimeError):
    pass


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def safe_resolve(path: Path) -> Path:
    return path.expanduser().resolve()


def safe_exists(path: Path) -> bool:
    try:
        return path.exists()
    except OSError:
        return False


def is_repo_root(repo_key: str, path: Path) -> bool:
    spec = REPOS[repo_key]
    return all(safe_exists(path / marker) for marker in spec["markers"])


def validate_repo_roots(repo_roots: Dict[str, str]) -> Tuple[bool, List[str]]:
    missing: List[str] = []
    for repo_key, spec in REPOS.items():
        raw = repo_roots.get(repo_key)
        if not raw:
            missing.append(f"{repo_key}: missing path")
            continue
        try:
            path = safe_resolve(Path(raw))
        except OSError:
            missing.append(f"{repo_key}: path could not be resolved: {raw}")
            continue
        if not safe_exists(path):
            missing.append(f"{repo_key}: path does not exist: {path}")
            continue
        if not is_repo_root(repo_key, path):
            marker_list = ", ".join(spec["markers"])
            missing.append(f"{repo_key}: required marker not found under {path}: {marker_list}")
    return len(missing) == 0, missing


def build_from_workspace_root(root: Path, resolved_by: str) -> Optional[dict]:
    try:
        root = safe_resolve(root)
    except OSError:
        return None
    repo_roots = {
        repo_key: str(root / spec["folder"])
        for repo_key, spec in REPOS.items()
    }
    ok, _missing = validate_repo_roots(repo_roots)
    if not ok:
        return None
    resolved: Dict[str, str] = {}
    for key, value in repo_roots.items():
        try:
            resolved[key] = str(safe_resolve(Path(value)))
        except OSError:
            return None
    return {
        "workspaceRoot": str(root),
        "repoRoots": resolved,
        "resolvedBy": resolved_by,
        "checkedAt": now_iso(),
    }


def build_from_repo_roots(repo_roots: Dict[str, str], resolved_by: str) -> Optional[dict]:
    ok, _missing = validate_repo_roots(repo_roots)
    if not ok:
        return None
    resolved = {
        key: str(safe_resolve(Path(value)))
        for key, value in repo_roots.items()
    }
    try:
        common = os.path.commonpath(list(resolved.values()))
    except ValueError:
        common = ""
    return {
        "workspaceRoot": common,
        "repoRoots": resolved,
        "resolvedBy": resolved_by,
        "checkedAt": now_iso(),
    }


def load_cache() -> Optional[dict]:
    if not CACHE_PATH.exists():
        return None
    try:
        data = json.loads(CACHE_PATH.read_text(encoding="utf-8"))
    except Exception:
        return None
    repo_roots = data.get("repoRoots")
    if not isinstance(repo_roots, dict):
        return None
    return build_from_repo_roots(repo_roots, "cache")


def save_cache(workspace: dict) -> None:
    try:
        CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
        CACHE_PATH.write_text(
            json.dumps(workspace, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
    except Exception:
        pass


def unique_paths(paths: Iterable[Path]) -> List[Path]:
    seen = set()
    out: List[Path] = []
    for path in paths:
        try:
            resolved = safe_resolve(path)
        except Exception:
            continue
        key = str(resolved)
        if key in seen:
            continue
        # Skip filesystem root — we never want to enumerate `/` children.
        if str(resolved) in {"/", ""}:
            continue
        seen.add(key)
        out.append(resolved)
    return out


def cwd_candidates(cwd: Path) -> List[Path]:
    cwd = safe_resolve(cwd)
    candidates: List[Path] = []
    candidates.append(cwd)
    candidates.extend(cwd.parents)
    for parent in [cwd, *cwd.parents]:
        for spec in REPOS.values():
            if parent.name == spec["folder"]:
                candidates.append(parent.parent)
    return unique_paths(candidates)


def safe_iter_dirs(path: Path) -> List[Path]:
    try:
        return [child for child in path.iterdir() if child.is_dir()]
    except Exception:
        return []


def limited_home_scan_candidates(cwd: Path) -> List[Path]:
    home = Path.home()
    base_dirs = [
        cwd,
        *cwd.parents,
        home,
        home / "Desktop",
        home / "Documents",
        home / "Developer",
        home / "Developers",
        home / "Projects",
        home / "projects",
        home / "Workspace",
        home / "workspace",
        home / "Workspaces",
        home / "workspaces",
        home / "Code",
        home / "code",
        home / "src",
        home / "dev",
        home / "repos",
    ]
    candidates: List[Path] = []
    for base in unique_paths(base_dirs):
        if not base.exists() or not base.is_dir():
            continue
        candidates.append(base)
        for child in safe_iter_dirs(base):
            candidates.append(child)
        if base in [home, home / "Desktop", home / "Documents"]:
            for child in safe_iter_dirs(base):
                for grandchild in safe_iter_dirs(child):
                    candidates.append(grandchild)
    return unique_paths(candidates)


def find_workspaces(candidates: Iterable[Path], resolved_by: str) -> List[dict]:
    found: List[dict] = []
    seen = set()
    for candidate in candidates:
        workspace = build_from_workspace_root(candidate, resolved_by)
        if not workspace:
            continue
        key = json.dumps(workspace["repoRoots"], sort_keys=True)
        if key in seen:
            continue
        seen.add(key)
        found.append(workspace)
    return found


def explicit_root_resolution(raw_root: Optional[str]) -> Optional[dict]:
    if not raw_root:
        return None
    root = safe_resolve(Path(raw_root))
    candidates = [root, root.parent, *root.parents]
    matches = find_workspaces(candidates, "cli")
    if len(matches) == 1:
        return matches[0]
    if len(matches) > 1:
        raise WorkspaceResolutionError(format_multiple(matches))
    raise WorkspaceResolutionError(
        format_not_found(
            extra=f"Verilen --root geçerli bir Takeoff workspace olarak doğrulanamadı: {root}"
        )
    )


def env_resolution() -> Optional[dict]:
    raw_root = os.environ.get("TAKEOFF_WORKSPACE_ROOT")
    if raw_root:
        workspace = build_from_workspace_root(Path(raw_root), "env")
        if workspace:
            return workspace
        raise WorkspaceResolutionError(
            format_not_found(
                extra=f"TAKEOFF_WORKSPACE_ROOT geçersiz görünüyor: {raw_root}"
            )
        )

    repo_roots: Dict[str, str] = {}
    any_repo_env = False
    for repo_key, spec in REPOS.items():
        raw = os.environ.get(spec["env"])
        if raw:
            any_repo_env = True
            repo_roots[repo_key] = raw

    if any_repo_env:
        workspace = build_from_repo_roots(repo_roots, "repo-env")
        if workspace:
            return workspace
        ok, missing = validate_repo_roots(repo_roots)
        raise WorkspaceResolutionError(
            format_not_found(
                extra="Repo env değişkenleri eksik veya geçersiz:\n" + "\n".join(f"- {m}" for m in missing)
            )
        )
    return None


def resolve_workspace(raw_root: Optional[str] = None, use_cache: bool = True) -> dict:
    explicit = explicit_root_resolution(raw_root)
    if explicit:
        save_cache(explicit)
        return explicit

    env = env_resolution()
    if env:
        save_cache(env)
        return env

    if use_cache:
        cached = load_cache()
        if cached:
            return cached

    cwd = safe_resolve(Path.cwd())

    cwd_matches = find_workspaces(cwd_candidates(cwd), "cwd")
    if len(cwd_matches) == 1:
        save_cache(cwd_matches[0])
        return cwd_matches[0]
    if len(cwd_matches) > 1:
        raise WorkspaceResolutionError(format_multiple(cwd_matches))

    scan_matches = find_workspaces(limited_home_scan_candidates(cwd), "scan")
    if len(scan_matches) == 1:
        save_cache(scan_matches[0])
        return scan_matches[0]
    if len(scan_matches) > 1:
        raise WorkspaceResolutionError(format_multiple(scan_matches))

    raise WorkspaceResolutionError(format_not_found())


def format_multiple(matches: List[dict]) -> str:
    lines = [
        "WORKSPACE_MULTIPLE_CANDIDATES",
        "",
        "Birden fazla Takeoff workspace adayı buldum. Hangisini kullanmalıyım?",
        "",
    ]
    for index, match in enumerate(matches, start=1):
        lines.append(f"{index}. {match['workspaceRoot']}")
    lines.extend(
        [
            "",
            "Lütfen sadece birini şu formatta gönder:",
            "workspaceRoot=/absolute/path/to/workspace",
        ]
    )
    return "\n".join(lines)


def format_not_found(extra: str = "") -> str:
    lines = [
        "WORKSPACE_ROOT_REQUIRED",
        "",
        "Local Takeoff workspace kökünü bulamadım.",
        "",
        "Aradığım yapı şu:",
        "<workspaceRoot>/",
        "  takeoff-ui/",
        "  spar/",
        "  takeoff-design/",
        "  takeoff-spar/",
        "",
        "Lütfen bir kez şu formatta gönder:",
        "workspaceRoot=/absolute/path/to/workspace",
        "",
        "Eğer repolar aynı klasör altında değilse şu formatı kullan:",
        "takeoffUiRoot=/absolute/path/to/takeoff-ui",
        "sparRoot=/absolute/path/to/spar",
        "takeoffDesignRoot=/absolute/path/to/takeoff-design",
        "takeoffSparRoot=/absolute/path/to/takeoff-spar",
    ]
    if extra:
        lines.extend(["", "Detay:", extra])
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Resolve local Takeoff workspace once.")
    parser.add_argument("--root", "--workspace-root", dest="root", default=None)
    parser.add_argument("--no-cache", action="store_true")
    parser.add_argument("--check", action="store_true", help="Resolve and validate only.")
    args = parser.parse_args()

    try:
        workspace = resolve_workspace(args.root, use_cache=not args.no_cache)
    except WorkspaceResolutionError as exc:
        print(str(exc), file=sys.stderr)
        return 2

    print(json.dumps(workspace, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
