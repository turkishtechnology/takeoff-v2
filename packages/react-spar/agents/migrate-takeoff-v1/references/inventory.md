# v1 usage inventory

Size the migration, and later prove it finished, with the commands below. They
replace the bespoke scanner this skill used to ship: `rg` already respects
`.gitignore` (so `node_modules`, `dist`, and `build` are skipped), reports the
files it cannot read on stderr, and cannot silently under-report the way a
hand-written JSX parser can.

Run every command from the consumer repository root, with `src` replaced by the
application's source directory. If `rg`
([ripgrep](https://github.com/BurntSushi/ripgrep)) is unavailable, `grep -rnE`
accepts the same patterns.

## 1. React version

v2 throws at runtime on React 18, so read the version that is actually installed
rather than the range in `package.json` — a workspace root can hoist a different
major than the app declares.

```bash
node -p "require('react/package.json').version"
```

Anything below 19 is a blocker. Upgrade `react` and `react-dom` first.

## 2. v1 package imports

Catches every import form: named, side-effect, subpath, and `require`.

```bash
rg -n "@takeoff-ui/(react|core|tailwind)" src
```

## 3. v1 components by blast radius

```bash
rg -o --no-filename "(^|[^A-Za-z0-9_\$])<Tk[A-Z][A-Za-z0-9]*" src \
  | grep -oE "<Tk[A-Za-z0-9]*" | sort | uniq -c | sort -rn
```

The leading character class keeps TypeScript type arguments
(`useRef<TkInputElement>`) out of the counts. Commented-out JSX still appears,
so check the line before treating a low count as real usage.

Look each name up in [component-map.md](component-map.md): `Direct mappings` and
`Compound rewrites` are ordinary migration work, `Special mappings` need the
noted approach, and anything in `v1-only gaps` needs an explicit decision from
[gaps.md](gaps.md). A `Tk*` name in none of those sections is unrecognized —
verify it against the map before assuming a target.

Migrate leaf controls before the compound parents that contain them, in
descending count order.

## 4. v1 event handlers

```bash
rg -o --no-filename "\bonTk[A-Z][A-Za-z0-9]*" src | sort | uniq -c | sort -rn
```

Translate each one with [props-events.md](props-events.md). v1 handlers receive
a `CustomEvent`; v2 callbacks receive the value directly.

## 5. Raw custom elements

```bash
rg -n "<tk-[a-z0-9-]+" src
```

These bypass the React wrapper entirely and have to be migrated as call sites of
their own, even where the wrapper has a mapping.

## 6. v1 styling dependencies

```bash
rg -n "@takeoff-ui/[^\"']*\.css" src
rg -n "containerStyle" src
rg -n -- "--tk-[a-z0-9-]+\s*:" src
```

The first is the v1 stylesheet import, the second a v1-only prop with no v2
equivalent. The third lists `--tk-*` custom-property declarations: those are v2
token names, so in a migrated app they are usually intentional — read them
rather than removing them on sight. v1's own tokens are unprefixed
(`--button-*`, `--color-*`) and collide with ordinary app CSS, which is why the
stylesheet import above is the reliable v1 signal.

## Finish criteria

Remove `@takeoff-ui/react` and `@takeoff-ui/core` only when:

- command 1 reports React 19 or newer;
- commands 2, 5, and the first two of 6 report nothing;
- command 3 reports nothing outside the gap components you explicitly decided to
  keep, and every one of those decisions is recorded in the migration issue.
