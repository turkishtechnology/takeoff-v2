#!/usr/bin/env python3

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import asdict, dataclass
from pathlib import Path


@dataclass
class CheckResult:
    label: str
    path: str
    required: bool
    exists: bool


def split_words(raw_name: str) -> list[str]:
    normalized_name = re.sub(r"([a-z0-9])([A-Z])", r"\1 \2", raw_name.strip())
    normalized_name = re.sub(r"[^A-Za-z0-9]+", " ", normalized_name)
    return [word for word in normalized_name.split() if word]


def derive_names(raw_name: str) -> dict[str, str]:
    words = split_words(raw_name)
    if not words:
        raise ValueError("Component name must contain at least one alphanumeric character.")

    lowercase_words = [word.lower() for word in words]

    return {
        "pascal": "".join(word.capitalize() for word in lowercase_words),
        "kebab": "-".join(lowercase_words),
        "camel": lowercase_words[0] + "".join(word.capitalize() for word in lowercase_words[1:]),
    }


def make_check(label: str, path: Path, *, required: bool) -> CheckResult:
    return CheckResult(label=label, path=str(path), required=required, exists=path.exists())


def build_checks(repo_root: Path, kebab_name: str) -> tuple[dict[str, str], list[CheckResult]]:
    takeoff_ui_root = repo_root.parent / "takeoff-ui"
    takeoff_design_root = repo_root.parent / "takeoff-design"

    checks = [
        make_check("takeoff-spar React target package", repo_root / "packages/react-spar/package.json", required=True),
        make_check("takeoff-spar React adaptation reference", repo_root / "packages/react-spar/src/components/button/Button.tsx", required=True),
        make_check("takeoff-spar slot registry", repo_root / "packages/react-spar/src/theme/recipes.ts", required=True),
        make_check("takeoff-ui source-reference repo", takeoff_ui_root, required=True),
        make_check(
            "takeoff-ui source component implementation",
            takeoff_ui_root / f"packages/core/src/components/tk-{kebab_name}/tk-{kebab_name}.tsx",
            required=True,
        ),
        make_check(
            "takeoff-ui source component styles",
            takeoff_ui_root / f"packages/core/src/components/tk-{kebab_name}/tk-{kebab_name}.scss",
            required=True,
        ),
        make_check("takeoff-design shared style package", takeoff_design_root / "packages/tokens/package.json", required=True),
        make_check(
            "takeoff-design shared component token json",
            takeoff_design_root / f"packages/tokens/tokens/component/{kebab_name}.json",
            required=False,
        ),
        make_check(
            "takeoff-design shared component recipe",
            takeoff_design_root / f"packages/tokens/styles/recipes/_{kebab_name}.scss",
            required=False,
        ),
        make_check(
            "takeoff-design shared styles entrypoint",
            takeoff_design_root / "packages/tokens/styles/_index.scss",
            required=True,
        ),
        make_check(
            "takeoff-spar React target component folder",
            repo_root / f"packages/react-spar/src/components/{kebab_name}",
            required=False,
        ),
    ]

    roots = {
        "repo_root": str(repo_root),
        "takeoff_ui_root": str(takeoff_ui_root),
        "takeoff_design_root": str(takeoff_design_root),
    }

    return roots, checks


def print_text_output(component_name: str, derived_names: dict[str, str], roots: dict[str, str], checks: list[CheckResult]) -> None:
    print(f"Component: {component_name}")
    print(f"PascalCase: {derived_names['pascal']}")
    print(f"kebab-case: {derived_names['kebab']}")
    print(f"camelCase: {derived_names['camel']}")
    print("")
    print("Resolved roots:")
    print(f"- takeoff-spar (React delivery): {roots['repo_root']}")
    print(f"- takeoff-ui (source reference): {roots['takeoff_ui_root']}")
    print(f"- takeoff-design (shared styles): {roots['takeoff_design_root']}")
    print("")
    print("Checks:")

    for check in checks:
        if check.exists:
            status = "FOUND"
        elif check.required:
            status = "MISSING"
        else:
            status = "OPTIONAL MISSING"

        print(f"- {status}: {check.label}")
        print(f"  {check.path}")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Verify Takeoff component port prerequisites across the takeoff-ui source reference, the shared takeoff-design tokens package, and the takeoff-spar React delivery package."
    )
    parser.add_argument("component_name", help="Component name in PascalCase, camelCase, kebab-case, or spaced form.")
    parser.add_argument(
        "--repo-root",
        default=".",
        help="Path to the takeoff-spar repo root. Defaults to the current working directory.",
    )
    parser.add_argument("--json", action="store_true", help="Emit machine-readable JSON output.")
    args = parser.parse_args()

    repo_root = Path(args.repo_root).resolve()

    try:
        derived_names = derive_names(args.component_name)
    except ValueError as error:
        print(str(error), file=sys.stderr)
        return 2

    roots, checks = build_checks(repo_root, derived_names["kebab"])
    has_required_missing = any(not check.exists and check.required for check in checks)

    if args.json:
        payload = {
            "component_name": args.component_name,
            "derived_names": derived_names,
            "roots": roots,
            "checks": [asdict(check) for check in checks],
            "ok": not has_required_missing,
        }
        print(json.dumps(payload, indent=2))
    else:
        print_text_output(args.component_name, derived_names, roots, checks)

    return 1 if has_required_missing else 0


if __name__ == "__main__":
    raise SystemExit(main())
