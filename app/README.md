# Cyber Slots

React 19 + Vite demo casino lobby with responsive landing sections, a playable slot cabinet, leaderboard, reservation modal, and cybernetic superpower upgrades.

## Scripts

- `npm run dev` - start Vite on port 3000
- `npm run build` - generate SEO files, typecheck, and build production assets
- `npm run lint` - run ESLint
- `npm run generate:seo` - regenerate `public/robots.txt`, `public/sitemap.xml`, and `public/_redirects`
- `npm run optimize:images` - regenerate responsive image variants
- `npm run preview` - preview the production build

## Architecture

- `src/pages` contains route-level pages loaded with React Router and `lazy`.
- `src/sections` contains landing-page sections, including the playable slot cabinet.
- `src/features/superpowers` contains the Suspense-first superpower store feature.
- `src/components/ui` contains reusable Radix/shadcn-style primitives.
- `scripts/build.mjs` runs SEO generation before TypeScript and Vite build.

## Notes

- The legacy Convex sample app was removed from `casino/` to keep the production app focused.
- Playwright artifacts and temporary TSX experiments are ignored by `.gitignore`.
- Set `SITE_URL` or `VITE_SITE_URL` in production so generated sitemap and canonical metadata use the deployed URL.
