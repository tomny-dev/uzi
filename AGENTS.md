# AGENTS.md

## Scope

These instructions apply to the entire repository.

## Project Snapshot

`@tomny-dev/uzi` is a React component library built with Vite, TypeScript, CSS modules, and pnpm. Do not commit generated `dist/` output.

## Commands

Use Node 24 LTS for local development and CI parity.

- Install: `pnpm install`
- Typecheck: `pnpm lint`
- Test: `pnpm test`
- Build: `pnpm build`

## Release Conventions

Stable versioning is managed by Release Please. Release Please only opens release PRs for Conventional Commit messages that land on `main`.

- PR titles and squash/merge commit titles must use Conventional Commit format.
- Use `fix: ...` for patch releases and `feat: ...` for minor releases.
- Use `fix(scope): ...` or `feat(scope): ...` when a scope helps, for example `fix(modal): constrain dialog height`.
- Use `!` or a `BREAKING CHANGE:` footer only for intentional major releases.
- Do not merge release-worthy changes with titles like `[codex] ...`, `fix modal sizing`, or `update stuff`.
- `docs:`, `chore:`, `ci:`, `test:`, and `refactor:` are valid for non-release work, but they do not normally publish a new stable package.

Before opening or updating a PR, make the PR title match the intended squash/merge title. If a PR changes runtime package behavior, prefer a release-triggering `fix:` or `feat:` title.

## Done Criteria

For code changes, run `pnpm lint`, `pnpm test`, and `pnpm build` when feasible. For docs-only changes, run a targeted formatting or content check and explain why package checks were not needed.
