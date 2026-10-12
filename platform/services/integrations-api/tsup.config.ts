import { defineConfig } from "tsup";

/**
 * Bundle the service AND its dependencies into one self-contained dist/main.js,
 * so the runtime image needs no node_modules. Workspace packages (@ap/*) ship TS
 * source and are compiled in here too. The banner gives bundled CommonJS deps the
 * `require` / `__dirname` they expect inside an ES module.
 */
export default defineConfig({
  entry: ["src/main.ts"],
  format: ["esm"],
  platform: "node",
  target: "node22",
  sourcemap: true,
  clean: true,
  noExternal: [/.*/],
  banner: {
    js: [
      'import { createRequire as __cr } from "node:module";',
      'import { fileURLToPath as __fu } from "node:url";',
      'import { dirname as __dn } from "node:path";',
      "const require = __cr(import.meta.url);",
      "const __filename = __fu(import.meta.url);",
      "const __dirname = __dn(__filename);",
    ].join("\n"),
  },
});
