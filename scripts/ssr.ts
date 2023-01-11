import { contentType } from "std/media_types/mod.ts";
import { renderToStream } from "solid-js/web";
import App from "../server/server.js";

const root = Deno.cwd();

const port = 3000;
Deno.serve(async (req) => {
  const staticDir = `${root}/public`;
  const path = new URL(req.url).pathname;
  const file = `${staticDir}${path}`;

  try {
    const stat = await Deno.stat(file);
    if (stat.isDirectory) throw new Error("is directory");
    const size = stat.size;
    const body = (await Deno.open(file)).readable;

    console.log("serving", path);
    const extension = path.split(".").pop();
    if (!extension) throw new Error("no extension");

    return new Response(body, {
      headers: {
        "Content-Length": size.toString(),
        "Content-Type": contentType(extension) || "application/octet-stream",
      },
    });
  } catch {
    console.log("rendering", req.url);
    const stream = renderToStream(App);
    const { readable, writable } = new TransformStream();
    stream.pipeTo(writable);

    return new Response(readable, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  }
}, { port });
