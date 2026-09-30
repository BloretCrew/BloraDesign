/**
 * Optional Lucide hydration for native `.blora-badge[data-icon]`.
 * CSS does not depend on this helper — authors may also put an SVG child in.
 */

import { createBloraIcon, isBloraIconName } from "../../core/icons.js";

function badgeGraphemeCount(text: string): number {
  const trimmed = text.replace(/\s+/g, "");
  if (!trimmed) return 0;
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    return [...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(trimmed)].length;
  }
  return [...trimmed].length;
}

function syncBadgeShape(badge: HTMLElement): void {
  const variant = badge.getAttribute("data-variant");
  if (variant === "dot" || variant === "pill") {
    if (badge.getAttribute("data-shape") === "circle") badge.removeAttribute("data-shape");
    return;
  }
  const text = [...badge.childNodes]
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent ?? "")
    .join("");
  const chars = badgeGraphemeCount(text);
  const hasIcon = Boolean(badge.querySelector(":scope > svg"));
  if (chars === 1 && !hasIcon) badge.setAttribute("data-shape", "circle");
  else if (chars > 1) badge.setAttribute("data-shape", "pill");
  else if (badge.getAttribute("data-shape") === "circle") badge.removeAttribute("data-shape");
}

/**
 * Hydrate `.blora-badge[data-icon]` with `createBloraIcon()`.
 * Single-character labels get `data-shape="circle"` so a "3" is a disc,
 * not a short capsule. Safe to call more than once.
 */
export function enhanceBadges(root: ParentNode = document): void {
  if (typeof document === "undefined") return;
  const badges = [...root.querySelectorAll<HTMLElement>(".blora-badge")];
  if (root instanceof HTMLElement && root.matches(".blora-badge")) badges.unshift(root);
  badges.forEach((badge) => {
    const name = badge.getAttribute("data-icon");
    if (name && isBloraIconName(name) && !badge.querySelector(":scope > svg[data-blora-icon]")) {
      const icon = createBloraIcon(name, 12, badge.ownerDocument);
      icon.dataset.bloraIcon = name;
      if (badge.getAttribute("data-icon-position") === "end") badge.append(icon);
      else badge.prepend(icon);
    }
    syncBadgeShape(badge);
  });
}
