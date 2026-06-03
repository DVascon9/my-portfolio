# DVascon Productions — Hybrid R2 Auto Version

This version uses:

- Cloudflare Pages for the website
- Cloudflare R2 for images/videos
- A small Pages Function at `/api/list` to read your R2 folders automatically

No `data.json` updates are needed.

## Required R2 structure

Your R2 bucket is named `galleries`.

Inside that bucket, organize folders like this:

```text
volleyball/
  omaha-supernovas/
    2026-01-16-vs-atlanta-vibe/
      photo-001.jpg
      photo-002.jpg
```

Do not create another `galleries/` folder inside the bucket unless you also set `MEDIA_ROOT = "galleries"` in `js/config.js`.

## Cloudflare binding

In your `my-portfolio` project:

```text
Overview → Bindings → Add a binding
```

Add:

```text
Type: R2 bucket
Variable name: GALLERIES
Bucket: galleries
```

Then redeploy.

## Config

Open:

```text
js/config.js
```

Make sure `MEDIA_BASE_URL` is your R2 Public Development URL.
