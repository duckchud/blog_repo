# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Markdown-first publishing workspace for a single Google Blogger blog. Authors write
Markdown files under `posts/`, and a CLI converts them to HTML and pushes them to
Blogger via the Blogger v3 API. Two kinds of work happen here:

- **Code**: the TypeScript monorepo (`packages/blog-core` + `apps/cli`).
- **Content**: writing/editing posts. The end-to-end authoring workflow, design
  conventions, and Blogger-specific gotchas live in `GUIDE.md` and
  `docs/writing-pipeline.md` — read those before authoring or embedding visuals.

## Commands

```bash
npm install                      # install (npm workspaces)
npm run build                    # build blog-core, then cli (tsc → dist/)
npm run typecheck                # tsc --noEmit across both workspaces
npm run blog -- <command>        # BUILDS then runs the CLI from dist/
npm run dev --workspace=@blog-workspace/cli -- <command>   # run CLI from source via tsx (no build)
```

There is **no test framework**. Verify changes with `npm run typecheck` and by
exercising the CLI (e.g. `npm run blog -- preview <file>`).

Note: `npm run blog` recompiles the whole workspace on every invocation, so CLI
runs are always fresh but slow; use the `dev`/tsx path when iterating on core code.

CLI commands: `auth`, `blogs`, `new <ai|paper|etc> "<title>"`, `preview <file> [--no-open]`,
`publish <file> [--draft|--publish]`, `update <file>`, `status <file>`.

## Architecture

Monorepo via npm workspaces. `apps/desktop` is a placeholder (README only) — a future
client meant to reuse `blog-core`.

- **`packages/blog-core`** — owns everything reusable: OAuth, Markdown↔HTML, Blogger
  API calls, and post state. Consumed by clients as `@blog-workspace/blog-core`.
- **`apps/cli`** — thin Commander-based client. Each `src/commands/*.ts` wires user
  input to `blog-core`; `commands/shared.ts` holds the glue (auth bootstrap, content
  mapping, metadata computation).

### The central idea: one Markdown file = one Blogger post

Front matter carries the post's state. `blogger_post_id` is the link between the local
file and the remote post — it is written back automatically on first publish and read
on every subsequent publish. This is what prevents duplicate posts:

- `saveBloggerPost` (`blogger/posts.ts`): no `blogger_post_id` → `posts.insert`; has one
  → `getBloggerPost` + `posts.update` (+ `publish`/`revert` depending on mode).
- **`getBloggerPost` must pass `view: "ADMIN"`** or the API 404s on *draft* posts.
- Metadata is written back via `updateMarkdownPostMetadata` (`markdown/parser.ts`),
  which **skips `undefined` patch values** so it never clobbers front matter into an
  unserializable state.

### Post types are a single source of truth

`POST_TYPES` in `packages/blog-core/src/types/post.ts` defines the valid types
(currently `ai`, `paper`, `etc`) and doubles as the folder name under `posts/`.
`parseType` (parser) and the `new` command both reference it — to add/rename a topic,
edit that one array; validation, folder routing, and error messages follow.

### Config & auth

- `loadBlogConfig` (`config/config.ts`) reads `.env` (via dotenv). `BLOGGER_BLOG_ID` is
  required for any blog operation; `requireBlogId` enforces it.
- OAuth is a desktop-app loopback flow (`auth/google-oauth.ts`, scopes include
  `.../auth/blogger`). The OAuth client is `credentials.json`; the resulting token is
  written per-machine to `credentials/token.json`. Both are gitignored.

### Markdown conversion

`markdown/converter.ts` uses `marked` (GFM). Raw HTML/inline CSS in a post body passes
through unchanged and becomes the Blogger post content — this is how posts embed styled
boxes, diagrams, and CSS charts. `createPreviewHtml` wraps the body for local preview
only (its `<style>` is not uploaded).

## Conventions & gotchas

- **ESM + NodeNext**: relative imports in `.ts` source use the `.js` extension
  (e.g. `import { POST_TYPES } from "../types/post.js"`). `verbatimModuleSyntax` is on,
  so use `import type` for type-only imports.
- `dist/` is gitignored and rebuilt; never edit or commit it. Edit `src/`.
- Publishing is outward-facing (writes to the live Blogger blog). Do not publish on the
  user's behalf without an explicit request.
- Content authoring rule enforced in `docs/writing-pipeline.md`: never open a published
  post in Blogger's Compose (visual) editor — it mangles `<style>`/HTML. Edit the local
  `.md` and re-run `publish` instead.
