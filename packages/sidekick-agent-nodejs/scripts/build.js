const { build } = require("esbuild");

const makeAllPackagesExternalPlugin = {
    name: 'make-all-packages-external',
    setup(build) {
      let filter = /^[^.\/]|^\.[^.\/]|^\.\.[^\/]/ // Must not start with "/" or "./" or "../"
      build.onResolve({ filter }, args => ({ path: args.path, external: true }))
    },
}

build({
    bundle: true,
    minify: true,
    target: "node14",
    platform: "node",
    entryPoints: ["./src/index.ts"],
    outfile: "./dist/index.js",
    plugins: [
        makeAllPackagesExternalPlugin,
    ],
});