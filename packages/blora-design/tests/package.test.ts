import { describe, it, expect } from "vitest";
import * as api from "../src/index.js";
import { VERSION, isBrowser } from "../src/index.js";

describe("package entry", () => {
  it("exports the correct version", () => {
    expect(VERSION).toBe("2.1.0");
  });

  it("isBrowser returns true in jsdom", () => {
    expect(isBrowser()).toBe(true);
  });

  it("does not expose legacy controllers for migrated Composite CEs", () => {
    expect("createAccordionController" in api).toBe(false);
    expect("createNavbarController" in api).toBe(false);
    expect("createTreeSelectController" in api).toBe(false);
    expect("createTableController" in api).toBe(true);
    expect("createFormController" in api).toBe(true);
  });
});
