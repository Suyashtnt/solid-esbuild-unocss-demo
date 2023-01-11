{
  inputs.deno2nix.url = "github:SnO2WMaN/deno2nix";
  inputs.devshell.url = "github:numtide/devshell";

  outputs = {
    self,
    nixpkgs,
    flake-utils,
    deno2nix,
    ...
  } @ inputs:
    flake-utils.lib.eachDefaultSystem (
      system: let
        pkgs = import nixpkgs {
          inherit system;
          overlays = with inputs; [
            devshell.overlay
            deno2nix.overlays.default
          ];
        };
      in {
        packages.default = deno2nix.mkExecutable {
          pname = "solid-deno-unocss-demo";
          version = "0.1.0";

          src = ./.;
          bin = "simple";

          entrypoint = "./mod.ts";
          lockfile = "./deno.lock";
          config = "./deno.jsonc";

          allow = {
            all = true;
          };
        };
        devShell = pkgs.devshell.mkShell {
          imports = [(pkgs.devshell.importTOML ./devshell.toml)];
        };
      }
    );
}
