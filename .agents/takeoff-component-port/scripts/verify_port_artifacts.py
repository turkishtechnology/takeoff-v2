#!/usr/bin/env python3

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path


EXPECTED_TOKEN_IMPORT = "@takeoff-design/tokens/css/default/theme.css"
STALE_STYLE_IMPORT = "@takeoff-ui/react-spar/styles"
STENCIL_EVENT_NAME_PATTERN = re.compile(r"\btk-(?:click|[a-z0-9-]+(?:change|selected))\b")
REACT_TK_CALLBACK_PATTERN = re.compile(r"\bonTk[A-Z][A-Za-z0-9]*\b")


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


def read_text_if_exists(path: Path) -> str | None:
    if not path.exists():
        return None
    return path.read_text(encoding="utf-8")


def extract_rendered_class_names(text: str | None) -> set[str]:
    if not text:
        return set()
    return set(re.findall(r"tk-[a-z0-9-]+", text))


def extract_selector_class_names(text: str | None) -> set[str]:
    if not text:
        return set()
    return set(re.findall(r"(?<=\.)tk-[a-z0-9-]+", text))


def find_text_hits(paths: list[Path], needle: str) -> list[str]:
    hits: list[str] = []
    for path in paths:
        text = read_text_if_exists(path)
        if text is None:
            continue
        if needle in text:
            hits.append(str(path))
    return hits


def find_pattern_hits(paths: list[Path], pattern: re.Pattern[str]) -> list[str]:
    hits: list[str] = []
    for path in paths:
        text = read_text_if_exists(path)
        if text is None:
            continue
        if pattern.search(text):
            hits.append(str(path))
    return hits


def collect_component_source_class_names(component_root: Path) -> set[str]:
    class_names: set[str] = set()
    if not component_root.exists():
        return class_names

    for path in sorted(component_root.glob("*.ts")) + sorted(component_root.glob("*.tsx")):
        class_names.update(extract_rendered_class_names(read_text_if_exists(path)))

    return class_names


def load_package_json(path: Path) -> dict:
    text = read_text_if_exists(path)
    if text is None:
        return {}
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {}


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Verify takeoff-design and takeoff-spar port artifacts, imports, and contract alignment."
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

    kebab_name = derived_names["kebab"]

    takeoff_design_root = repo_root.parent / "takeoff-design" / "packages/tokens"
    react_package_root = repo_root / "packages/react-spar"
    component_root = react_package_root / f"src/components/{kebab_name}"
    recipe_path = takeoff_design_root / f"styles/recipes/_{kebab_name}.scss"
    styles_index_path = takeoff_design_root / "styles/_index.scss"
    theme_css_path = takeoff_design_root / "dist/css/default/theme.css"
    react_dist_root = react_package_root / "dist"
    components_index_path = react_package_root / "src/components/index.ts"
    package_json_path = react_package_root / "package.json"
    readme_path = react_package_root / "README.md"
    docs_runtime_css_path = repo_root / "apps/docs/src/css/custom.css"
    docs_guide_path = repo_root / "apps/docs/docs/theming.mdx"
    demo_main_path = repo_root / "apps/react-app/src/main.tsx"

    theme_css_contents = read_text_if_exists(theme_css_path)
    recipe_contents = read_text_if_exists(recipe_path)
    styles_index_contents = read_text_if_exists(styles_index_path)
    components_index_contents = read_text_if_exists(components_index_path)
    readme_contents = read_text_if_exists(readme_path)
    docs_runtime_css_contents = read_text_if_exists(docs_runtime_css_path)
    docs_guide_contents = read_text_if_exists(docs_guide_path)
    demo_main_contents = read_text_if_exists(demo_main_path)
    package_json = load_package_json(package_json_path)

    theme_selector = f".tk-{kebab_name}"

    emitted_css_files = [str(path) for path in react_dist_root.rglob("*.css")] if react_dist_root.exists() else []

    search_paths = [
        readme_path,
        docs_runtime_css_path,
        docs_guide_path,
        demo_main_path,
        *sorted((repo_root / "packages/react-spar").rglob("*.md")),
        *sorted((repo_root / "packages/react-spar").rglob("*.mdx")),
        *sorted((repo_root / "packages/react-spar").rglob("*.ts")),
        *sorted((repo_root / "packages/react-spar").rglob("*.tsx")),
        *sorted((repo_root / "apps/docs").rglob("*.md")),
        *sorted((repo_root / "apps/docs").rglob("*.mdx")),
        *sorted((repo_root / "apps/docs").rglob("*.ts")),
        *sorted((repo_root / "apps/docs").rglob("*.tsx")),
        *sorted((repo_root / "apps/react-app").rglob("*.ts")),
        *sorted((repo_root / "apps/react-app").rglob("*.tsx")),
    ]
    stale_import_hits = sorted(set(find_text_hits(search_paths, STALE_STYLE_IMPORT)))
    stencil_event_name_hits = sorted(set(find_pattern_hits(search_paths, STENCIL_EVENT_NAME_PATTERN)))
    react_tk_callback_hits = sorted(set(find_pattern_hits(search_paths, REACT_TK_CALLBACK_PATTERN)))

    component_class_names = collect_component_source_class_names(component_root)
    recipe_class_names = extract_selector_class_names(recipe_contents)
    recipe_classes_missing_in_component = sorted(recipe_class_names - component_class_names)
    component_classes_missing_in_recipe = sorted(component_class_names - recipe_class_names)

    peer_dependencies = package_json.get("peerDependencies", {}) if isinstance(package_json, dict) else {}
    peer_dependency_present = "@takeoff-design/tokens" in peer_dependencies

    results = {
        "component_name": kebab_name,
        "component_root_exists": component_root.exists(),
        "recipe_exists": recipe_path.exists(),
        "recipe_path": str(recipe_path),
        "recipe_registered_in_styles_index": styles_index_contents is not None and kebab_name in styles_index_contents,
        "theme_css_exists": theme_css_path.exists(),
        "theme_css_path": str(theme_css_path),
        "theme_selector_found": theme_css_contents is not None and theme_selector in theme_css_contents,
        "react_dist_exists": react_dist_root.exists(),
        "react_dist_path": str(react_dist_root),
        "react_dist_css_files": emitted_css_files,
        "component_export_present": components_index_contents is not None and f"export * from './{kebab_name}';" in components_index_contents,
        "peer_dependency_present": peer_dependency_present,
        "readme_mentions_token_install": readme_contents is not None and "@takeoff-design/tokens" in readme_contents,
        "readme_mentions_token_import": readme_contents is not None and EXPECTED_TOKEN_IMPORT in readme_contents,
        "docs_runtime_import_present": docs_runtime_css_contents is not None and EXPECTED_TOKEN_IMPORT in docs_runtime_css_contents,
        "docs_guide_import_present": docs_guide_contents is not None and EXPECTED_TOKEN_IMPORT in docs_guide_contents,
        "demo_import_present": demo_main_contents is not None and EXPECTED_TOKEN_IMPORT in demo_main_contents,
        "stale_style_import_hits": stale_import_hits,
        "stencil_event_name_hits": stencil_event_name_hits,
        "react_tk_callback_hits": react_tk_callback_hits,
        "component_class_names": sorted(component_class_names),
        "recipe_class_names": sorted(recipe_class_names),
        "recipe_classes_missing_in_component": recipe_classes_missing_in_component,
        "component_classes_missing_in_recipe": component_classes_missing_in_recipe,
    }

    ok = (
        results["component_root_exists"]
        and results["recipe_exists"]
        and results["recipe_registered_in_styles_index"]
        and results["theme_css_exists"]
        and results["theme_selector_found"]
        and results["react_dist_exists"]
        and not results["react_dist_css_files"]
        and results["component_export_present"]
        and results["peer_dependency_present"]
        and results["readme_mentions_token_install"]
        and results["readme_mentions_token_import"]
        and results["docs_runtime_import_present"]
        and results["docs_guide_import_present"]
        and results["demo_import_present"]
        and not results["stale_style_import_hits"]
        and not results["stencil_event_name_hits"]
        and not results["react_tk_callback_hits"]
        and not results["recipe_classes_missing_in_component"]
    )

    results["ok"] = ok

    if args.json:
        print(json.dumps(results, indent=2))
    else:
        print(f"Component selector: {theme_selector}")
        print("")
        print(f"- {'OK' if results['component_root_exists'] else 'MISSING'}: {component_root}")
        print(f"- {'OK' if results['recipe_exists'] else 'MISSING'}: {results['recipe_path']}")
        print(
            f"- {'OK' if results['recipe_registered_in_styles_index'] else 'MISSING'}: recipe referenced from styles/_index.scss"
        )
        print(f"- {'OK' if results['theme_css_exists'] else 'MISSING'}: {results['theme_css_path']}")
        print(f"- {'OK' if results['theme_selector_found'] else 'MISSING'}: selector present in built theme.css")
        print(f"- {'OK' if results['react_dist_exists'] else 'MISSING'}: {results['react_dist_path']}")
        print(
            f"- {'OK' if not results['react_dist_css_files'] else 'UNEXPECTED'}: no CSS files emitted in the React package dist"
        )
        if results["react_dist_css_files"]:
            for css_file in results["react_dist_css_files"]:
                print(f"  {css_file}")
        print(f"- {'OK' if results['component_export_present'] else 'MISSING'}: component export in packages/react-spar/src/components/index.ts")
        print(f"- {'OK' if results['peer_dependency_present'] else 'MISSING'}: @takeoff-design/tokens peer dependency")
        print(f"- {'OK' if results['readme_mentions_token_install'] else 'MISSING'}: README install guidance includes @takeoff-design/tokens")
        print(f"- {'OK' if results['readme_mentions_token_import'] else 'MISSING'}: README import guidance includes {EXPECTED_TOKEN_IMPORT}")
        print(f"- {'OK' if results['docs_runtime_import_present'] else 'MISSING'}: docs runtime imports {EXPECTED_TOKEN_IMPORT}")
        print(f"- {'OK' if results['docs_guide_import_present'] else 'MISSING'}: docs theming guide mentions {EXPECTED_TOKEN_IMPORT}")
        print(f"- {'OK' if results['demo_import_present'] else 'MISSING'}: react app imports {EXPECTED_TOKEN_IMPORT}")
        print(
            f"- {'OK' if not results['stale_style_import_hits'] else 'UNEXPECTED'}: no stale {STALE_STYLE_IMPORT} references"
        )
        if results["stale_style_import_hits"]:
            for hit in results["stale_style_import_hits"]:
                print(f"  {hit}")
        print(
            f"- {'OK' if not results['stencil_event_name_hits'] else 'UNEXPECTED'}: no Stencil event names leaked into React-facing source or docs"
        )
        if results["stencil_event_name_hits"]:
            for hit in results["stencil_event_name_hits"]:
                print(f"  {hit}")
        print(
            f"- {'OK' if not results['react_tk_callback_hits'] else 'UNEXPECTED'}: no React callback names use an onTk* prefix"
        )
        if results["react_tk_callback_hits"]:
            for hit in results["react_tk_callback_hits"]:
                print(f"  {hit}")
        print(
            f"- {'OK' if not results['recipe_classes_missing_in_component'] else 'MISSING'}: recipe class selectors are backed by rendered class names"
        )
        if results["recipe_classes_missing_in_component"]:
            for class_name in results["recipe_classes_missing_in_component"]:
                print(f"  {class_name}")
        print(
            f"- {'OK' if not results['component_classes_missing_in_recipe'] else 'WARN'}: rendered class names are covered by the recipe"
        )
        if results["component_classes_missing_in_recipe"]:
            for class_name in results["component_classes_missing_in_recipe"]:
                print(f"  {class_name}")

    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
