# DVascon Productions — Dynamic R2 Version

This version reads your Cloudflare R2 bucket directly through a Cloudflare Pages Function. You do not need to manually update `data.json`.

## Required R2 structure
Your R2 bucket is named `galleries`. Inside it, organize media like this:

```text
volleyball/
  omaha-supernovas/
    2026-01-16-vs-atlanta-vibe/
      photo-001.jpg
      photo-002.jpg
```

## Cloudflare Pages R2 binding
In Cloudflare Pages:

```text
Pages project → Settings → Functions → R2 bucket bindings
```

Add a binding:

```text
Variable name: GALLERIES
R2 bucket: galleries
```

Deploy again after adding the binding.

## Config
Edit `js/config.js` and set `MEDIA_BASE_URL` to your R2 Public Development URL or custom media domain.

Because your bucket is named `galleries`, keep:

```js
const MEDIA_ROOT = "";
```

Only change it to `"galleries"` if you created an actual folder named `galleries` inside the bucket.
