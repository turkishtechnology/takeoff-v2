#!/usr/bin/env python3

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path


def split_words(raw_name: str) -> list[str]:
    normalized_name = re.sub(r"([a-z0-9])([A-Z])", r"\1 \2", raw_name.strip())
    normalized_name = re.sub(r"[^A-Za-z0-9]+", " ", normalized_name)
    return [word for word in normalized_name.split() if word]


def to_kebab_case(raw_name: str) -> str:
    words = split_words(raw_name)
    if not words:
        raise ValueError("Component name must contain at least one alphanumeric character.")
    return "-".join(word.lower() for word in words)


def read_text_if_exists(path: Path) -> str | None:
    if not path.exists():
        return None
    return path.read_text(encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Verify the shared takeoff-design style output and the takeoff-spar React package artifacts after a component port."
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
        component_name = to_kebab_case(args.component_name)
    except ValueError as error:
        print(str(error), file=sys.stderr)
        return 2

    takeoff_design_root = repo_root.parent / "takeoff-design" / "packages/tokens"
    takeoff_spar_root = repo_root / "packages/react-spar"

    theme_css_path = takeoff_design_root / "dist/css/default/theme.css"
    react_dist_root = takeoff_spar_root / "dist"
    docs_css_path = repo_root / "apps/docs/src/css/custom.css"
    demo_main_path = repo_root / "apps/react-app/src/main.tsx"

    theme_css_contents = read_text_if_exists(theme_css_path)
    docs_css_contents = read_text_if_exists(docs_css_path)
    demo_main_contents = read_text_if_exists(demo_main_path)

    theme_selector = f".tk-{component_name}"
    expected_import = "@takeoff-design/tokens/css/default/theme.css"

    emitted_css_files = []
    if react_dist_root.exists():
        emitted_css_files = [str(path) for path in react_dist_root.rglob("*.css")]

    results = {
        "component_name": component_name,
        "theme_css_exists": theme_css_path.exists(),
        "theme_css_path": str(theme_css_path),
        "theme_selector_found": theme_css_contents is not None and theme_selector in theme_css_contents,
        "react_dist_exists": react_dist_root.exists(),
        "react_dist_path": str(react_dist_root),
        "react_dist_css_files": emitted_css_files,
        "docs_import_present": docs_css_contents is not None and expected_import in docs_css_contents,
        "demo_import_present": demo_main_contents is not None and expected_import in demo_main_contents,
    }

    ok = (
        results["theme_css_exists"]
        and results["theme_selector_found"]
        and results["react_dist_exists"]
        and not results["react_dist_css_files"]
        and results["docs_import_present"]
        and results["demo_import_present"]
    )

    results["ok"] = ok

    if args.json:
        print(json.dumps(results, indent=2))
    else:
        print(f"Component selector: {theme_selector}")
        print("")
        print(f"- {'OK' if results['theme_css_exists'] else 'MISSING'}: {results['theme_css_path']}")
        print(
            f"- {'OK' if results['theme_selector_found'] else 'MISSING'}: selector present in shared built theme.css"
        )
        print(f"- {'OK' if results['react_dist_exists'] else 'MISSING'}: {results['react_dist_path']}")
        print(
            f"- {'OK' if not results['react_dist_css_files'] else 'UNEXPECTED'}: no CSS files emitted in the React package dist"
        )
        if results["react_dist_css_files"]:
            for css_file in results["react_dist_css_files"]:
                print(f"  {css_file}")
        print(
            f"- {'OK' if results['docs_import_present'] else 'MISSING'}: docs imports shared token CSS {expected_import}"
        )
        print(
            f"- {'OK' if results['demo_import_present'] else 'MISSING'}: react app imports shared token CSS {expected_import}"
        )

    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
