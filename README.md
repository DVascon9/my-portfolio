# DVascon Productions Portfolio

Clean setup:
GitHub → Cloudflare Pages → dvascon.net  
Cloudflare R2 stores gallery media.

## Keep these JS files

Use:
- js/config.js
- js/app.js

Do not use the old js/cloudflare.js with this version.

## R2 folder structure

Because `MEDIA_ROOT` is set to `galleries`, your R2 paths should look like:

```text
galleries/volleyball/omaha-supernovas/2026-01-16-vs-atlanta-vibe/Ava-Martin.jpg
```

## When you add a new gallery

1. Upload photos/videos into R2.
2. Add the gallery info and filenames to `data.json`.
3. Push to GitHub.
4. Cloudflare Pages redeploys automatically.

## Cloudflare Pages settings

Framework preset: None  
Build command: leave blank  
Build output directory: /
