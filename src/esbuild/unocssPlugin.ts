import { Plugin } from "esbuild";
import { UserConfig } from "@unocss/core";
import presetUno from "@unocss/preset-uno";
import presetAttributify from "@unocss/preset-attributify";
import transformerJSX from "@unocss/transformer-attributify-jsx";
import { join } from "std/path/mod.ts";
import { defaultInclude } from "./unocssSharedCopy/defaults.ts";
import { createContext } from "./unocssSharedCopy/context.ts";
import { applyTransformers } from "./unocssSharedCopy/transformers.ts";

export const unocssPlugin = (options: UserConfig = {}): Plugin => {
  return {
    name: "unocss:esbuild",
    setup(build) {
      const ctx = createContext({
        ...options,
        transformers: [transformerJSX()],
      }, {
        presets: [
          presetUno(),
          presetAttributify(),
        ],
      });
      const { uno, tokens, filter, extract } = ctx;

      const filesToProcess = new Set<string>();

      // regex to match: ./uno.css, uno.css
      build.onResolve({ filter: /(^|\.\/)uno\.css$/ }, (args) => ({
        path: args.path,
        namespace: "unocss",
      }));

      // search for tsx, jsx, and html files to add to the filesToProcess
      build.onResolve({ filter: defaultInclude[0] }, (args) => {
        filesToProcess.add(join(args.resolveDir, args.path));
        return {};
      });

      build.onLoad({ filter: /.*/, namespace: "unocss" }, async () => {
        const files = Array.from(filesToProcess);

        async function extractFile(file: string) {
          const code = await Deno.readTextFile(file);
          if (!filter(code, file)) {
            return;
          }
          const preTransform = await applyTransformers(ctx, code, file, "pre");
          const defaultTransform = await applyTransformers(
            ctx,
            preTransform?.code || code,
            file,
          );
          await applyTransformers(
            ctx,
            defaultTransform?.code || preTransform?.code || code,
            file,
            "post",
          );
          return await extract(preTransform?.code || code, file);
        }

        for (const file of files) {
          await extractFile(file);
        }

        const { css } = await uno.generate(tokens, { minify: true });
        return {
          contents: css,
          loader: "css",
        };
      });
    },
  };
};

export default unocssPlugin;
