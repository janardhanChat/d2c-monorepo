# packages/ — rules for shared libraries

Everything here is used by many projects, so changes ripple. Root `AGENTS.md` applies.

## MUST

- Keep packages generic: no product names, no product-specific logic. If only one product needs it, it belongs in that product.
- Packages may only depend on other `scope:shared` packages.
- Export through `src/index.ts`. Removing or renaming an export is a breaking change: search all usages (`grep -r "@ap/<pkg>"`), update them in the same change, or stop and ask.
- `@ap/auth`, `@ap/tenant`, `@ap/service-kit` are security-critical. Changes need tests for the failure paths (bad token, wrong tenant, missing header) and a human review. Say so in your reply.
- `@ap/config` tsconfig presets: do not loosen `strict`, `noUncheckedIndexedAccess` or similar flags.

## UI (`packages/ui`, `platform/frontend`, `products/*/frontend`)

- Use tokens from `packages/ui/src/styles.css` (`bg-surface`, `text-muted`, `border-border`…). No hex colours or arbitrary values.
- Build variants with `cva`; merge classes with `cn`.
- Every new shared component gets a `*.stories.tsx` file; check it with `pnpm exec nx build-storybook @ap/ui`.
- Accessible by default: real `<button>`/`<a>`, labels on inputs, visible focus, alt text.
