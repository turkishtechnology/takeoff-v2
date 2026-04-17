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
    category: str
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


def make_check(category: str, label: str, path: Path, *, required: bool) -> CheckResult:
    return CheckResult(category=category, label=label, path=str(path), required=required, exists=path.exists())


def dedupe_paths(paths: list[Path]) -> list[str]:
    seen: set[str] = set()
    deduped: list[str] = []

    for path in paths:
        if not path.exists():
            continue

        resolved = str(path)
        if resolved in seen:
            continue

        seen.add(resolved)
        deduped.append(resolved)

    return deduped


def build_read_checklist(
    repo_root: Path,
    takeoff_ui_root: Path,
    takeoff_design_root: Path,
    spar_root: Path,
    derived_names: dict[str, str],
) -> dict[str, list[str]]:
    kebab_name = derived_names["kebab"]
    pascal_name = derived_names["pascal"]

    takeoff_ui_component_root = takeoff_ui_root / f"packages/core/src/components/tk-{kebab_name}"
    takeoff_ui_tests_root = takeoff_ui_component_root / "test"
    spar_component_root = spar_root / f"packages/spar/src/components/{pascal_name}"
    takeoff_spar_component_root = repo_root / f"packages/react-spar/src/components/{kebab_name}"

    takeoff_ui_reads = dedupe_paths(
        [
            takeoff_ui_component_root / f"tk-{kebab_name}.tsx",
            takeoff_ui_component_root / f"tk-{kebab_name}.scss",
            takeoff_ui_component_root / "types.ts",
            *sorted(takeoff_ui_component_root.glob("*.tsx")),
            *sorted(takeoff_ui_component_root.glob("*.scss")),
            *sorted(takeoff_ui_tests_root.glob("*.ts")),
            *sorted(takeoff_ui_tests_root.glob("*.tsx")),
        ]
    )

    spar_reads = dedupe_paths(
        [
            spar_component_root / "index.ts",
            spar_component_root / "types.ts",
            *sorted(spar_component_root.glob("*.ts")),
            *sorted(spar_component_root.glob("*.tsx")),
            *sorted((spar_component_root / "__tests__").glob("*.ts")),
            *sorted((spar_component_root / "__tests__").glob("*.tsx")),
        ]
    )

    takeoff_design_reads = dedupe_paths(
        [
            takeoff_design_root / f"packages/tokens/tokens/component/{kebab_name}.json",
            takeoff_design_root / f"packages/tokens/styles/recipes/_{kebab_name}.scss",
            takeoff_design_root / "packages/tokens/styles/_index.scss",
        ]
    )

    takeoff_spar_reads = dedupe_paths(
        [
            repo_root / "packages/react-spar/src/components/button/Button.tsx",
            repo_root / "packages/react-spar/src/components/button/types.ts",
            repo_root / "packages/react-spar/src/components/button/style.ts",
            *sorted(takeoff_spar_component_root.glob("*.ts")),
            *sorted(takeoff_spar_component_root.glob("*.tsx")),
            repo_root / "packages/react-spar/src/components/index.ts",
            repo_root / "packages/react-spar/src/styling/slot-registry.ts",
            repo_root / "packages/react-spar/README.md",
            repo_root / "apps/docs/docs/theming.mdx",
            repo_root / "apps/docs/src/css/custom.css",
            repo_root / "apps/react-app/src/main.tsx",
        ]
    )

    return {
        "takeoff_ui": takeoff_ui_reads,
        "spar": spar_reads,
        "takeoff_design": takeoff_design_reads,
        "takeoff_spar": takeoff_spar_reads,
    }


def build_checks(repo_root: Path, derived_names: dict[str, str]) -> tuple[dict[str, str], list[CheckResult], dict[str, list[str]]]:
    kebab_name = derived_names["kebab"]
    pascal_name = derived_names["pascal"]

    takeoff_ui_root = repo_root.parent / "takeoff-ui"
    takeoff_design_root = repo_root.parent / "takeoff-design"
    spar_root = repo_root.parent / "spar"

    checks = [
        make_check("takeoff-spar", "takeoff-spar repo root", repo_root / "package.json", required=True),
        make_check("takeoff-spar", "React target package", repo_root / "packages/react-spar/package.json", required=True),
        make_check("takeoff-spar", "live Button adaptation reference", repo_root / "packages/react-spar/src/components/button/Button.tsx", required=True),
        make_check("takeoff-spar", "component export registry", repo_root / "packages/react-spar/src/components/index.ts", required=True),
        make_check("takeoff-spar", "slot-class registry", repo_root / "packages/react-spar/src/styling/slot-registry.ts", required=True),
        make_check("takeoff-spar", "package README", repo_root / "packages/react-spar/README.md", required=True),
        make_check("takeoff-spar", "docs theming guide", repo_root / "apps/docs/docs/theming.mdx", required=True),
        make_check("takeoff-spar", "docs token CSS import", repo_root / "apps/docs/src/css/custom.css", required=True),
        make_check("takeoff-spar", "react app token CSS import entry", repo_root / "apps/react-app/src/main.tsx", required=True),
        make_check("takeoff-ui", "takeoff-ui source repo", takeoff_ui_root, required=True),
        make_check(
            "takeoff-ui",
            "source component directory",
            takeoff_ui_root / f"packages/core/src/components/tk-{kebab_name}",
            required=True,
        ),
        make_check(
            "takeoff-ui",
            "source component implementation",
            takeoff_ui_root / f"packages/core/src/components/tk-{kebab_name}/tk-{kebab_name}.tsx",
            required=True,
        ),
        make_check(
            "takeoff-ui",
            "source component styles",
            takeoff_ui_root / f"packages/core/src/components/tk-{kebab_name}/tk-{kebab_name}.scss",
            required=True,
        ),
        make_check("takeoff-design", "takeoff-design repo", takeoff_design_root, required=True),
        make_check("takeoff-design", "shared tokens package", takeoff_design_root / "packages/tokens/package.json", required=True),
        make_check(
            "takeoff-design",
            "shared component tokens",
            takeoff_design_root / f"packages/tokens/tokens/component/{kebab_name}.json",
            required=False,
        ),
        make_check(
            "takeoff-design",
            "shared recipe",
            takeoff_design_root / f"packages/tokens/styles/recipes/_{kebab_name}.scss",
            required=False,
        ),
        make_check(
            "takeoff-design",
            "shared styles entrypoint",
            takeoff_design_root / "packages/tokens/styles/_index.scss",
            required=True,
        ),
        make_check("spar", "spar repo", spar_root, required=False),
        make_check(
            "spar",
            "matching Spar primitive directory",
            spar_root / f"packages/spar/src/components/{pascal_name}",
            required=False,
        ),
        make_check(
            "takeoff-spar",
            "target component directory",
            repo_root / f"packages/react-spar/src/components/{kebab_name}",
            required=False,
        ),
    ]

    roots = {
        "repo_root": str(repo_root),
        "takeoff_ui_root": str(takeoff_ui_root),
        "takeoff_design_root": str(takeoff_design_root),
        "spar_root": str(spar_root),
    }

    checklist = build_read_checklist(repo_root, takeoff_ui_root, takeoff_design_root, spar_root, derived_names)
    return roots, checks, checklist


def print_text_output(
    component_name: str,
    derived_names: dict[str, str],
    roots: dict[str, str],
    checks: list[CheckResult],
    checklist: dict[str, list[str]],
) -> None:
    print(f"Component: {component_name}")
    print(f"PascalCase: {derived_names['pascal']}")
    print(f"kebab-case: {derived_names['kebab']}")
    print(f"camelCase: {derived_names['camel']}")
    print("")
    print("Resolved roots:")
    print(f"- takeoff-spar: {roots['repo_root']}")
    print(f"- takeoff-ui: {roots['takeoff_ui_root']}")
    print(f"- takeoff-design: {roots['takeoff_design_root']}")
    print(f"- spar: {roots['spar_root']}")
    print("")
    print("Repo discovery policy:")
    print("- Assume sibling repos at ../takeoff-ui, ../takeoff-design, and optionally ../spar.")
    print("- Only ask the user for repo locations if required repos cannot be found locally.")
    print("- Missing takeoff-ui or takeoff-design blocks the task.")
    print("- Missing spar is a warning unless the task depends on a primitive check.")
    print("")
    print("Checks:")

    current_category = None
    for check in checks:
        if check.category != current_category:
            current_category = check.category
            print(f"- [{current_category}]")

        if check.exists:
            status = "FOUND"
        elif check.required:
            status = "MISSING"
        else:
            status = "OPTIONAL MISSING"

        print(f"  - {status}: {check.label}")
        print(f"    {check.path}")

    print("")
    print("Read-first checklist:")
    for category, paths in checklist.items():
        print(f"- [{category}]")
        if not paths:
            print("  - No files discovered")
            continue
        for path in paths:
            print(f"  - {path}")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Verify Takeoff component port prerequisites across takeoff-ui, takeoff-design, spar, and takeoff-spar."
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

    roots, checks, checklist = build_checks(repo_root, derived_names)
    has_required_missing = any(not check.exists and check.required for check in checks)

    if args.json:
        payload = {
            "component_name": args.component_name,
            "derived_names": derived_names,
            "roots": roots,
            "checks": [asdict(check) for check in checks],
            "recommended_reads": checklist,
            "spar_primitive_available": any(
                check.category == "spar" and check.label == "matching Spar primitive directory" and check.exists for check in checks
            ),
            "ok": not has_required_missing,
        }
        print(json.dumps(payload, indent=2))
    else:
        print_text_output(args.component_name, derived_names, roots, checks, checklist)

    return 1 if has_required_missing else 0


if __name__ == "__main__":
    raise SystemExit(main())
