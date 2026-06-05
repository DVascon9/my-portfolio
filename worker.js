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

      const folders = (listed.delimitedPrefixes || []).filter(folder => {
        const name = folder
          .replace(/\/$/, "")
          .split("/")
          .pop();

         return !name.startsWith(".");
        });

        return Response.json({
         prefix,
         folders,
         files: (listed.objects || []).map(object => ({
          key: object.key,
          name: object.key.split("/").pop(),
         size: object.size,
         uploaded: object.uploaded
        }))
      });
    }

    return env.ASSETS.fetch(request);
  }
};