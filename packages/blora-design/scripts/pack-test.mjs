/**
 * Pack fixture for the published main package.
 * Builds, packs, installs the tarball in isolation, and checks ESM, SSR,
 * CSS subpaths, TypeScript declarations, and required package files.
 */
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync, execSync, spawnSync } from "node:child_process";

const packageDir = resolve(import.meta.dirname, "..");
const typescriptCli = resolve(
  packageDir,
  "..",
  "..",
  "node_modules",
  "typescript",
  "lib",
  "tsc.js",
);
const packageJson = JSON.parse(readFileSync(join(packageDir, "package.json"), "utf8"));
const packageName = packageJson.name;
const packageVersion = packageJson.version;

console.log("[pack:test] Building package...");
execSync("pnpm build", { cwd: packageDir, stdio: "inherit" });

console.log("[pack:test] Packing...");
execSync("pnpm pack", { cwd: packageDir, stdio: "inherit" });

const tarballName = readdirSync(packageDir).find(
  (file) => file.startsWith("bloret-crew-blora-design-") && file.endsWith(".tgz"),
);
if (!tarballName) throw new Error("[pack:test] No tarball found after pnpm pack");

const tarballPath = join(packageDir, tarballName);
const fixtureDir = mkdtempSync(join(tmpdir(), "blora-packtest-"));

try {
  writeFileSync(
    join(fixtureDir, "package.json"),
    JSON.stringify({ name: "blora-pack-fixture", private: true, type: "module" }, null, 2),
  );
  console.log(`[pack:test] Installing ${tarballName}...`);
  execSync(`npm install --ignore-scripts ${JSON.stringify(tarballPath)}`, {
    cwd: fixtureDir,
    stdio: "inherit",
  });

  writeFileSync(
    join(fixtureDir, "test.mjs"),
    [
      `// SSR import: importing the package should not throw even without DOM`,
      `import { VERSION, isBrowser } from ${JSON.stringify(packageName)};`,
      `if (VERSION !== ${JSON.stringify(packageVersion)}) throw new Error("Version mismatch: " + VERSION);`,
      `if (isBrowser() !== false) throw new Error("SSR import unexpectedly detected a browser");`,
      `console.log("[pack:test] ESM and SSR import OK:", VERSION);`,
      "",
      `// Dynamic import of dialog (requires DOM, skip in SSR)`,
      `console.log("[pack:test] SSR-safe check: package entry does not reference HTMLElement at load time");`,
      "",
    ].join("\n"),
  );
  execFileSync("node", ["test.mjs"], { cwd: fixtureDir, stdio: "inherit" });

  const packageInstallDir = join(fixtureDir, "node_modules", "@bloret-crew", "blora-design");
  for (const file of [
    "dist/index.js",
    "dist/index.d.ts",
    "dist/tokens.css",
    "dist/tokens.dark.css",
    "dist/tokens.themes.css",
    "dist/token-manifest.json",
    "llms.txt",
    "bin/blora-lint.mjs",
    "bin/lint-core.mjs",
    "contracts/button.contract.json",
    "schemas/component-contract.schema.json",
    "dist/docs/patterns.md",
    "dist/docs/standards.md",
    "dist/docs/guide.md",
    "dist/docs/framework.md",
    "dist/docs/migration/from-any-ui-to-blora-design.md",
  ]) {
    if (!existsSync(join(packageInstallDir, file))) {
      throw new Error(`[pack:test] Installed package is missing ${file}`);
    }
  }

  // Walk package.json exports and ensure each mapped file exists in the installed tree.
  const installedPkg = JSON.parse(readFileSync(join(packageInstallDir, "package.json"), "utf8"));
  const cliPath = join(packageInstallDir, installedPkg.bin["blora-lint"]);
  const cliShim = join(
    fixtureDir,
    "node_modules",
    ".bin",
    process.platform === "win32" ? "blora-lint.cmd" : "blora-lint",
  );
  if (!existsSync(cliShim)) throw new Error("[pack:test] blora-lint bin was not installed");
  writeFileSync(
    join(fixtureDir, "valid.html"),
    '<button type="button" class="blora-button" data-variant="primary" data-icon="plus">Create</button>',
  );
  const validFindings = JSON.parse(
    execFileSync(process.execPath, [cliPath, "valid.html", "--json"], {
      cwd: fixtureDir,
      encoding: "utf8",
    }),
  );
  if (validFindings.length !== 0) {
    throw new Error(
      `[pack:test] blora-lint rejected valid consumer markup: ${JSON.stringify(validFindings)}`,
    );
  }
  writeFileSync(join(fixtureDir, "invalid.css"), ".app { color: var(--blora-not-a-token); }");
  const invalidCheck = spawnSync(process.execPath, [cliPath, "invalid.css", "--json"], {
    cwd: fixtureDir,
    encoding: "utf8",
  });
  if (invalidCheck.error) throw invalidCheck.error;
  const invalidFindings = JSON.parse(invalidCheck.stdout);
  if (
    invalidCheck.status !== 1 ||
    !invalidFindings.some((finding) => finding.rule === "unknown-token")
  ) {
    throw new Error("[pack:test] blora-lint did not report an unknown token with exit code 1");
  }
  console.log("[pack:test] Installed blora-lint and offline migration docs OK");

  const exportKeys = Object.keys(installedPkg.exports || {});
  let exportChecked = 0;
  for (const key of exportKeys) {
    if (key === "./package.json") continue;
    const target = installedPkg.exports[key];
    const paths = [];
    if (typeof target === "string") paths.push(target);
    else if (target && typeof target === "object") {
      for (const v of Object.values(target)) {
        if (typeof v === "string") paths.push(v);
      }
    }
    for (const rel of paths) {
      // exports point at ./dist/... relative to package root
      const abs = join(packageInstallDir, rel.replace(/^\.\//, ""));
      if (!existsSync(abs)) {
        throw new Error(`[pack:test] export ${key} -> ${rel} missing in packed install`);
      }
      exportChecked += 1;
    }
  }
  console.log(
    `[pack:test] Verified ${exportChecked} export path(s) from ${exportKeys.length} export keys`,
  );

  const css = readFileSync(join(packageInstallDir, "dist", "tokens.css"), "utf8");
  if (!css.includes("--blora-color-surface-canvas")) {
    throw new Error("[pack:test] tokens.css is missing semantic tokens");
  }

  const typeFixture = join(fixtureDir, "type-fixture");
  mkdirSync(typeFixture);
  writeFileSync(
    join(typeFixture, "index.ts"),
    `import { VERSION } from ${JSON.stringify(packageName)};\nconst version: string = VERSION;\nconsole.log(version);\n`,
  );
  writeFileSync(
    join(typeFixture, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          module: "ESNext",
          moduleResolution: "Bundler",
          noEmit: true,
          strict: true,
          target: "ES2022",
        },
        include: ["index.ts"],
      },
      null,
      2,
    ),
  );
  execFileSync(process.execPath, [typescriptCli, "-p", "tsconfig.json"], {
    cwd: typeFixture,
    stdio: "inherit",
  });

  console.log("[pack:test] All package fixture checks passed.");
} finally {
  rmSync(fixtureDir, { recursive: true, force: true });
  rmSync(tarballPath, { force: true });
}
