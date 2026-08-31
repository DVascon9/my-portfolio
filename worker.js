function folderLabelForWorker(value) {
  return String(value || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, character => character.toUpperCase());
}


/*
========================================================
PRIVATE GALLERY PASSWORDS
========================================================

CHANGE THESE BEFORE USING PRIVATE GALLERIES.

The folder names must match your R2 folders exactly.

Example:

_private/
  client-john/

uses:

"_private/client-john": "john123"

========================================================
*/

function getPrivatePasswords(env) {
  if (!env.PRIVATE_PASSWORDS) {
    return {};
  }

  try {
    return JSON.parse(env.PRIVATE_PASSWORDS);
  } catch (error) {
    console.error("Could not parse PRIVATE_PASSWORDS");
    return {};
  }
}


/*
========================================================
COOKIE HELPER
========================================================
*/

function getCookie(request, name) {
  const cookieHeader =
    request.headers.get("Cookie") || "";

  const cookies =
    cookieHeader.split(";");

  for (const cookie of cookies) {
    const [key, ...value] =
      cookie.trim().split("=");

    if (key === name) {
      return decodeURIComponent(
        value.join("=")
      );
    }
  }

  return null;
}


/*
========================================================
HMAC SIGNATURE
========================================================
*/

async function createSignature(text, secret) {
  const encoder = new TextEncoder();

  const key =
    await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      {
        name: "HMAC",
        hash: "SHA-256"
      },
      false,
      ["sign"]
    );

  const signature =
    await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(text)
    );

  return [...new Uint8Array(signature)]
    .map(byte =>
      byte.toString(16).padStart(2, "0")
    )
    .join("");
}


/*
========================================================
VERIFY PRIVATE SESSION
========================================================
*/

async function verifyPrivateSession(
  request,
  folder,
  env
) {
  const cookie =
    getCookie(
      request,
      "dv_private"
    );

  if (!cookie) return false;

  const parts =
    cookie.split(".");

  if (parts.length !== 3) {
    return false;
  }

  const [
    encodedFolder,
    expires,
    signature
  ] = parts;

  let cookieFolder;

  try {
    cookieFolder =
      decodeURIComponent(
        atob(encodedFolder)
      );
  } catch {
    return false;
  }

  if (cookieFolder !== folder) {
    return false;
  }

  if (Date.now() > Number(expires)) {
    return false;
  }

  if (!env.PRIVATE_SECRET) {
    return false;
  }

  const payload =
    `${encodedFolder}.${expires}`;

  const expectedSignature =
    await createSignature(
      payload,
      env.PRIVATE_SECRET
    );

  return (
    signature === expectedSignature
  );
}


/*
========================================================
CREATE PRIVATE SESSION
========================================================
*/

async function createPrivateCookie(
  folder,
  env
) {
  const expires =
    Date.now() +
    (1000 * 60 * 60 * 8);

  const encodedFolder =
    btoa(folder);

  const payload =
    `${encodedFolder}.${expires}`;

  const signature =
    await createSignature(
      payload,
      env.PRIVATE_SECRET
    );

  return (
    `${encodedFolder}.${expires}.${signature}`
  );
}


function privateFolderExists(folder, env) {
  const passwords = getPrivatePasswords(env);

  return Object.prototype.hasOwnProperty.call(
    passwords,
    folder
  );
}


/*
========================================================
MAIN WORKER
========================================================
*/

export default {

  async fetch(request, env) {

    const url =
      new URL(request.url);


    /*
    ======================================================
    PUBLIC MEDIA
    ======================================================

    This replaces the old direct R2 public URL.

    Example:

    /api/media?key=Volleyball/team/event/photo.jpg

    ======================================================
    */

    if (
      url.pathname === "/api/media"
    ) {

      const key =
        url.searchParams.get("key");

      if (!key) {
        return new Response(
          "Missing file key",
          { status: 400 }
        );
      }


      /*
      Never allow the public endpoint
      to access private files.
      */

      if (
        key === "Private" ||
        key.startsWith("Private/")
      ) {

        return new Response(
          "Unauthorized",
          { status: 401 }
        );

      }


      if (!env.GALLERIES) {

        return new Response(
          "Missing GALLERIES R2 binding",
          { status: 500 }
        );

      }


      const object =
        await env.GALLERIES.get(key);


      if (!object) {

        return new Response(
          "File not found",
          { status: 404 }
        );

      }


      return new Response(
        object.body,
        {
          headers: {
            "Content-Type":
              object.httpMetadata?.contentType ||
              "application/octet-stream",

            "Cache-Control":
              "public, max-age=3600"
          }
        }
      );
    }


    /*
    ======================================================
    PRIVATE LOGIN
    ======================================================
    */

    if (
      url.pathname === "/api/private-login"
    ) {

      if (request.method !== "POST") {

        return Response.json(
          {
            error:
              "Method not allowed"
          },
          {
            status: 405
          }
        );

      }


      const body =
        await request.json();


      const folder =
        String(
          body.folder || ""
        )
        .replace(
          /^\/+|\/+$/g,
          ""
        );


      const password =
        String(
          body.password || ""
        );


      const passwords = getPrivatePasswords(env);

      if (
        !Object.prototype.hasOwnProperty.call(
          passwords,
          folder
        )
      ) {

        return Response.json(
          {
            error:
              "Private gallery not found."
          },
          {
            status: 404
          }
        );

      }


      if (
         passwords[folder] !==
         password
      ) {

        return Response.json(
          {
            error:
              "Incorrect password."
          },
          {
            status: 401
          }
        );

      }


      if (!env.PRIVATE_SECRET) {

        return Response.json(
          {
            error:
              "PRIVATE_SECRET is not configured in Cloudflare."
          },
          {
            status: 500
          }
        );

      }


      const cookie =
        await createPrivateCookie(
          folder,
          env
        );


      return Response.json(
        {
          success: true
        },
        {
          headers: {
            "Set-Cookie":
              `dv_private=${encodeURIComponent(cookie)}; ` +
              `HttpOnly; Secure; SameSite=Strict; ` +
              `Path=/; Max-Age=28800`
          }
        }
      );

    }


    /*
    ======================================================
    PRIVATE FOLDER LIST
    ======================================================
    */

    if (
      url.pathname ===
      "/api/private-folders"
    ) {

      const passwords =
       getPrivatePasswords(env);

      const folders =
       Object.keys(
        passwords
       )
        .map(folder => ({
          key: folder,

          name:
            folder.replace(
              /^_private\//,
              ""
            )
        }));


      return Response.json({
        folders
      });

    }


    /*
    ======================================================
    PRIVATE FILE LIST
    ======================================================
    */

    if (
      url.pathname ===
      "/api/private-list"
    ) {

      const folder =
        String(
          url.searchParams.get(
            "folder"
          ) || ""
        )
        .replace(
          /^\/+|\/+$/g,
          ""
        );


      if (
        !privateFolderExists(
          folder
        )
      ) {

        return Response.json(
          {
            error:
              "Private gallery not found."
          },
          {
            status: 404
          }
        );

      }


      const authorized =
        await verifyPrivateSession(
          request,
          folder,
          env
        );


      if (!authorized) {

        return Response.json(
          {
            error:
              "Unauthorized"
          },
          {
            status: 401
          }
        );

      }


      const listed =
        await env.GALLERIES.list({
          prefix:
            `${folder}/`,
          delimiter: "/",
          limit: 1000
        });


      const files =
        (listed.objects || [])

          .filter(
            object =>
              !object.key.endsWith(
                ".DS_Store"
              )
          )

          .filter(
            object =>
              !object.key
                .split("/")
                .pop()
                .startsWith(".")
          )

          .map(object => ({
            key:
              object.key,

            name:
              object.key
                .split("/")
                .pop(),

            size:
              object.size,

            uploaded:
              object.uploaded
          }));


      return Response.json({
        prefix: folder,
        files
      });

    }


    /*
    ======================================================
    PRIVATE MEDIA
    ======================================================
    */

    if (
      url.pathname ===
      "/api/private-media"
    ) {

      const key =
        url.searchParams.get(
          "key"
        );


      if (!key) {

        return new Response(
          "Missing file key",
          {
            status: 400
          }
        );

      }


      const folder =
        key
          .split("/")
          .slice(0, 2)
          .join("/");


      if (
        !privateFolderExists(
          folder
        )
      ) {

        return new Response(
          "Private gallery not found",
          {
            status: 404
          }
        );

      }


      const authorized =
        await verifyPrivateSession(
          request,
          folder,
          env
        );


      if (!authorized) {

        return new Response(
          "Unauthorized",
          {
            status: 401
          }
        );

      }


      const object =
        await env.GALLERIES.get(
          key
        );


      if (!object) {

        return new Response(
          "File not found",
          {
            status: 404
          }
        );

      }


      return new Response(
        object.body,
        {
          headers: {
            "Content-Type":
              object.httpMetadata?.contentType ||
              "application/octet-stream",

            "Cache-Control":
              "private, no-store"
          }
        }
      );

    }


    /*
    ======================================================
    PRIVATE DOWNLOAD
    ======================================================
    */

    if (
      url.pathname ===
      "/api/private-download"
    ) {

      const key =
        url.searchParams.get(
          "key"
        );


      if (!key) {

        return new Response(
          "Missing file key",
          {
            status: 400
          }
        );

      }


      const folder =
        key
          .split("/")
          .slice(0, 2)
          .join("/");


      if (
        !privateFolderExists(
          folder
        )
      ) {

        return new Response(
          "Private gallery not found",
          {
            status: 404
          }
        );

      }


      const authorized =
        await verifyPrivateSession(
          request,
          folder,
          env
        );


      if (!authorized) {

        return new Response(
          "Unauthorized",
          {
            status: 401
          }
        );

      }


      const object =
        await env.GALLERIES.get(
          key
        );


      if (!object) {

        return new Response(
          "File not found",
          {
            status: 404
          }
        );

      }


      const filename =
        key.split("/").pop();


      return new Response(
        object.body,
        {
          headers: {

            "Content-Type":
              object.httpMetadata?.contentType ||
              "application/octet-stream",

            "Content-Disposition":
              `attachment; filename="${filename}"`,

            "Cache-Control":
              "private, no-store"
          }
        }
      );

    }


    /*
    ======================================================
    PUBLIC DOWNLOAD
    ======================================================
    */

    if (
      url.pathname ===
      "/api/download"
    ) {

      const key =
        url.searchParams.get(
          "key"
        );


      if (!key) {

        return new Response(
          "Missing file key",
          {
            status: 400
          }
        );

      }


      /*
      Never allow the public
      download endpoint to access
      private files.
      */

      if (
        key === "_private" ||
        key.startsWith(
          "_private/"
        )
      ) {

        return new Response(
          "Unauthorized",
          {
            status: 401
          }
        );

      }


      if (!env.GALLERIES) {

        return new Response(
          "Missing GALLERIES R2 binding",
          {
            status: 500
          }
        );

      }


      const object =
        await env.GALLERIES.get(
          key
        );


      if (!object) {

        return new Response(
          "File not found",
          {
            status: 404
          }
        );

      }


      const filename =
        key.split("/").pop();


      return new Response(
        object.body,
        {
          headers: {

            "Content-Type":
              object.httpMetadata?.contentType ||
              "application/octet-stream",

            "Content-Disposition":
              `attachment; filename="${filename}"`
          }
        }
      );

    }


    /*
    ======================================================
    SEARCH
    ======================================================
    */

    if (
      url.pathname ===
      "/api/search"
    ) {

      if (!env.GALLERIES) {

        return Response.json(
          {
            error:
              "Missing GALLERIES R2 binding"
          },
          {
            status: 500
          }
        );

      }


      const results = [];


      const sportsList =
        await env.GALLERIES.list({
          delimiter: "/",
          limit: 1000
        });


      const sports =
        (sportsList.delimitedPrefixes || [])

          .filter(
            folder =>
              folder !==
              ".wrangler/"
          )

          .filter(
            folder =>
              folder !==
              "Private/"
          );


      for (
        const sportPrefix
        of sports
      ) {

        const sport =
          sportPrefix.replace(
            /\/$/,
            ""
          );


        const teamsList =
          await env.GALLERIES.list({
            prefix:
              `${sport}/`,
            delimiter: "/",
            limit: 1000
          });


        for (
          const teamPrefix
          of teamsList.delimitedPrefixes || []
        ) {

          const team =
            teamPrefix
              .replace(
                /\/$/,
                ""
              )
              .split("/")
              .pop();


          const eventsList =
            await env.GALLERIES.list({
              prefix:
                `${sport}/${team}/`,
              delimiter: "/",
              limit: 1000
            });


          for (
            const eventPrefix
            of eventsList.delimitedPrefixes || []
          ) {

            const event =
              eventPrefix
                .replace(
                  /\/$/,
                  ""
                )
                .split("/")
                .pop();


            results.push({

              sport,

              team,

              event,

              label:
                `${folderLabelForWorker(sport)} • ` +
                `${folderLabelForWorker(team)} • ` +
                `${folderLabelForWorker(event)}`,

              url:
                `gallery.html?sport=` +
                `${encodeURIComponent(sport)}` +
                `&team=` +
                `${encodeURIComponent(team)}` +
                `&event=` +
                `${encodeURIComponent(event)}`
            });

          }

        }

      }


      return Response.json({
        results
      });

    }


    /*
    ======================================================
    PUBLIC R2 LIST
    ======================================================
    */

    if (
      url.pathname ===
      "/api/list"
    ) {

      let prefix =
        url.searchParams.get(
          "prefix"
        ) || "";


      prefix =
        prefix.replace(
          /^\/+/,
          ""
        );


      /*
      Block all attempts to
      browse private content.
      */

      if (
        prefix === "Private" ||
        prefix.startsWith("Private/")
      ) {

        return Response.json(
          {
            error:
              "Private content."
          },
          {
            status: 403
          }
        );

      }


      if (
        prefix &&
        !prefix.endsWith("/")
      ) {

        prefix += "/";

      }


      if (!env.GALLERIES) {

        return Response.json(
          {
            error:
              "Missing GALLERIES R2 binding"
          },
          {
            status: 500
          }
        );

      }


      const listed =
        await env.GALLERIES.list({
          prefix,
          delimiter: "/",
          limit: 1000
        });


      let folders =
        listed.delimitedPrefixes ||
        [];


      if (prefix === "") {

        folders =
          folders.filter(
            folder =>
              folder !==
              ".wrangler/"
          );

        folders =
          folders.filter(
            folder =>
              folder !==
              "Private/"
          );

      }


      folders =
        folders.sort().reverse();


      const files =
        (listed.objects || [])

          .filter(
            object =>
              !object.key.endsWith(
                ".DS_Store"
              )
          )

          .filter(
            object =>
              !object.key
                .split("/")
                .pop()
                .startsWith(".")
          )

          .map(object => ({

            key:
              object.key,

            name:
              object.key
                .split("/")
                .pop(),

            size:
              object.size,

            uploaded:
              object.uploaded

          }));


      return Response.json({

        prefix,

        folders,

        files

      });

    }


    /*
    ======================================================
    WEBSITE ASSETS
    ======================================================
    */

    return env.ASSETS.fetch(
      request
    );

  }

};