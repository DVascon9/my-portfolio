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

## Video work

Add video files directly inside the `(Hidden)videos/` folder in the `galleries` R2 bucket. Supported formats are MP4, MOV, WebM, and M4V. The Video Work carousel and page list these files automatically.

To add externally hosted videos, add entries to `VIDEO_LINKS` in `js/config.js`:

```js
const VIDEO_LINKS = [
  {
    title: "Project title",
    url: "https://example.com/video",
    description: "Optional description."
  }
];
```

The dedicated `/video-work.html` page includes both hosted files and links. Videos in `(Hidden)videos/` are intentionally exposed by the dedicated video listing endpoint; other `(Hidden)` folders remain excluded.
