---
name: yantram-admin-development
description: "Use when working on the Yantram Admin Next.js dashboard: adding or fixing pages, authenticated API calls, CRUD forms, data tables, modals, product imports, shipping zones, analytics, or shared UI. Follow the repository's existing App Router, AuthContext, Axios, Tailwind, Radix, and validation conventions."
user-invocable: false
disable-model-invocation: false
---

# Yantram Admin Development

Use this skill for implementation and debugging work in this repository. Keep changes local to the requested feature and preserve existing behavior outside that feature.

## Repository Shape

- This is a Next.js 14 App Router application under `src/app`.
- Feature UI is organized under `src/components/<Feature>` with page-level wiring in `src/app/<route>`.
- Shared UI primitives live in `src/components/ui` and use Tailwind, Radix, `class-variance-authority`, and `cn` from `src/lib/utils`.
- API access is primarily through Axios. The shared base URL is in `src/api/axios.ts`, while many browser calls use `/api/v1/...` directly.
- Authentication state is provided by `AuthContext`; protected requests should send `Authorization: Bearer <accessToken>`.

## Implementation Procedure

1. Start at the route, component, or failing behavior named by the task. Read the nearest owner of the behavior and one neighboring test or call site before editing.
2. Identify the API contract from nearby existing requests and types. Preserve response unwrapping conventions such as `response.data.data` unless the endpoint clearly differs.
3. For protected client components, use `"use client"`, read the token from `AuthContext`, and include the bearer header on every protected request.
4. Reuse existing primitives (`Button`, `Input`, `Dialog`/`Modal`, `DataTable`, `Heading`, `Separator`, `ApiList`, `AlertModal`) instead of introducing a parallel UI system.
5. Keep modal state controlled by the owning page or feature index. After create/update/delete, update local state or refetch the affected collection and close the modal only after the request succeeds.
6. For table actions, keep action components focused on the row operation. Pass callbacks for parent state updates rather than relying only on `router.refresh()` when the page already owns local collection state.
7. For forms, preserve the API's field names and value shapes. Normalize numeric inputs and optional values deliberately; do not silently turn a valid zero into a missing value.
8. For product Excel workflows, validate headers and mappings before making requests, fetch category/subcategory/attribute maps once, and report row-level failures without losing the overall result.
9. Keep responsive layouts usable on narrow screens. Prefer the existing Tailwind layout patterns and avoid inline styles unless the surrounding component already uses them.

## Authentication And Effects

- Include `accessToken` in effects that fetch protected data; do not fetch with an undefined token when the context is still initializing.
- Avoid an empty dependency array for requests that depend on the token or date filters.
- Keep loading state in `finally` blocks and avoid artificial delays unless the existing UI specifically requires them.
- Do not log tokens, form contents containing secrets, or noisy request payloads in committed code.

## API And Error Handling

- Use the established endpoint prefix and HTTP verb for the feature. Check nearby code before choosing between `PUT`, `PATCH`, and `POST`.
- Use `toast` where the feature already uses `react-hot-toast`; otherwise follow the local error presentation pattern.
- Treat failed requests as user-visible states: preserve the form when useful, show an error, and re-enable the relevant controls.
- Guard optional response data before calling `.map`, `.reduce`, or property access.

## UI Conventions

- Use Lucide icons already available in the project for action buttons.
- Keep destructive actions behind `AlertModal` and enforce role checks consistently with the surrounding feature.
- Use `DataTable` column definitions for collection views. Format nested arrays and IDs in column cells rather than leaking raw objects into the table.
- Prefer shared CSS variables and Tailwind theme tokens from `globals.css`; do not add a new color system for a single screen.
- Preserve the existing light/dark token structure and avoid broad global CSS changes for feature-specific styling.

## Validation

After each substantive edit, run the narrowest available check first. For this repository, use:

- `npm run lint` for TypeScript/React and Next.js lint checks.
- `npm run build` when changing routes, layouts, configuration, shared components, or code whose type/build behavior is not covered by lint.
- A focused manual browser check for modal open/close, authenticated loading, table actions, pagination/search, and empty/error states when the change affects UI behavior.

Fix new errors caused by the change before widening scope. Do not rewrite unrelated existing code or suppress lint/type errors without understanding the underlying issue.

## Common Local Pitfalls

- Some files contain inconsistent whitespace or non-ASCII spaces. Preserve surrounding formatting and avoid broad formatting rewrites.
- Several legacy modal files are JavaScript/JSX while most feature clients are TypeScript/TSX. Match the existing file type and avoid migrating unrelated files.
- `next/image` requires configured image hosts; inspect `next.config.mjs` before adding remote images.
- API URLs are not fully uniform across legacy components. Prefer the convention used by the nearest feature and verify the resulting request path.
- Do not expose credentials or commit `.env.local` changes.