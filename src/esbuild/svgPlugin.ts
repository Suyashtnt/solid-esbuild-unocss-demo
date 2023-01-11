import { Config, optimize } from "svgo";
import { Loader, Plugin } from "esbuild";
import { basename, parse } from "std/path/mod.ts";

import { transformAsync } from "@babel/core";
import solid from "babel-preset-solid";
import ts from "@babel/preset-typescript";
import { SolidOptions } from "esbuild-plugin-solid";

export const svgPlugin = (options: {
  type?: "text" | "element" | "solid";
  solidOptions?: SolidOptions;
  compile?: boolean;
  namespace?: string;
  minify?: boolean;
  minifyOptions?: Config;
} = {}): Plugin => ({
  name: "svg",
  setup(build) {
    const {
      type = "text",
      namespace = "icon",
      minify = false,
      minifyOptions = {} as Config,
    } = options;
    const loader: Loader = type === "text" ? "text" : "js";

    build.onLoad({ filter: /\.svg$/ }, async (args) => {
      const fileName = basename(args.path, ".svg");
      let contents = await Deno.readTextFile(args.path);

      if (minify) {
        contents = optimize(contents, {
          path: args.path,
          ...minifyOptions,
        }).data;
      }

      if (type === "element") {
        contents = `
					class SvgIcon extends HTMLElement {
						connectedCallback() {
							this.innerHTML = \`${contents}\`;
						}
					}
					window.customElements.define('${
          namespace ? `${namespace}-` : ""
        }${fileName}', SvgIcon);
					export default SvgIcon;
				`;
      }

      if (type === "solid") {
        contents = compileSvg(contents);

        if (options.compile) {
          const { name } = parse(args.path);
          const filename = `${name}.jsx`;

          const transformed = await transformAsync(contents, {
            filename,
            presets: [[solid, options.solidOptions], ts],
            sourceMaps: "inline",
          });

          if (!transformed) throw new Error("Failed to transform svg");

          const { code } = transformed;

          if (!code) throw new Error("Failed to transform svg");

          contents = code;
        }
      }

      return { contents, loader };
    });
  },
});

function compileSvg(source: string) {
  const svgWithProps = source.replace(/([{}])/g, "{'$1'}").replace(
    /(?<=<svg.*?)(>)/i,
    "{...props}>",
  );
  return `export default (props = {}) => ${svgWithProps}`;
}

export default svgPlugin;
