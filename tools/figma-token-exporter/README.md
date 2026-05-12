# Takeoff Token Exporter — Figma Plugin

Figma plugin that reads all local variable collections and exports them as
DTCG-compatible JSON. It can sync tokens directly to the monorepo via a local
dev server, triggering the full build pipeline automatically.

## End-to-End Flow

```
+------------------+       HTTP POST        +------------------+
|  Figma Plugin    | --------------------->  |  Sync Server     |
|  (code.js)       |   localhost:3456/sync   |  (server.mjs)    |
|                  |                         |                  |
|  Reads variables |                         |  Writes JSON     |
|  Converts DTCG   |                         |  to temp file    |
+------------------+                         +--------+---------+
                                                      |
                                                      v
                                             +------------------+
                                             |  sync-figma.mjs  |
                                             |                  |
                                             |  Maps Figma      |
                                             |  collections to  |
                                             |  token files     |
                                             +--------+---------+
                                                      |
                                                      v
                                             +------------------+
                                             | build-tokens.mjs |
                                             |                  |
                                             |  Style Dict v4   |
                                             |  CSS, SCSS, JS,  |
                                             |  Tailwind outputs |
                                             +------------------+
```

## Plugin Installation in Figma

1. Open the Figma desktop app and navigate to the design file that contains the
   token variables.
2. Go to **Menu > Plugins > Development > Import plugin from manifest...**
3. Select the `manifest.json` file from `tools/figma-token-exporter/`.
4. The plugin will appear under **Plugins > Development > Takeoff Token
   Exporter**.

> The plugin uses the Plugin API (not the REST API), so it works on any Figma
> plan.

### Network Access

The plugin is configured to access `http://localhost:3456` in dev mode only (see
`manifest.json` > `networkAccess.devAllowedDomains`). Production builds have
network access set to `"none"`.

## Starting the Sync Server

```bash
# From the monorepo root:
pnpm dev:figma

# Or directly:
node tools/figma-token-exporter/server.mjs
```

The server starts on **port 3456** and exposes:

| Endpoint | Method | Description                               |
| -------- | ------ | ----------------------------------------- |
| `/`      | GET    | Health check — returns `{ status: "ok" }` |
| `/sync`  | POST   | Receives DTCG JSON, runs sync + build     |

## Using the Sync Button

1. Start the sync server (`pnpm dev:figma`).
2. Open the plugin in Figma. It will immediately read all local variable
   collections and display a summary (variable count, collection count, mode
   count).
3. Click **"Sync & Build"** to send the DTCG JSON to the local server.
4. The server will:
   - Write the payload to a temporary file (`takeoff-tokens-dtcg.json`).
   - Run `sync-figma.mjs` to map Figma collections into individual token JSON
     files under `packages/tokens/tokens/`.
   - Run `build-tokens.mjs` to generate CSS, SCSS, JS, and Tailwind outputs
     under `packages/tokens/dist/`.
   - Delete the temporary JSON file.
5. The plugin UI shows build status (success/failure) and a scrollable log with
   details.

Alternatively, click **"Export JSON"** to download the raw DTCG JSON file
without triggering a build.

## Collection Naming Rules

The sync script (`sync-figma.mjs`) matches Figma collections and modes by
**exact name**. Renaming a collection or mode in Figma without updating the sync
config will silently skip those tokens.

### Required Collection/Mode Names

| Figma Collection                  | Mode(s)                                         | Output Path                                                                   |
| --------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------- |
| `primitive-colors`                | `thy` (default brand)                           | `primitives/default/color/*.json`                                             |
| `primitive-colors`                | Any other mode name                             | `primitives/brands/{brand}/color/*.json` (diffs only)                         |
| `typography`                      | `Geologica`, `TK`, `clearview`, `Inter`, `SARP` | `primitives/default/typography/*.json` + brand overrides                      |
| `typography-line-height`          | `normal`, `tight`, `none`                       | `primitives/default/typography/line-height.json`                              |
| `semantic-colors`                 | `Light`                                         | `semantic/light.json`                                                         |
| `semantic-colors`                 | `Dark`                                          | `semantic/dark.json`                                                          |
| `spacing`                         | `Mode 1`                                        | `primitives/default/spacing.json`                                             |
| `radius`                          | `value`                                         | `primitives/default/radius.json`                                              |
| `semantic-typography`             | `Desktop (lg-xl)`, `Tablet`, `Mobile`           | `responsive/desktop.json`, `responsive/tablet.json`, `responsive/mobile.json` |
| Component collections (see below) | `Mode 1` or any mode                            | `component/{name}.json`                                                       |

### Typography Mode-to-Brand Mapping

Typography modes map to brands for font family overrides:

| Figma Typography Mode | Brand           |
| --------------------- | --------------- |
| `Geologica`           | `thy` (default) |
| `TK`                  | `ajet`          |
| `clearview`           | `aviation`      |
| `Inter`               | `technology`    |
| `SARP`                | `sarp`          |

Only font family differences are written to brand override files. Size and
weight are shared.

### Supported Component Collections

The following Figma collection names are recognized as component tokens:

`buttons`, `input`, `switcher`, `breadcrumbs`, `pagination`, `badge`, `dialog`,
`dropdown`, `datepicker`, `tabs`, `chips`, `card`, `header`, `sidebar`, `alert`,
`table`, `tooltips`, `accordion`, `notification`, `slider`, `rich text editor`,
`rating`, `tree-view`, `spinner`, `popconfirm`, `progress bar`, `quote`,
`empty-state`, `result`, `comment`, `error 404`, `login`, `persona`,
`timestampt`, `helpertext`, `popover`, `Timeline`, `file upload`, `anchor`,
`calendar`, `description`, `countdown`, `sign`, `avatar`, `stepper`, `list`,
`timepicker`, `settings`

Some collection names are mapped to different output file names:

| Figma Collection Name | Output File Name |
| --------------------- | ---------------- |
| `buttons`             | `button`         |
| `tooltips`            | `tooltip`        |
| `switcher`            | `radio-checkbox` |
| `breadcrumbs`         | `breadcrumb`     |
| `notification`        | `drawer`         |
| `rich text editor`    | `editor`         |
| `error 404`           | `error-404`      |
| `empty-state`         | `empty-state`    |
| `progress bar`        | `progress-bar`   |
| `file upload`         | `upload`         |
| `timestampt`          | `timestamp`      |
| `Timeline`            | `timeline`       |

These mappings are configured in `packages/tokens/scripts/sync-config.json`.

## Reference Transformation

The sync script transforms Figma variable references to the internal DTCG
reference format:

| Context               | Figma Reference        | Internal Reference                         |
| --------------------- | ---------------------- | ------------------------------------------ |
| Semantic colors       | `{primary.500}`        | `{base.color.primary.500}`                 |
| Semantic colors       | `{alpha.base.black-8}` | `{base.color.alpha.alpha-base-black-8}`    |
| Responsive typography | `{family.body}`        | `{base.typography.family.body}`            |
| Responsive typography | `{size.2xl}`           | `{base.typography.size.2xl}`               |
| Responsive typography | `{2xl}` (line-height)  | `{base.typography.line-height.2xl-normal}` |
| Component tokens      | `{spacing.xl}`         | `{base.spacing.xl}`                        |
| Component tokens      | `{radius.s}`           | `{base.radius.s}`                          |

## Build Outputs

After sync, `build-tokens.mjs` generates the following under
`packages/tokens/dist/`:

| Path                        | Description                                             |
| --------------------------- | ------------------------------------------------------- |
| `css/{brand}/variables.css` | CSS custom properties (`:root` + `[data-theme='dark']`) |
| `css/{brand}/theme.css`     | Variables + component styles                            |
| `scss/_variables.scss`      | Same as CSS variables (default brand)                   |
| `scss/_components.scss`     | Compiled component SCSS                                 |
| `tailwind/colors.js`        | Tailwind v3 color map                                   |
| `tailwind/spacing.js`       | Tailwind v3 spacing map                                 |
| `tailwind/radius.js`        | Tailwind v3 border-radius map                           |
| `tailwind/effects.js`       | Tailwind v3 box-shadow map                              |
| `tailwind/screens.js`       | Tailwind v3 breakpoint map                              |
| `tailwind/typography.js`    | Tailwind v3 `addComponents` plugin                      |
| `tailwind/theme.css`        | Tailwind v4 `@theme inline` + `@layer components`       |
| `js/{brand}/tokens.mjs`     | ESM token exports                                       |

## Validation

After building, run the validation script to verify output integrity:

```bash
cd packages/tokens
node scripts/validate-tokens.mjs
```

This checks:

- `:root` and `[data-theme='dark']` blocks exist and are non-empty.
- All Tailwind theme files have entries.
- Light/dark semantic tokens are symmetric (same keys in both).
- Tailwind v4 `theme.css` and `_components.css` exist and have content.
- Breaking change detection: compares current CSS variable names against a
  cached baseline (`.cache/previous-variables.txt`). Removed variables are
  flagged as breaking changes.

## Troubleshooting

### "Connection failed -- is dev server running?"

The plugin could not reach `localhost:3456`. Make sure the sync server is
running:

```bash
pnpm dev
```

### Tokens are missing after sync

- Verify the Figma collection name matches exactly (case-sensitive). For
  example, `semantic-colors` not `Semantic Colors`.
- Check that the mode name is correct: `Light`/`Dark` for semantic colors,
  `Mode 1` for spacing, `value` for radius.
- Look at the server console output for errors during the sync step.

### Brand overrides not appearing

- Brand color/typography overrides are written only when values **differ** from
  the default brand (`thy`). If a brand has identical values, no override file
  is created.

### New component collection not being picked up

- Add the collection name to the `componentCollections` array in
  `packages/tokens/scripts/sync-config.json`.
- If the Figma collection name differs from the desired output file name, also
  add an entry to the `componentNameMap` object.

### Validation reports breaking changes

- The validator compares current CSS variable names against the previous
  baseline stored in `packages/tokens/.cache/previous-variables.txt`.
- If variables were intentionally removed, update the baseline by running the
  build and validation again. The validator updates the baseline on each run.
- Removed variables require a major version bump.
