# DVascon Productions Portfolio

This is the static JSON + Cloudflare R2 version.

It does not require Cloudflare Pages Functions or R2 bindings.

## Upload to GitHub

Upload this whole folder to your GitHub repo.

Cloudflare Pages settings:

```text
Framework preset: None
Build command: leave blank
Output directory: /
```

## R2 media structure

Your R2 bucket is named `galleries`.

Inside that bucket, organize media like this:

```text
volleyball/
  omaha-supernovas/
    2026-01-16-vs-atlanta-vibe/
      Ava-Martin.jpg
```

Because the bucket itself is named `galleries`, keep this in `js/config.js`:

```js
const MEDIA_ROOT = "";
```

## Updating galleries

Whenever you add a new gallery, update `data.json`.

Each gallery entry should list the exact filenames in R2.

Example:

```json
{
  "title": "vs Atlanta Vibe",
  "slug": "2026-01-16-vs-atlanta-vibe",
  "date": "2026-01-16",
  "cover": "Ava-Martin.jpg",
  "files": [
    "Ava-Martin.jpg"
  ]
}
```

## Optional automatic data.json generation

If you keep a local copy of your R2 folder structure, you can run:

```bash
node generate.js ./galleries data.json
```

Then commit the updated `data.json` to GitHub.
