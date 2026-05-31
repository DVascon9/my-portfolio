# Dvascon Productions Portfolio — Cloudflare/GitHub Version

This version removes Supabase and is ready for:

GitHub → Cloudflare Pages → dvascon.net

## Files to upload to GitHub
Upload everything in this folder to your GitHub repo.

## Edit this first
Open `js/cloudflare.js` and replace:

```js
const CLOUDFLARE_MEDIA_BASE_URL = "https://YOUR-CLOUDFLARE-PUBLIC-MEDIA-URL-HERE";
```

Use your public Cloudflare R2 URL or your custom media domain.
Examples:

```js
const CLOUDFLARE_MEDIA_BASE_URL = "https://pub-xxxxxxxx.r2.dev";
```

or:

```js
const CLOUDFLARE_MEDIA_BASE_URL = "https://media.dvascon.net";
```

Do not include a slash at the end.

## Required media folder structure
Your uploaded Cloudflare media should match this structure:

```text
Sport/Team/Event/file.jpg
Sport/Team/Event/file.mp4
Hidden/DiegoVasconcelos.jpg
```

Example:

```text
Volleyball/Omaha Supernovas/01-16-26 vs Atlanta Vibe/Ava-Martin.jpg
```

## Updating `data.json`
Because a public R2 bucket does not automatically list folders for static HTML, the website reads gallery names from `data.json`.

If your media folders exist locally, run:

```bash
node generate.js
```

Then commit the updated `data.json` to GitHub.

## Cloudflare Pages settings
Framework preset: None
Build command: leave blank
Output directory: /

## Domain
This package includes a `CNAME` file with:

```text
dvascon.net
```
