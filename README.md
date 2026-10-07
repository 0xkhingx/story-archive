# Story Archive — a cinematic personal story site

A static storytelling site: a cinematic landing, an archive of written stories, and a reading experience with a motion system, shader backgrounds, and a "portal takeover" final act.

**Live:** https://story-archive-zeta.vercel.app

## What's inside

| Route | Content |
|---|---|
| `/` | Cinematic landing (GSAP motion, custom shaders) |
| `/stories` | Story archive + exploration |
| `/about` | About the author |
| `/404` | Custom not-found page |

- **Stories** live as Markdown/MDX in `src/content/stories/`, validated by a content schema (`src/content.config.ts`) with categories `films`, `animation`, `life` — each story has title, description, date, and cover.
- **Motion:** GSAP-driven story motion system (`src/components/story/`), landing sequences (`src/components/landing/`), shared UI (`src/components/shared/`).
- **Shaders:** GLSL backgrounds in `src/shaders/` (`neuform-isolated`, `portal-field`).
- **Output:** fully static (`output: 'static'` in `astro.config.mjs`), deployed on Vercel (headers + config in `vercel.json`).

## Tech stack

Astro 7, MDX (`@astrojs/mdx`), GSAP, TypeScript. No backend, no database.

## Run it locally

Requires Node 20+.

```bash
npm ci
npm run dev      # local dev server
npm run build    # static production build (dist/)
npm run preview  # preview the build
```

## Adding a story

Drop a `.md`/`.mdx` file in `src/content/stories/` with frontmatter:

```yaml
---
title: "Story title"
category: "films"   # films | animation | life
description: "One-line teaser"
date: 2026-10-01
cover: "/covers/story.jpg"
coverAlt: "Cover description"
---
```

## Deploy

Pushes to `main` deploy on Vercel automatically.

## License

MIT — see [LICENSE](LICENSE).
