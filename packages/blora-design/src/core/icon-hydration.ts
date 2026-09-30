/**
 * Declarative icon hydration.
 *
 * `data-icon="name"` works on `.blora-button`, `.blora-badge` and on any empty
 * placeholder element such as `<span data-icon="key" aria-hidden="true"></span>`.
 * `hydrateIcons()` fills them once; `observeIcons()` (started by the `auto`
 * entry and `Blora.autoDefine()`) also covers content that frameworks render
 * later, so applications never need their own `[data-icon]` loop.
 */
import { enhanceBadges } from "../components/badge/badge.js";
import { enhanceButtons } from "../components/button/button.js";
import { createBloraIcon, isBloraIconName } from "./icons.js";

const PLACEHOLDER_EXCLUDED = ".blora-button, .blora-badge";

function hydratePlaceholder(host: Element): void {
  if (host.matches(PLACEHOLDER_EXCLUDED)) return;
  const name = host.getAttribute("data-icon");
  if (!name || !isBloraIconName(name)) return;
  const current = host.querySelector(":scope > svg[data-blora-icon]");
  if (current?.getAttribute("data-blora-icon") === name) return;
  /* Only fill empty placeholders; never touch authored children. */
  if (!current && host.childElementCount > 0) return;
  const requested = Number(host.getAttribute("data-icon-size"));
  const icon = createBloraIcon(name, requested > 0 ? requested : 16, host.ownerDocument);
  if (!(requested > 0)) {
    icon.setAttribute("width", "1em");
    icon.setAttribute("height", "1em");
  }
  if (current) current.replaceWith(icon);
  else host.append(icon);
  if (!host.hasAttribute("aria-label") && !host.hasAttribute("role")) {
    host.setAttribute("aria-hidden", "true");
  }
}

/** Fill every `[data-icon]` host inside (and including) `root`. Idempotent. */
export function hydrateIcons(root: ParentNode = document): void {
  if (typeof document === "undefined") return;
  enhanceButtons(root);
  enhanceBadges(root);
  if (root instanceof Element && root.hasAttribute("data-icon")) hydratePlaceholder(root);
  root.querySelectorAll("[data-icon]").forEach(hydratePlaceholder);
}

const observed = new WeakMap<Document, () => void>();

/**
 * Hydrate now and keep hydrating icons that are added later or whose
 * `data-icon` changes. Returns a cleanup function; calling it twice for the
 * same document reuses the first observer.
 */
export function observeIcons(doc: Document = document): () => void {
  if (typeof MutationObserver === "undefined" || !doc?.documentElement) return () => {};
  const existing = observed.get(doc);
  if (existing) return existing;

  const run = () => hydrateIcons(doc);
  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }

  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === "attributes") {
        const target = record.target as Element;
        /* A changed name replaces the icon instead of keeping the old one. */
        target.querySelector(":scope > svg[data-blora-icon]")?.remove();
        hydrateIcons(target);
        continue;
      }
      record.addedNodes.forEach((node) => {
        if (node.nodeType === 1) hydrateIcons(node as Element);
      });
    }
  });
  observer.observe(doc.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["data-icon"],
  });

  const stop = () => {
    observer.disconnect();
    observed.delete(doc);
  };
  observed.set(doc, stop);
  return stop;
}
