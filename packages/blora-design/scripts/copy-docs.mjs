/**
 * Ship the user-facing documentation inside the npm package (dist/docs/) so
 * AI agents working in a consumer project can read the rules offline.
 */
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";

const packageDir = resolve(import.meta.dirname, "..");
const repoRoot = resolve(packageDir, "..", "..");
const outDir = resolve(packageDir, "dist", "docs");

const documents = [
  "patterns.md",
  "standards.md",
  "guide.md",
  "framework.md",
  "migration/from-any-ui-to-blora-design.md",
];

rmSync(outDir, { recursive: true, force: true });
for (const document of documents) {
  const source = resolve(repoRoot, "docs", document);
  if (!existsSync(source)) {
    console.error(`[copy-docs] missing docs/${document}`);
    process.exit(1);
  }
  const target = resolve(outDir, document);
  mkdirSync(dirname(target), { recursive: true });
  cpSync(source, target);
}
console.log(`[copy-docs] copied ${documents.length} documents into dist/docs`);
