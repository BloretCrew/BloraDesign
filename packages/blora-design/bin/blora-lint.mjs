#!/usr/bin/env node
/**
 * blora-lint — checks a consumer project against the Blora Design rules.
 * Usage: npx blora-lint [paths...] [--json] [--errors-only]
 * Rules and the programmatic API live in ./lint-core.mjs.
 */
import { main } from "./lint-core.mjs";

process.exitCode = main();
