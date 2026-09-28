import { BloraElement } from "../../core/blora-element.js";
import { t } from "../../core/i18n.js";
import { createBloraIcon } from "../../core/icons.js";

export const BLORA_IMAGE_STACK_TAG = "blora-image-stack";

export interface ImageStackController {
  destroy(): void;
  next(): void;
  prev(): void;
  goTo(index: number): void;
  getCurrent(): number;
}

function clamp(index: number, count: number): number {
  return Math.max(0, Math.min(count - 1, index));
}

export function createImageStackController(root: HTMLElement): ImageStackController {
  const tiles = () => Array.from(root.querySelectorAll<HTMLElement>(".blora-image-stack__tile"));
  let current = clamp(Number(root.dataset.index ?? 0), tiles().length);
  let wheelAccumulator = 0;
  let wheelReset: ReturnType<typeof setTimeout> | null = null;
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let pointerId = -1;

  const paint = () => {
    const items = tiles();
    items.forEach((tile, index) => {
      const distance = index - current;
      tile.toggleAttribute("data-current", distance === 0);
      tile.toggleAttribute("data-passed", distance < 0);
      tile.toggleAttribute("aria-hidden", distance !== 0);
      tile.tabIndex = distance === 0 ? 0 : -1;
      tile.style.setProperty("--blora-image-stack-layer", String(Math.max(0, 3 - distance)));
    });
    root.dataset.index = String(current);
    root.querySelector<HTMLElement>(".blora-image-stack__index")!.textContent =
      `${current + 1} / ${items.length}`;
    const prev = root.querySelector<HTMLButtonElement>(".blora-image-stack__nav--prev");
    const next = root.querySelector<HTMLButtonElement>(".blora-image-stack__nav--next");
    if (prev) prev.hidden = current === 0;
    if (next) next.hidden = current === items.length - 1;
  };

  const goTo = (index: number) => {
    const count = tiles().length;
    if (!count) return;
    const next = clamp(index, count);
    if (next === current) return;
    current = next;
    paint();
    root.dispatchEvent(new CustomEvent("blora-image-stack-change", { bubbles: true, detail: { index: current } }));
  };
  const next = () => goTo(current + 1);
  const prev = () => goTo(current - 1);

  const onWheel = (event: WheelEvent) => {
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    event.preventDefault();
    wheelAccumulator += event.deltaX;
    if (wheelReset) clearTimeout(wheelReset);
    wheelReset = setTimeout(() => { wheelAccumulator = 0; }, 600);
    if (Math.abs(wheelAccumulator) >= 140) {
      const amount = wheelAccumulator > 0 ? 1 : -1;
      wheelAccumulator = 0;
      if (amount > 0) next();
      else prev();
    }
  };
  const onKey = (event: KeyboardEvent) => {
    if (event.key === "ArrowRight") { event.preventDefault(); next(); }
    else if (event.key === "ArrowLeft") { event.preventDefault(); prev(); }
  };
  const onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0 || (event.target as HTMLElement).closest("button")) return;
    dragging = true; startX = event.clientX; startY = event.clientY; pointerId = event.pointerId;
    root.setPointerCapture?.(pointerId);
  };
  const onPointerUp = (event: PointerEvent) => {
    if (!dragging || event.pointerId !== pointerId) return;
    dragging = false;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) dx < 0 ? next() : prev();
  };

  root.addEventListener("wheel", onWheel, { passive: false });
  root.addEventListener("keydown", onKey);
  root.addEventListener("pointerdown", onPointerDown);
  root.addEventListener("pointerup", onPointerUp);
  root.addEventListener("pointercancel", onPointerUp);
  root.querySelector(".blora-image-stack__nav--prev")?.addEventListener("click", prev);
  root.querySelector(".blora-image-stack__nav--next")?.addEventListener("click", next);
  if (!root.hasAttribute("tabindex")) root.tabIndex = 0;
  paint();

  return {
    destroy() {
      if (wheelReset) clearTimeout(wheelReset);
      root.removeEventListener("wheel", onWheel);
      root.removeEventListener("keydown", onKey);
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("pointerup", onPointerUp);
      root.removeEventListener("pointercancel", onPointerUp);
    },
    next, prev, goTo, getCurrent: () => current,
  };
}

interface ImageStackItem { src: string; alt: string; href: string; }

export class BloraImageStack extends BloraElement {
  private controller: ImageStackController | null = null;
  private definitions: ImageStackItem[] | null = null;
  private reflecting = false;

  static get observedAttributes(): string[] { return ["current", "label"]; }
  get current(): number { return this.controller?.getCurrent() ?? Number(this.getAttribute("current") ?? 0); }
  set current(value: number) { this.setAttribute("current", String(value)); }
  next(): void { this.controller?.next(); }
  prev(): void { this.controller?.prev(); }
  goTo(index: number): void { this.controller?.goTo(index); }

  attributeChangedCallback(): void { if (this.isConnectedInternal && !this.reflecting) this.sync(); }

  protected render(): void {
    if (!this.definitions) {
      this.definitions = Array.from(this.children)
        .filter((item) => item.localName === "blora-image-stack-item")
        .map((item) => {
          const image = item.querySelector("img");
          const src = item.getAttribute("src") ?? image?.getAttribute("src") ?? "";
          return { src, alt: item.getAttribute("alt") ?? image?.getAttribute("alt") ?? "", href: item.getAttribute("href") ?? src };
        });
    }
    const root = this.ownerDocument.createElement("div");
    root.className = "blora-image-stack";
    root.dataset.bloraGenerated = "";
    root.setAttribute("role", "group");
    root.setAttribute("aria-label", this.getAttribute("label") ?? t("imageStack.label"));
    const count = this.definitions.length;
    const index = this.ownerDocument.createElement("span");
    index.className = "blora-image-stack__index";
    index.setAttribute("aria-live", "polite");
    const prev = this.nav("prev");
    const next = this.nav("next");
    root.append(index, prev);
    this.definitions.forEach((item, itemIndex) => {
      const link = this.ownerDocument.createElement("a");
      link.className = "blora-image-stack__tile";
      link.href = item.href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.dataset.index = String(itemIndex);
      link.setAttribute("aria-label", `${item.alt || "图片"}，第 ${itemIndex + 1} / ${count} 张`);
      const image = this.ownerDocument.createElement("img");
      image.src = item.src; image.alt = item.alt; image.loading = "lazy";
      link.append(image); root.append(link);
    });
    root.append(next);
    this.replaceChildren(root);
  }

  private nav(direction: "prev" | "next"): HTMLButtonElement {
    const button = this.ownerDocument.createElement("button");
    button.type = "button";
    button.className = `blora-image-stack__nav blora-image-stack__nav--${direction}`;
    button.setAttribute("aria-label", direction === "prev" ? t("preview.prev") : t("preview.next"));
    button.appendChild(createBloraIcon(direction === "prev" ? "chevron-left" : "chevron-right", 18, this.ownerDocument));
    return button;
  }

  protected bindEvents(): void {
    const root = this.querySelector<HTMLElement>(".blora-image-stack");
    if (!root) return;
    this.controller = createImageStackController(root);
    const initial = Number(this.getAttribute("current") ?? 0);
    if (initial) this.controller.goTo(initial);
    this.listen(root, "blora-image-stack-change", (event) => {
      this.reflecting = true;
      this.setAttribute("current", String((event as CustomEvent<{ index: number }>).detail.index));
      this.reflecting = false;
    });
  }
  protected onDisconnect(): void { this.controller?.destroy(); this.controller = null; }
}

export function defineBloraImageStack(registry: CustomElementRegistry = customElements): void {
  if (!registry || registry.get(BLORA_IMAGE_STACK_TAG)) return;
  registry.define(BLORA_IMAGE_STACK_TAG, BloraImageStack);
}
