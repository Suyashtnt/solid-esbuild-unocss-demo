import { build, stop } from "esbuild";
import { load, plugin as importMapPlugin } from "esbuild-plugin-import-map";
import unocssPlugin from "../src/esbuild/unocssPlugin.ts";
import { solidPlugin } from "esbuild-plugin-solid";
import { httpImports } from "esbuild-plugin-http-imports";
import { bold, green } from "std/fmt/colors.ts";
import svgPlugin from "../src/esbuild/svgPlugin.ts";

const WATCH = Deno.args.join().includes("--watch");

const SSR_MAP = JSON.parse(Deno.readTextFileSync("./import_map.json"));
const MAP = JSON.parse(Deno.readTextFileSync("./import_map.json"));

SSR_MAP.imports["solid-js"] = "https://esm.sh/solid-js@1.6.8";
SSR_MAP.imports["solid-js/web"] = "https://esm.sh/solid-js@1.6.8/web";
SSR_MAP.imports["@solidjs/router"] = "https://esm.sh/@solidjs/router@0.6.0";

// despite the rest using esm.sh, skypack was used here in the original repo, so I'm keeping it but pinning it
MAP.imports["solid-js"] =
  "https://cdn.skypack.dev/pin/solid-js@v1.6.8-AeIryMOIQQEcyGwPo8BA/mode=imports,min/optimized/solid-js.js";
MAP.imports["solid-js/web"] =
  "https://cdn.skypack.dev/pin/solid-js@v1.6.8-AeIryMOIQQEcyGwPo8BA/mode=imports,min/optimized/solid-js/web.js";
MAP.imports["@solidjs/router"] =
  "https://cdn.skypack.dev/pin/@solidjs/router@v0.6.0-o0QVaDh8TXyRqfScSEeQ/mode=imports,min/optimized/@solidjs/router.js";

export async function build_project() {
  let TIME_START = new Date();

  // SSR
  await load(SSR_MAP);
  await build({
    entryPoints: [
      "src/server.tsx",
    ],
    bundle: true,
    allowOverwrite: true,
    outfile: "./server/server.js",
    platform: "node",
    format: "esm",
    target: "esnext",
    define: {
      "isServer": JSON.stringify(true),
    },
    plugins: [
      svgPlugin({
        type: "solid",
        compile: true,
        solidOptions: {
          hydratable: true,
          generate: "ssr",
        },
      }),
      unocssPlugin(),
      importMapPlugin(),
      solidPlugin({
        hydratable: true,
        generate: "ssr",
      }),
    ],
    incremental: WATCH,
    watch: WATCH,
  });

  await build({
    entryPoints: [
      "server/server.js",
    ],
    bundle: true,
    minify: true,
    allowOverwrite: true,
    outfile: "server/server.js",
    platform: "node",
    format: "esm",
    target: "esnext",
    define: {
      server: JSON.stringify(false),
    },
    plugins: [
      // @ts-expect-error this works
      httpImports({
        defaultToJavascriptIfNothingElseFound: true,
      }),
    ],
    incremental: WATCH,
    watch: WATCH,
  });

  // CSR
  await load(MAP);
  await build({
    entryPoints: [
      "src/client.tsx",
    ],
    allowOverwrite: true,
    bundle: true,
    splitting: true,
    outdir: "temp",
    platform: "browser",
    format: "esm",
    target: "esnext",
    define: {
      server: JSON.stringify(false),
    },
    plugins: [
      unocssPlugin(),
      importMapPlugin(),
      svgPlugin({
        type: "solid",
        compile: true,
        solidOptions: {
          hydratable: true,
        },
      }),
      solidPlugin({
        hydratable: true,
      }),
    ],
    incremental: WATCH,
    watch: WATCH,
  });

  await build({
    entryPoints: [
      "temp/client.js",
    ],
    bundle: true,
    minify: true,
    splitting: true,
    allowOverwrite: true,
    outdir: "public",
    platform: "browser",
    format: "esm",
    target: "esnext",
    define: {
      server: JSON.stringify(false),
    },
    plugins: [
      // @ts-expect-error this works
      httpImports({
        defaultToJavascriptIfNothingElseFound: true,
      }),
    ],
    incremental: WATCH,
    watch: WATCH,
  });

  await Deno.remove("temp", { recursive: true });

  const TIME_END = new Date();
  const TIME_DIFF = new Date().setTime(
    TIME_END.getTime() - TIME_START.getTime(),
  );
  TIME_START = new Date();
  console.log(
    `${bold("[✅]")} Finished Building in ${
      green(`${TIME_DIFF.toString()} milliseconds`)
    }.`,
  );
}

await build_project();
stop();
