/**
 * CDN / classic-script global build entry.
 * Attaches a `Blora` object on `globalThis` with main package exports + CE define helpers.
 */
import * as api from "../index.js";
import { defineAllBloraElements } from "../auto.js";

export type BloraGlobal = typeof api & {
  autoDefine(): void;
};

const Blora: BloraGlobal = {
  ...api,
  autoDefine() {
    defineAllBloraElements();
    if (typeof document !== "undefined") api.observeIcons(document);
  },
};

const g = globalThis as typeof globalThis & { Blora?: BloraGlobal };
g.Blora = Blora;

export default Blora;
