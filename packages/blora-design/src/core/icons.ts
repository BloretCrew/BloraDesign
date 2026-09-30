/**
 * Lucide icon factory.
 *
 * Every UI/status/navigation glyph is built from `BLORA_ICON_DATA`, which is
 * generated verbatim from lucide-static (ISC) — there is only one source of
 * truth for icon geometry. The default core bundle carries a curated set.
 * For any other Lucide icon, load the opt-in full table
 * (`@bloret-crew/blora-design/icons-full` / `icons-full.global.js`) once;
 * `registerBloraIcons` merges it in, after which any Lucide name works without
 * a framework rebuild. Brand marks (navbar logo) and non-icon drawings
 * (progress rings) are the only hand-authored SVGs in components.
 */
import { BLORA_ICON_DATA, type BloraIconNode } from "./icons.data.js";
import { hasExtraIcon, lookupExtraIcon } from "./icons-registry.js";

export { registerBloraIcons } from "./icons-registry.js";

/** Curated names (autocompleted) plus any string — full set arrives at runtime. */
export type BloraIconName =
  | "arrow-down"
  | "arrow-down-up"
  | "arrow-up"
  | "ban"
  | "bell"
  | "calendar"
  | "camera"
  | "chart"
  | "check"
  | "chevron-down"
  | "chevron-left"
  | "chevron-right"
  | "circle-alert"
  | "circle-check"
  | "circle-x"
  | "clock"
  | "close"
  | "copy"
  | "document"
  | "document-add"
  | "download"
  | "ellipsis"
  | "external-link"
  | "eye"
  | "eye-off"
  | "filter"
  | "flame"
  | "folder"
  | "grip"
  | "heart"
  | "home"
  | "image"
  | "inbox"
  | "info"
  | "key"
  | "link"
  | "lock"
  | "log-out"
  | "mail"
  | "menu"
  | "message"
  | "mic"
  | "minus"
  | "moon"
  | "palette"
  | "pencil"
  | "phone"
  | "plus"
  | "refresh-cw"
  | "search"
  | "settings"
  | "share"
  | "smile"
  | "sparkles"
  | "star"
  | "sun"
  | "thumbs-up"
  | "trash"
  | "triangle-alert"
  | "upload"
  | "user"
  | (string & {});

const SVG_NS = "http://www.w3.org/2000/svg";

function svgNode(
  doc: Document,
  tag: BloraIconNode["tag"],
  attributes: Record<string, string>,
): SVGElement {
  const node = doc.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
  return node;
}

/** Create a decorative, currentColor icon without parsing HTML strings. */
export function createBloraIcon(
  name: BloraIconName,
  size = 16,
  doc: Document = document,
): SVGSVGElement {
  const svg = doc.createElementNS(SVG_NS, "svg");
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("data-blora-icon", name);

  const nodes = BLORA_ICON_DATA[name] ?? lookupExtraIcon(name);
  if (nodes) {
    for (const node of nodes) {
      const el = svgNode(doc, node.tag, node.attrs);
      svg.appendChild(el);
    }
  }

  return svg;
}

export function isBloraIconName(name: string): name is BloraIconName {
  return Object.prototype.hasOwnProperty.call(BLORA_ICON_DATA, name) || hasExtraIcon(name);
}
