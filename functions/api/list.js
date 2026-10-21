export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  let prefix = url.searchParams.get("prefix") || "";

  prefix = prefix.replace(/^\/+/, "");

  if (prefix.split("/").some(segment => segment.startsWith("(Hidden)"))) {
    return Response.json(
      { error: "Hidden content." },
      { status: 404 }
    );
  }

  if (prefix && !prefix.endsWith("/")) {
    prefix += "/";
  }

  if (!env.GALLERIES) {
    return Response.json(
      { error: "Missing R2 binding named GALLERIES" },
      { status: 500 }
    );
  }

  const listed = await env.GALLERIES.list({
    prefix,
    delimiter: "/",
    limit: 1000
  });
  const isVisiblePath = path =>
    !path
      .split("/")
      .some(segment => segment.startsWith("(Hidden)"));

  return Response.json(
    {
      prefix,
      folders: (listed.delimitedPrefixes || []).filter(isVisiblePath),
      files: (listed.objects || []).filter(object => isVisiblePath(object.key)).map(object => ({
        key: object.key,
        name: object.key.split("/").pop(),
        size: object.size,
        uploaded: object.uploaded
      }))
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
