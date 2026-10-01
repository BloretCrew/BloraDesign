import { BloraElement } from "../../core/blora-element.js";
import { t } from "../../core/i18n.js";
import { createBloraIcon } from "../../core/icons.js";
import { openImagePreview } from "../image/image.js";

export const BLORA_IMAGE_STACK_TAG = "blora-image-stack";

export interface ImageStackController {
  destroy(): void;
  next(): void;
  prev(): void;
  goTo(index: number): void;
  getCurrent(): number;
}

const clamp = (value: number, count: number) => Math.max(0, Math.min(count - 1, value));

export function createImageStackController(root: HTMLElement): ImageStackController {
  const tiles = () => Array.from(root.querySelectorAll<HTMLElement>(".blora-image-stack__tile"));
  const counter = () => root.parentElement?.querySelector<HTMLElement>(".blora-image-stack__index");
  let current = clamp(Number(root.dataset.index ?? 0), tiles().length);
  let wheelDistance = 0;
  let wheelDirection = 0;
  let wheelHandled = false;
  let wheelResetTimer: ReturnType<typeof setTimeout> | undefined;
  let startX = 0;
  let startY = 0;
  let pointerId = -1;
  let pointerActive = false;
  let swiped = false;

  const positionPassed = () => {
    tiles().forEach((tile, index) => {
      const distance = index - current;
      tile.style.setProperty("--blora-image-stack-layer", String(distance));
      tile.style.setProperty("--blora-image-stack-shift", `${Math.max(0, current - index) * 22}px`);
      tile.toggleAttribute("data-current", distance === 0);
      tile.toggleAttribute("data-passed", distance < 0);
      tile.classList.toggle("is-hidden", distance < 0 || distance > 2);
      tile.setAttribute("aria-hidden", String(distance !== 0));
      tile.tabIndex = distance < 0 || distance > 2 ? -1 : 0;
    });
  };

  const paint = () => {
    const items = tiles();
    if (!items.length) return;
    root.dataset.index = String(current);
    if (counter()) counter()!.textContent = `${current + 1} / ${items.length}`;
    root.querySelector<HTMLButtonElement>(".blora-image-stack__nav--prev")!.hidden = current === 0;
    root.querySelector<HTMLButtonElement>(".blora-image-stack__nav--next")!.hidden = current === items.length - 1;
    positionPassed();
  };

  const goTo = (index: number) => {
    const count = tiles().length;
    if (!count) return;
    const target = clamp(index, count);
    if (target === current || root.classList.contains("is-flipping")) return;
    const previous = current;
    const entering = target < previous ? tiles()[target] : null;
    const front = tiles()[previous];
    const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    root.classList.add("is-flipping");
    if (entering && !reduced) entering.classList.add("is-returning");
    if (!entering && !reduced) front?.classList.add("is-departing");
    const finish = () => {
      current = target;
      root.classList.remove("is-flipping");
      front?.classList.remove("is-departing");
      entering?.classList.remove("is-returning");
      paint();
      root.dispatchEvent(new CustomEvent("blora-image-stack-change", { bubbles: true, detail: { index: current } }));
    };
    if (reduced) finish(); else setTimeout(finish, 300);
  };
  const next = () => goTo(current + 1);
  const prev = () => goTo(current - 1);

  const onWheel = (event: WheelEvent) => {
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) || Math.abs(event.deltaX) < 1) return;
    event.preventDefault();
    clearTimeout(wheelResetTimer);
    wheelResetTimer = setTimeout(() => { wheelDistance = 0; wheelDirection = 0; wheelHandled = false; }, 600);
    if (wheelHandled) return;
    const direction = Math.sign(event.deltaX);
    if (direction !== wheelDirection) { wheelDistance = 0; wheelDirection = direction; }
    const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? root.clientWidth : 1;
    wheelDistance += Math.abs(event.deltaX) * scale;
    if (wheelDistance >= 140) { wheelHandled = true; direction > 0 ? next() : prev(); }
  };
  const onKey = (event: KeyboardEvent) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    event.key === "ArrowRight" ? next() : prev();
    tiles().find((tile) => !tile.classList.contains("is-hidden"))?.focus();
  };
  const onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0 || (event.target as HTMLElement).closest("button")) return;
    startX = event.clientX; startY = event.clientY; pointerId = event.pointerId; pointerActive = true; swiped = false;
    root.setPointerCapture?.(pointerId);
  };
  const onPointerUp = (event: PointerEvent) => {
    if (!pointerActive || event.pointerId !== pointerId) return;
    pointerActive = false;
    const dx = event.clientX - startX; const dy = event.clientY - startY;
    if (Math.abs(dx) < 35 || Math.abs(dx) < Math.abs(dy)) return;
    swiped = true; dx < 0 ? next() : prev();
  };
  const onClick = (event: MouseEvent) => {
    if (!swiped) return;
    event.preventDefault(); event.stopPropagation(); swiped = false;
  };
  const previousButton = root.querySelector(".blora-image-stack__nav--prev");
  const nextButton = root.querySelector(".blora-image-stack__nav--next");
  root.addEventListener("wheel", onWheel, { passive: false });
  root.addEventListener("keydown", onKey);
  root.addEventListener("pointerdown", onPointerDown);
  root.addEventListener("pointerup", onPointerUp);
  root.addEventListener("pointercancel", () => { pointerActive = false; });
  root.addEventListener("click", onClick, true);
  previousButton?.addEventListener("click", prev);
  nextButton?.addEventListener("click", next);
  if (!root.hasAttribute("tabindex")) root.tabIndex = 0;
  paint();

  return {
    destroy() {
      clearTimeout(wheelResetTimer);
      root.removeEventListener("wheel", onWheel);
      root.removeEventListener("keydown", onKey);
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("pointerup", onPointerUp);
      root.removeEventListener("click", onClick, true);
      previousButton?.removeEventListener("click", prev);
      nextButton?.removeEventListener("click", next);
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
    if (!this.definitions) this.definitions = Array.from(this.children)
      .filter((item) => item.localName === "blora-image-stack-item")
      .map((item) => {
        const image = item.querySelector("img");
        const src = item.getAttribute("src") ?? image?.getAttribute("src") ?? "";
        return { src, alt: item.getAttribute("alt") ?? image?.getAttribute("alt") ?? "", href: item.getAttribute("href") ?? src };
      });
    const count = this.definitions.length;
    const galleryId = `blora-image-stack-gallery-${Math.random().toString(36).slice(2)}`;
    const countButton = this.ownerDocument.createElement("button");
    countButton.type = "button"; countButton.className = "blora-image-stack__count"; countButton.setAttribute("aria-expanded", "false"); countButton.setAttribute("aria-controls", galleryId);
    countButton.setAttribute("aria-label", `展开 ${count} 张照片`); countButton.appendChild(createBloraIcon("square.grid.2x2.fill", 14)); countButton.append(` ${count} 张照片 `);
    const index = this.ownerDocument.createElement("span"); index.className = "blora-image-stack__index"; index.setAttribute("aria-live", "polite"); countButton.append(index);
    const stack = this.ownerDocument.createElement("div");
    stack.className = "blora-image-stack"; stack.dataset.bloraGenerated = ""; stack.setAttribute("role", "group"); stack.setAttribute("aria-label", `${count} 张图片，横向滑动浏览`); stack.dataset.index = "0";
    this.definitions.forEach((item, itemIndex) => {
      const link = this.ownerDocument.createElement("a"); link.className = `blora-image-stack__tile${itemIndex > 2 ? " is-hidden" : ""}`; link.href = item.href; link.target = "_blank"; link.rel = "noopener noreferrer"; link.setAttribute("aria-label", `打开第 ${itemIndex + 1} 张图片`); link.dataset.index = String(itemIndex); link.draggable = false;
      const image = this.ownerDocument.createElement("img"); image.src = item.src; image.alt = item.alt; image.loading = "lazy"; image.draggable = false; link.append(image); stack.append(link);
    });
    stack.append(this.nav("prev"), this.nav("next"));
    const gallery = this.ownerDocument.createElement("div"); gallery.className = "blora-image-gallery"; gallery.id = galleryId; gallery.hidden = true;
    this.definitions.forEach((item, itemIndex) => {
      const link = this.ownerDocument.createElement("a"); link.className = "blora-image-gallery__item"; link.href = item.href; link.target = "_blank"; link.rel = "noopener noreferrer"; link.setAttribute("aria-label", `打开第 ${itemIndex + 1} 张图片`);
      const image = this.ownerDocument.createElement("img"); image.src = item.src; image.alt = item.alt; image.loading = "lazy"; link.append(image); gallery.append(link);
    });
    this.replaceChildren(countButton, stack, gallery);
  }

  private nav(direction: "prev" | "next"): HTMLButtonElement {
    const button = this.ownerDocument.createElement("button"); button.type = "button"; button.className = `blora-image-stack__nav blora-image-stack__nav--${direction}`; button.setAttribute("aria-label", direction === "prev" ? t("preview.prev") : t("preview.next")); button.appendChild(createBloraIcon(direction === "prev" ? "chevron-left" : "chevron-right", 18, this.ownerDocument)); return button;
  }
  protected bindEvents(): void {
    const stack = this.querySelector<HTMLElement>(".blora-image-stack"); if (!stack) return;
    this.controller = createImageStackController(stack); const initial = Number(this.getAttribute("current") ?? 0); if (initial) this.controller.goTo(initial);
    this.listen(stack, "blora-image-stack-change", (event) => { this.reflecting = true; this.setAttribute("current", String((event as CustomEvent<{ index: number }>).detail.index)); this.reflecting = false; });
    const count = this.querySelector<HTMLButtonElement>(".blora-image-stack__count"); const gallery = this.querySelector<HTMLElement>(".blora-image-gallery");
    count?.addEventListener("click", () => { const expanded = count.getAttribute("aria-expanded") === "true"; count.setAttribute("aria-expanded", String(!expanded)); count.setAttribute("aria-label", `${expanded ? "展开" : "收起"} ${this.definitions?.length ?? 0} 张照片`); if (gallery) gallery.hidden = expanded; stack.hidden = !expanded; });
    this.listen(this, "click", (event) => {
      const link = (event.target as HTMLElement).closest<HTMLAnchorElement>(".blora-image-stack__tile, .blora-image-gallery__item");
      if (!link || !this.contains(link)) return;
      event.preventDefault();
      const links = Array.from(this.querySelectorAll<HTMLAnchorElement>(".blora-image-stack__tile, .blora-image-gallery__item"));
      const items = this.definitions?.map((item) => ({ src: item.src, alt: item.alt })) ?? [];
      const index = Math.max(0, links.indexOf(link) % Math.max(1, items.length));
      openImagePreview(items, index);
    });
  }
  protected onDisconnect(): void { this.controller?.destroy(); this.controller = null; }
}

export function defineBloraImageStack(registry: CustomElementRegistry = customElements): void { if (!registry || registry.get(BLORA_IMAGE_STACK_TAG)) return; registry.define(BLORA_IMAGE_STACK_TAG, BloraImageStack); }
