export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/download") {
      const key = url.searchParams.get("key");

      if (!key) {
        return new Response("Missing file key", { status: 400 });
      }

      if (!env.GALLERIES) {
        return new Response("Missing GALLERIES R2 binding", {
          status: 500
        });
      }

      const object = await env.GALLERIES.get(key);

      if (!object) {
        return new Response("File not found", {
          status: 404
        });
      }

      const filename = key.split("/").pop();

      return new Response(object.body, {
        headers: {
          "Content-Type":
            object.httpMetadata?.contentType ||
            "application/octet-stream",
          "Content-Disposition":
            `attachment; filename="${filename}"`
        }
      });
    }
    
    if (url.pathname === "/api/search") {
      if (!env.GALLERIES) {
        return Response.json(
          { error: "Missing GALLERIES R2 binding" },
          { status: 500 }
        );
      }

      const listed = await env.GALLERIES.list({
        limit: 1000
     });

      const results = [];

      for (const object of listed.objects || []) {
        const parts = object.key.split("/");

        if (parts.length < 4) continue;
        if (parts.some(part => part.startsWith("."))) continue;

        const [sport, team, event] = parts;

        results.push({
          sport,
          team,
          event,
          label: `${folderLabelForWorker(sport)} • ${folderLabelForWorker(team)} • ${folderLabelForWorker(event)}`,
          url: `gallery.html?sport=${encodeURIComponent(sport)}&team=${encodeURIComponent(team)}&event=${encodeURIComponent(event)}`
        });
      }

      const uniqueResults = Array.from(
        new Map(results.map(item => [item.url, item])).values()
      );

      return Response.json({
        results: uniqueResults
     });
    }

    function folderLabelForWorker(value) {
      return String(value || "")
        .replace(/-/g, " ")
        .replace(/\b\w/g, character => character.toUpperCase());
    }

    if (url.pathname === "/api/list") {
      let prefix = url.searchParams.get("prefix") || "";
      prefix = prefix.replace(/^\/+/, "");

      if (prefix && !prefix.endsWith("/")) {
        prefix += "/";
      }

      if (!env.GALLERIES) {
        return Response.json(
          { error: "Missing GALLERIES R2 binding" },
          { status: 500 }
        );
      }

      const listed = await env.GALLERIES.list({
        prefix,
        delimiter: "/",
        limit: 1000
      });

      let folders = listed.delimitedPrefixes || [];

      if (prefix === "") {
        folders = folders.filter(folder => folder !== ".wrangler/");
      }

      folders = folders.sort().reverse();

      const files = (listed.objects || [])
        .filter(object => !object.key.endsWith(".DS_Store"))
        .filter(object => !object.key.split("/").pop().startsWith("."))
        .map(object => ({
          key: object.key,
          name: object.key.split("/").pop(),
          size: object.size,
          uploaded: object.uploaded
        }));

      return Response.json({
        prefix,
        folders,
        files
      });
    }

    return env.ASSETS.fetch(request);
  }
};