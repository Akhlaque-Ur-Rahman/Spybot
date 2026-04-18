# Nested CMS pages

## Model

- `Page.parentId` (optional) points to another `Page.id`. Use this to group detail routes under a hub (e.g. solutions hub → solution detail).
- `Page.slug` remains the public path segment(s), e.g. `solutions/identity-verification` (no leading slash in DB). It must stay **globally unique**.

## Registry vs DB-only children

- **Registry pages** in `page-registry.ts` stay flat `slug` strings; add new rows for each detail route you want managed like any other page.
- **DB-only** pages created via admin can use the same slug convention; `getManagedPageBySlug` already resolves DB when there is no registry row.

## Sync

- `syncCmsRegistry` only upserts keys present in code. It does **not** delete custom child pages (no registry row). Prune only removes sections/blocks that disappeared from the **registry definition** of a synced page.

## Next steps (optional)

- Dynamic Next.js route `[[...slug]]` that resolves `getManagedPageBySlug(params.slug.join('/'))`.
- Admin UI to pick `parentId` when creating a page.
