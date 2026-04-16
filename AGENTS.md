# AGENTS.md

## Project overview

- This repository is the monorepo for `@takeoff-ui/react-spar`.
- Primary package code lives in `packages/react-spar/`.
- Public docs live in `apps/docs/`.
- Local smoke/integration app lives in `apps/react-app/`.

## Repository expectations

- Use `pnpm` for workspace commands.
- Preserve the React 19-only contract across code, tests, docs, and examples.
- Treat `takeoff-ui` as a parity reference, not a build dependency.
- Treat `@turkish-technology/spar` as the only external runtime primitive.
- Do not introduce bundled component CSS in `@takeoff-ui/react-spar`.

## Skill routing

- Use `$generate-component` before scaffolding a new React Spar component.
- Use `$takeoff-component-port` when porting, reviewing, or correcting component
  parity across `takeoff-ui`, `takeoff-design`, `spar`, and `takeoff-spar`.

## Build and test commands

- `pnpm install`
- `pnpm dev:docs`
- `pnpm dev:react`
- `pnpm --filter @takeoff-ui/react-spar test`
- `pnpm --filter @takeoff-ui/react-spar build`
