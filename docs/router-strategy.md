# Router strategy (April 26, 2026)

## Decision

Project is currently standardized on **Pages Router** (`src/pages/**`).

- Keep `next.config.js` free of `experimental.appDir` to avoid stale/legacy App Router flags.
- Continue using `getServerSideProps` / `getStaticProps` / `getStaticPaths` only in `src/pages/**`.
- Do not add mixed data-fetching (`fetch` in Server Components) until a full App Router migration plan is approved.

## Dynamic route mapping for future App Router migration

Equivalent segment mapping:

- `src/pages/post/[uuid].tsx` -> `src/app/post/[uuid]/page.tsx`
- `src/pages/[username].tsx` -> `src/app/[username]/page.tsx`
- `src/pages/resetpassword/[token].tsx` -> `src/app/resetpassword/[token]/page.tsx`
- `src/pages/confirmation/[token].tsx` -> `src/app/confirmation/[token]/page.tsx`

## Data fetching convention (Pages Router)

To avoid duplicated auth fetch logic in each page, use shared helper:

- `src/lib/pages-router-auth.ts#getAuthenticatedUser`

Usage pattern:

1. Call `getAuthenticatedUser(context)` inside `getServerSideProps`.
2. If user exists -> return page props.
3. If missing/error -> redirect to `/login`.

This keeps all authenticated page routes on one consistent pattern.
