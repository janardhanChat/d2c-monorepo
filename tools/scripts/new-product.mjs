#!/usr/bin/env node
/**
 * Scaffold a new product that plugs into the platform.
 *
 *   pnpm new:product <id> "<Name>" "<description>" [--api] [--port 4200]
 *
 * Creates products/<id>/{frontend,domain,db,(api)} with Nx tags scope:<id>.
 * After running: add "scope:<id>" to eslint.config.mjs depConstraints and to the
 * shell's allowed scopes, then register the manifest in apps/web/src/products.ts.
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const args = process.argv.slice(2);
const [id, name, description] = args.filter((a) => !a.startsWith("--") && !/^\d+$/.test(a));
const withApi = args.includes("--api");
const port = args.includes("--port") ? args[args.indexOf("--port") + 1] : "4200";

if (!id || !/^[a-z][a-z0-9-]*$/.test(id) || !name) {
  console.error('Usage: pnpm new:product <id> "<Name>" "<description>" [--api] [--port 4200]');
  process.exit(1);
}
const dir = join(root, "products", id);
if (existsSync(dir)) {
  console.error(`products/${id} already exists`);
  process.exit(1);
}

const write = (rel, content) => {
  const file = join(dir, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content.trimStart());
};
const json = (o) => JSON.stringify(o, null, 2) + "\n";
const pkg = (suffix, desc, type, extra = {}) =>
  json({
    name: `@ap/${id}-${suffix}`,
    version: "0.0.0",
    private: true,
    description: desc,
    type: "module",
    ...extra,
    nx: { tags: [`scope:${id}`, `type:${type}`] },
  });
const scripts = {
  lint: "eslint .",
  typecheck: "tsc --noEmit",
  test: "vitest run --passWithNoTests",
};

// ---- domain ----
write(
  "domain/package.json",
  pkg("domain", `${name} domain model (framework-free)`, "domain", {
    exports: { ".": "./src/index.ts" },
    scripts,
    devDependencies: { "@ap/config": "workspace:*" },
  }),
);
write("domain/tsconfig.json", json({ extends: "@ap/config/tsconfig/base.json", include: ["src"] }));
write(
  "domain/src/index.ts",
  `// ${name} entities, schemas and business rules go here.\nexport {};\n`,
);

// ---- frontend ----
write(
  "frontend/package.json",
  pkg("frontend", `${name} product UI + manifest`, "feature", {
    exports: { ".": "./src/index.ts" },
    scripts,
    dependencies: { "@ap/product-kit": "workspace:*", "@ap/ui": "workspace:*" },
    devDependencies: { "@ap/config": "workspace:*", "@types/react": "^19.0.0", react: "^19.0.0" },
    peerDependencies: { react: "^19.0.0" },
  }),
);
write(
  "frontend/tsconfig.json",
  json({ extends: "@ap/config/tsconfig/react-library.json", include: ["src"] }),
);
write(
  "frontend/src/manifest.ts",
  `
import { defineProduct } from "@ap/product-kit";

export const ${camel(id)}Manifest = defineProduct({
  id: "${id}",
  name: "${name}",
  description: "${description ?? ""}",
  status: "coming-soon",
  routes: { web: "/${id}", api: "/api/${id}" },
  plans: ["growth", "pro"],
  nav: [{ label: "${name}", path: "/${id}" }],
  automation: { triggers: [], actions: [] },
});
`,
);
write("frontend/src/index.ts", `export { ${camel(id)}Manifest } from "./manifest";\n`);

// ---- db ----
write(
  "db/package.json",
  json({
    name: `@ap/${id}-db`,
    version: "0.0.0",
    private: true,
    description: `SQL migrations for the "${id}" schema`,
    nx: { tags: [`scope:${id}`, "type:data"] },
  }),
);
write(
  `db/migrations/0001_${id}_schema.sql`,
  `-- ${name} schema. Owned by ${id}-api only.\ncreate schema if not exists ${id.replace(/-/g, "_")};\n`,
);

// ---- api (optional) ----
if (withApi) {
  write(
    "api/package.json",
    pkg("api", `${name} product API`, "service", {
      scripts: {
        dev: "tsx watch --env-file-if-exists=.env src/main.ts",
        build: "tsup",
        start: "node dist/main.js",
        ...scripts,
      },
      dependencies: {
        "@ap/service-kit": "workspace:*",
        [`@ap/${id}-domain`]: "workspace:*",
        zod: "^4.0.0",
      },
      devDependencies: { "@ap/config": "workspace:*" },
    }),
  );
  write(
    "api/tsconfig.json",
    json({ extends: "@ap/config/tsconfig/node.json", include: ["src", "tsup.config.ts"] }),
  );
  write(
    "api/tsup.config.ts",
    `
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/main.ts"],
  format: ["esm"],
  platform: "node",
  target: "node22",
  sourcemap: true,
  clean: true,
  noExternal: [/^@ap\\//],
});
`,
  );
  write(
    "api/.env.example",
    `PORT=${port}\nLOG_LEVEL=info\nSUPABASE_JWT_SECRET=\nCORE_API_URL=http://localhost:4000\nINTERNAL_SERVICE_TOKEN=\n`,
  );
  write(
    "api/src/main.ts",
    `
import { authFromEnv, baseEnvSchema, createService, loadEnv, startService } from "@ap/service-kit";
import { z } from "zod";

const env = loadEnv(baseEnvSchema.extend({ PORT: z.coerce.number().default(${port}) }));

const app = await createService({
  name: "${id}-api",
  logLevel: env.LOG_LEVEL,
  corsOrigins: env.CORS_ORIGINS,
  auth: authFromEnv(env),
});

// registerXRoutes(app, ...)

await startService(app, env.PORT, env.HOST);
`,
  );
}

write(
  "README.md",
  `
# ${name}

${description ?? ""}

| Folder | Nx tags | Purpose |
| --- | --- | --- |
| \`domain/\` | scope:${id}, type:domain | Entities, schemas, rules (no framework code) |
| \`frontend/\` | scope:${id}, type:feature | UI + \`product manifest\` mounted by apps/web |
| \`db/\` | scope:${id}, type:data | Migrations for the \`${id}\` Postgres schema |
${withApi ? `| \`api/\` | scope:${id}, type:service | Fastify service |\n` : ""}
Rules: this product may import only \`scope:${id}\` and \`scope:shared\` code. Talk to other products through events and APIs.
`,
);

console.log(`Created products/${id}. Next:
  1. pnpm install
  2. Add scope:${id} to eslint.config.mjs (ownership rules + scope:shell list)
  3. Register ${camel(id)}Manifest in apps/web/src/products.ts`);

function camel(s) {
  return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}
