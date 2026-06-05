export default {
  async fetch(request, env) {
    const url = new URL(request.url);

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